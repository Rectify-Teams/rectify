import {
  createElementFromRectifyNode,
  Fiber,
  isArray,
  isFunction,
  isValidRectifyElement,
  RectifyElement,
  RectifyNode,
  shallowEqual,
} from "@rectify/shared";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  ContextProvider,
  MemoComponent,
  FragmentComponent,
} from "./RectifyFiberWorkTags";
import { withHooks, notifyContextConsumers } from "@rectify/hook";
import { addFlagToFiber, hasPropsChanged } from "./RectifyFiberService";
import {
  DeletionFlag,
  MoveFlag,
  NoFlags,
  PlacementFlag,
  UpdateFlag,
} from "./RectifyFiberFlags";
import { Lanes, NoLanes, SyncLane, InputLane } from "./RectifyFiberLanes";
import {
  createFiberFromRectifyElement,
  createWorkInProgress,
} from "./RectifyFiber";
import { getCurrentLanePriority } from "./RectifyFiberRenderPriority";
import {
  shouldYield,
  getResumeCursor,
  setResumeCursor,
  clearResumeCursor,
} from "./RectifyFiberScheduler";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Mutable state threaded through the reconcileChildren pass functions. */
type ReconcileState = {
  wip: Fiber;
  newElements: RectifyElement[];
  deletions: Fiber[];
  prev: Fiber | null;
  index: number;
};

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const swapCurrentForWip = (current: Fiber, wip: Fiber) => {
  const parent = wip.return;
  if (!parent) return;

  if (parent.child === current) {
    parent.child = wip;
    return;
  }

  let prevSibling = parent.child;
  while (prevSibling && prevSibling.sibling !== current) {
    prevSibling = prevSibling.sibling;
  }
  if (prevSibling) prevSibling.sibling = wip;
};

export const workLoop = (wipRoot: Fiber) => {
  let workInProgress: Fiber | null = wipRoot;

  while (workInProgress) {
    const next = beginWork(workInProgress);

    if (next) {
      workInProgress = next;
    } else {
      workInProgress = completeUnitOfWork(workInProgress, wipRoot);
    }
  }
};

/**
 * Interruptible work loop used for non-urgent lanes (Default / Transition / Idle).
 * Yields back to the browser when the frame budget is exceeded; the scheduler
 * will re-post a task to continue with the remaining pending lanes.
 */
export const workLoopConcurrent = (wipRoot: Fiber): boolean => {
  // Resume from the saved cursor if we yielded on a previous task,
  // otherwise start fresh from the WIP root.
  let workInProgress: Fiber | null = getResumeCursor() ?? wipRoot;
  clearResumeCursor();

  while (workInProgress && !shouldYield()) {
    const next = beginWork(workInProgress);

    if (next) {
      workInProgress = next;
    } else {
      workInProgress = completeUnitOfWork(workInProgress, wipRoot);
    }
  }

  if (workInProgress !== null) {
    // Yielded early – save the cursor so the next task resumes here.
    setResumeCursor(workInProgress);
    return false;
  }

  return true;
};

/**
 * Returns true when the subtree rooted at wipRoot was fully processed for the
 * given renderLanes, false when a concurrent work loop yielded early.
 */
export const workLoopOnFiberLanes = (
  wipRoot: Fiber,
  renderLanes: Lanes,
): boolean => {
  if (wipRoot.lanes & renderLanes) {
    const wip = createWorkInProgress(wipRoot, wipRoot.pendingProps);
    swapCurrentForWip(wipRoot, wip);

    const isSync = !!(renderLanes & (SyncLane | InputLane));
    let completed: boolean;
    if (isSync) {
      workLoop(wip);
      completed = true;
    } else {
      completed = workLoopConcurrent(wip);
    }

    if (completed) bubbleFlagsToRoot(wip);
    return completed;
  }

  if (wipRoot.childLanes & renderLanes) {
    let child: Fiber | null = wipRoot.child;
    while (child) {
      const done = workLoopOnFiberLanes(child, renderLanes);
      if (!done) return false; // propagate early-exit upward
      child = child.sibling;
    }
  }

  return true;
};

/**
 * Bailout helper: re-links the current tree's children as WIP nodes under
 * `wip` without calling the component function.  Each cloned child will be
 * visited by the work loop and may itself bail out or re-render depending on
 * its own pending lanes.
 */
const cloneChildFibers = (wip: Fiber): Fiber | null => {
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
// beginWork helpers
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

// ---------------------------------------------------------------------------
// beginWork
// ---------------------------------------------------------------------------

const beginWork = (wip: Fiber): Fiber | null => {
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

const completeUnitOfWork = (unit: Fiber, stopAt: Fiber): Fiber | null => {
  let completed: Fiber | null = unit;

  while (completed) {
    bubbleProperties(completed);

    if (completed === stopAt) {
      return null;
    }

    if (completed.sibling) {
      return completed.sibling;
    }

    completed = completed.return;
  }

  return null;
};

const bubbleFlagsToRoot = (wip: Fiber) => {
  let current: Fiber = wip;
  let parent = current.return;
  while (parent) {
    parent.subtreeFlags |= current.flags | current.subtreeFlags;
    parent.childLanes |= current.lanes | current.childLanes;
    current = parent;
    parent = parent.return;
  }
};

const bubbleProperties = (wip: Fiber) => {
  wip.lanes &= ~getCurrentLanePriority();
  let subtreeFlags = NoFlags;
  let childLanes = NoLanes;

  let child = wip.child;
  while (child) {
    subtreeFlags |= child.flags | child.subtreeFlags;
    childLanes |= child.lanes | child.childLanes;

    child.return = wip;
    child = child.sibling;
  }

  wip.subtreeFlags = subtreeFlags;
  wip.childLanes = childLanes;
};

// ---------------------------------------------------------------------------
// reconcileChildren — helpers
// ---------------------------------------------------------------------------

/** Reuse an existing fiber, marking it for update if its props changed. */
const reuseOrCreate = (oldFiber: Fiber, element: RectifyElement, wip: Fiber): Fiber => {
  const newFiber = createWorkInProgress(oldFiber, element.props);
  if (hasPropsChanged(oldFiber.memoizedProps, element.props)) {
    addFlagToFiber(newFiber, UpdateFlag);
  }
  newFiber.return = wip;
  return newFiber;
};

/** Create a brand-new fiber for `element` and mark it for DOM placement. */
const createAndPlace = (element: RectifyElement, wip: Fiber): Fiber => {
  const newFiber = createFiberFromRectifyElement(element);
  newFiber.type = element.type; // createFiberFromRectifyElement leaves type null
  addFlagToFiber(newFiber, PlacementFlag);
  newFiber.return = wip;
  return newFiber;
};

/**
 * Append `fiber` to the WIP child list at `index` and return it.
 * `prev` is the previously appended sibling (null for the first child).
 */
const appendFiber = (
  fiber: Fiber,
  prev: Fiber | null,
  index: number,
  wip: Fiber,
): Fiber => {
  fiber.index = index;
  if (!prev) wip.child = fiber;
  else prev.sibling = fiber;
  return fiber;
};

/**
 * Build a key→fiber map from the remaining unconsumed old fibers so
 * reconcileKeyed can do O(1) lookups. Keys fall back to positional index when absent.
 */
const buildOldFiberMap = (
  firstRemaining: Fiber | null,
  startIndex: number,
): Map<string | number, Fiber> => {
  const map = new Map<string | number, Fiber>();
  let fiber: Fiber | null = firstRemaining;
  let i = startIndex;
  while (fiber) {
    map.set(fiber.key ?? i, fiber);
    fiber = fiber.sibling;
    i++;
  }
  return map;
};

// ---------------------------------------------------------------------------
// reconcileChildren — passes
// ---------------------------------------------------------------------------

/**
 * Sequential scan — fast path, no reordering.
 * Walks both lists left-to-right by index as long as keys match consecutively.
 * Stops at the first key divergence and hands the remainder to reconcileKeyed.
 * Returns the index at which it stopped and the next unconsumed old fiber.
 */
const reconcileSequential = (
  state: ReconcileState,
  firstOldFiber: Fiber | null,
): { stoppedAt: number; oldFiber: Fiber | null } => {
  let oldFiber = firstOldFiber;
  let i = 0;

  for (; i < state.newElements.length; i++) {
    const element = state.newElements[i];
    const { key: elementKey = null, type: elementType } = element;

    if (!oldFiber) break;           // old list exhausted
    if (oldFiber.key !== elementKey) break; // keys diverged → hand off to pass 2

    if (oldFiber.type === elementType) {
      state.prev = appendFiber(reuseOrCreate(oldFiber, element, state.wip), state.prev, state.index++, state.wip);
    } else {
      // Same key, different type — delete old and place new.
      addFlagToFiber(oldFiber, DeletionFlag);
      state.deletions.push(oldFiber);
      state.prev = appendFiber(createAndPlace(element, state.wip), state.prev, state.index++, state.wip);
    }

    oldFiber = oldFiber.sibling;
  }

  return { stoppedAt: i, oldFiber };
};

/**
 * Keyed lookup — handles reordering, insertions, and removals.
 * Builds a key→fiber map from the remaining old fibers and resolves each new
 * element by key (falling back to index). Only runs when reconcileSequential
 * stopped before consuming all new elements.
 */
const reconcileKeyed = (
  state: ReconcileState,
  startAt: number,
  remainingOldFiber: Fiber | null,
): void => {
  const oldFiberMap = buildOldFiberMap(remainingOldFiber, startAt);

  // lastPlacedIndex tracks the highest committed index we have seen.
  // Any reused fiber whose committed index is below it was moved rightward.
  let lastPlacedIndex = 0;

  for (let i = startAt; i < state.newElements.length; i++) {
    const element = state.newElements[i];
    const { key: elementKey = null, type: elementType } = element;
    const mapKey = elementKey ?? i;
    const matched = oldFiberMap.get(mapKey) ?? null;

    if (matched && matched.type === elementType) {
      oldFiberMap.delete(mapKey);
      const newFiber = reuseOrCreate(matched, element, state.wip);

      if (matched.index < lastPlacedIndex) {
        addFlagToFiber(newFiber, MoveFlag); // moved right — needs re-insertion
      } else {
        lastPlacedIndex = matched.index;
      }

      state.prev = appendFiber(newFiber, state.prev, state.index++, state.wip);
    } else {
      state.prev = appendFiber(createAndPlace(element, state.wip), state.prev, state.index++, state.wip);
    }
  }

  // Fibers left in the map have no matching new element — delete them.
  for (const orphan of oldFiberMap.values()) {
    addFlagToFiber(orphan, DeletionFlag);
    state.deletions.push(orphan);
  }
};

// ---------------------------------------------------------------------------
// reconcileChildren
// ---------------------------------------------------------------------------

/**
 * Normalise the raw `children` value into a flat array of `RectifyNode` items
 * ready to be mapped through `createElementFromRectifyNode`.
 *
 * Rules:
 *  - ignorable (null / undefined / boolean) → empty array (render nothing)
 *  - plain array → use as-is
 *  - anything else (string, number, RectifyElement) → single-item array
 */
const toChildArray = (children: RectifyNode): RectifyNode[] => {
  if (children == null || typeof children === "boolean") return [];
  if (isArray(children)) return children as RectifyNode[];
  return [children as RectifyNode];
};

const reconcileChildren = (wip: Fiber, children: RectifyNode): void => {
  const newElements = toChildArray(children)
    .map(createElementFromRectifyNode)
    .filter(isValidRectifyElement);

  const state: ReconcileState = { wip, newElements, deletions: [], prev: null, index: 0 };
  const firstOldFiber: Fiber | null = wip.alternate?.child ?? null;

  const { stoppedAt, oldFiber } = reconcileSequential(state, firstOldFiber);

  if (stoppedAt < newElements.length) {
    // Sequential scan stopped early — resolve the remainder by key.
    reconcileKeyed(state, stoppedAt, oldFiber);
  } else {
    // Pass 1 consumed all new elements — delete any leftover old fibers.
    let leftover: Fiber | null = oldFiber;
    while (leftover) {
      addFlagToFiber(leftover, DeletionFlag);
      state.deletions.push(leftover);
      leftover = leftover.sibling;
    }
  }

  if (state.prev) state.prev.sibling = null; // terminate the new sibling chain
  if (state.deletions.length) wip.deletions = state.deletions;
};
