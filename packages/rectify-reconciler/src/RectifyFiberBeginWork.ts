import { Fiber, isFunction, shallowEqual, LazyComponent as LazyComponentType } from "@rectify-dev/shared";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  ContextProvider,
  MemoComponent,
  FragmentComponent,
  LazyComponent,
  SuspenseComponent,
  ClassComponent,
} from "./RectifyFiberWorkTags";
import { withHooks, notifyContextConsumers } from "@rectify-dev/hook";
import { createWorkInProgress } from "./RectifyFiber";
import { getCurrentLanePriority } from "./RectifyFiberRenderPriority";
import { reconcileChildren } from "./RectifyFiberReconcileChildren";
import { isSuspendedBoundary } from "./RectifyFiberSuspense";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when this fiber has no own pending work in the current pass. */
const hasNoPendingWork = (wip: Fiber): boolean =>
  !(wip.lanes & getCurrentLanePriority());

/** Returns true when this is an update (not a mount). */
const isUpdate = (wip: Fiber): boolean => wip.alternate !== null;

/**
 * Applies all queued setState updates against `currentState` and returns the
 * resulting next state.  Each functional updater receives the state produced
 * by the previous updater in the same batch, matching React semantics.
 */
const flushStateQueue = <S, P>(
  currentState: S,
  props: P,
  queue: Array<Partial<S> | ((s: S, p: P) => Partial<S>)>,
): S => {
  let state = currentState;
  for (const update of queue) {
    const partial =
      typeof update === "function" ? update(state, props) : update;
    state = { ...state, ...partial };
  }
  return state;
};

/**
 * Runs a function component (or memo-wrapped component) through hooks,
 * then reconciles the output into children.
 */
const renderFunctionComponent = (wip: Fiber, Component: Function): void => {
  const ComponentWithHooks = withHooks(wip, Component as any);
  const children = ComponentWithHooks(wip.pendingProps);
  reconcileChildren(wip, children);
};

/** Reads the context object off a ContextProvider fiber's type. */
const getProviderContext = (wip: Fiber) =>
  (wip.type as unknown as { _context: any })._context;

/**
 * Bailout helper: re-links the current tree's children as WIP nodes under
 * `wip` without calling the component function.  Each cloned child will be
 * visited by the work loop and may itself bail out or re-render depending on
 * its own pending lanes.
 */
export const cloneChildFibers = (wip: Fiber): Fiber | null => {
  const currentChild = wip.alternate?.child ?? null;
  if (!currentChild) {
    wip.child = null;
    return null;
  }

  let oldChild: Fiber | null = currentChild;
  let prevNewChild: Fiber | null = null;

  while (oldChild) {
    const newChild = createWorkInProgress(oldChild, oldChild.pendingProps);
    newChild.return = wip;

    if (!prevNewChild) {
      wip.child = newChild;
    } else {
      prevNewChild.sibling = newChild;
    }

    prevNewChild = newChild;
    oldChild = oldChild.sibling;
  }

  if (prevNewChild) prevNewChild.sibling = null;

  return wip.child;
};

// ---------------------------------------------------------------------------
// beginWork
// ---------------------------------------------------------------------------

export const beginWork = (wip: Fiber): Fiber | null => {
  switch (wip.workTag) {
    case MemoComponent: {
      const memo = wip.type as any;
      const render = memo._render;
      if (!isFunction(render)) break;

      // Bailout: use custom comparator when provided, fall back to shallowEqual.
      if (isUpdate(wip) && hasNoPendingWork(wip)) {
        const equal = memo._compare
          ? memo._compare(wip.memoizedProps, wip.pendingProps)
          : shallowEqual(wip.memoizedProps, wip.pendingProps);
        if (equal) return cloneChildFibers(wip);
      }

      renderFunctionComponent(wip, render);
      break;
    }

    case FunctionComponent: {
      const Component = wip.type;
      if (!isFunction(Component)) break;

      // Bailout: props unchanged and no own pending state update.
      // Cloned children let the work loop still descend into any grandchild
      // that does have pending work.
      if (
        isUpdate(wip) &&
        hasNoPendingWork(wip) &&
        shallowEqual(wip.memoizedProps, wip.pendingProps)
      ) {
        return cloneChildFibers(wip);
      }

      renderFunctionComponent(wip, Component as Function);
      break;
    }

    case FragmentComponent:
    case HostRoot:
    case HostComponent: {
      reconcileChildren(wip, wip.pendingProps?.children);
      break;
    }

    case ContextProvider: {
      // Bailout: value unchanged and no own pending work.
      // Children are cloned so the work loop still descends into them —
      // each child manages its own bailout independently.
      if (
        isUpdate(wip) &&
        hasNoPendingWork(wip) &&
        Object.is(wip.alternate!.memoizedProps?.value, wip.pendingProps?.value)
      ) {
        return cloneChildFibers(wip);
      }

      // Reconcile first so WIP child fibers exist before we mark subscribers.
      reconcileChildren(wip, wip.pendingProps?.children);

      // Notify subscribers when value changed so they re-render in this pass.
      if (isUpdate(wip)) {
        const prevValue = wip.alternate!.memoizedProps?.value;
        const nextValue = wip.pendingProps?.value;
        if (!Object.is(prevValue, nextValue)) {
          notifyContextConsumers(getProviderContext(wip));
        }
      }
      break;
    }

    case SuspenseComponent: {
      // When suspended, render fallback; otherwise render children.
      const children = isSuspendedBoundary(wip)
        ? wip.pendingProps?.fallback
        : wip.pendingProps?.children;
      reconcileChildren(wip, children);
      break;
    }

    case ClassComponent: {
      const Ctor = wip.type as any;
      const isMount = !wip.classInstance;

      if (isMount) {
        // First render: create the instance and wire setState → reconciler.
        const instance = new Ctor(wip.pendingProps);
        instance._fiber = wip;
        wip.classInstance = instance;
        // Flush any setState calls made inside the constructor.
        if (instance._pendingStateQueue?.length) {
          instance.state = flushStateQueue(
            instance.state,
            instance.props,
            instance._pendingStateQueue,
          );
          instance._pendingStateQueue = [];
        }
      } else {
        const instance = wip.classInstance!;

        // Bailout: skip re-render when there is no queued state and the props
        // are shallowly equal to what was rendered last time.
        // We compare against instance.props (set at the end of every render)
        // rather than wip.memoizedProps because memoizedProps is not kept in
        // sync for non-host fibers.
        if (
          hasNoPendingWork(wip) &&
          !instance._pendingStateQueue?.length &&
          shallowEqual(instance.props, wip.pendingProps)
        ) {
          return cloneChildFibers(wip);
        }

        // 1. Snapshot the OLD values BEFORE touching anything.
        instance._prevProps = instance.props;
        instance._prevState = { ...instance.state };

        // 2. Flush queued setState updates so instance.state is now NEW.
        if (instance._pendingStateQueue?.length) {
          instance.state = flushStateQueue(
            instance.state,
            wip.pendingProps,
            instance._pendingStateQueue,
          );
          instance._pendingStateQueue = [];
        }

        instance.props = wip.pendingProps;
        instance._fiber = wip;

        // 3. Honour shouldComponentUpdate if defined.
        if (
          isUpdate(wip) &&
          typeof instance.shouldComponentUpdate === "function" &&
          !instance.shouldComponentUpdate(wip.pendingProps, instance.state)
        ) {
          return cloneChildFibers(wip);
        }
      }

      const children = wip.classInstance!.render();
      reconcileChildren(wip, children);
      break;
    }

    case LazyComponent: {
      const lazy = wip.type as unknown as LazyComponentType<any>;

      if (lazy._status === "resolved") {
        // Module loaded — render the component normally.
        renderFunctionComponent(wip, lazy._result as Function);
        break;
      }

      if (lazy._status === "rejected") {
        // Module failed — propagate the error (error boundary territory).
        throw lazy._result as Error;
      }

      // "uninitialized" or "pending": kick off / await the load and suspend.
      if (lazy._status === "uninitialized") {
        lazy._status = "pending";
        lazy._promise = lazy._factory().then(
          (module: any) => {
            lazy._status = "resolved";
            // Support both `export default` and bare-default modules.
            lazy._result = (module as any)?.default ?? module;
          },
          (error: unknown) => {
            lazy._status = "rejected";
            lazy._result = error as Error;
          },
        );
      }

      // Throwing a thenable signals the work loop to suspend the nearest
      // Suspense boundary and schedule a re-render when the promise resolves.
      throw lazy._promise;
    }
  }

  return wip.child;
};
