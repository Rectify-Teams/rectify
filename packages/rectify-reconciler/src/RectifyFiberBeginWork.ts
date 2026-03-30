import { Fiber, isFunction, shallowEqual } from "@rectify-dev/shared";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  ContextProvider,
  MemoComponent,
  FragmentComponent,
} from "./RectifyFiberWorkTags";
import { withHooks, notifyContextConsumers } from "@rectify-dev/hook";
import { createWorkInProgress } from "./RectifyFiber";
import { getCurrentLanePriority } from "./RectifyFiberRenderPriority";
import { reconcileChildren } from "./RectifyFiberReconcileChildren";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when this fiber has no own pending work in the current pass. */
const hasNoPendingWork = (wip: Fiber): boolean =>
  !(wip.lanes & getCurrentLanePriority());

/** Returns true when this is an update (not a mount). */
const isUpdate = (wip: Fiber): boolean => wip.alternate !== null;

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
  }

  return wip.child;
};
