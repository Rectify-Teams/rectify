import {
  createElementFromRectifyNode,
  Fiber,
  isFunction,
  isValidRectifyElement,
  RectifyNode,
  toArray,
} from "@rectify/shared";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
} from "./RectifyFiberWorkTags";
import { withHooks } from "@rectify/hook";
import { addFlagToFiber, hasPropsChanged } from "./RectifyFiberService";
import {
  DeletionFlag,
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
import { shouldYield, getResumeCursor, setResumeCursor, clearResumeCursor } from "./RectifyFiberScheduler";

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

const beginWork = (wip: Fiber): Fiber | null => {
  switch (wip.workTag) {
    case FunctionComponent: {
      const Component = wip.type;
      if (!isFunction(Component)) break;
      const ComponentWithHooks = withHooks(wip, Component);
      const children = ComponentWithHooks(wip.pendingProps);
      reconcileChildren(wip, children);
      break;
    }
    case HostRoot:
    case HostComponent: {
      reconcileChildren(wip, wip.pendingProps?.children);
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

const reconcileChildren = (wip: Fiber, children: RectifyNode) => {
  const deletions: Fiber[] = [];

  let index = 0;
  let oldFiber = wip.alternate?.child ?? null;
  let prevNewFiber: Fiber | null = null;

  for (const child of toArray(children)) {
    const element = createElementFromRectifyNode(child);
    if (!isValidRectifyElement(element)) continue;

    const { key: elementKey = null, type: elementType } = element;

    const canReuse =
      oldFiber &&
      oldFiber.key === elementKey &&
      oldFiber.type === elementType;

    let newFiber: Fiber;

    if (canReuse) {
      newFiber = createWorkInProgress(oldFiber!, element.props);
      if (hasPropsChanged(oldFiber!.memoizedProps, element.props)) {
        addFlagToFiber(newFiber, UpdateFlag);
      }
    } else {
      newFiber = createFiberFromRectifyElement(element);
      addFlagToFiber(newFiber, PlacementFlag);

      if (oldFiber) {
        addFlagToFiber(oldFiber, DeletionFlag);
        deletions.push(oldFiber);
      }
    }

    newFiber.return = wip;
    newFiber.index = index++;
    newFiber.key = elementKey;
    newFiber.type = elementType;

    if (!prevNewFiber) wip.child = newFiber;
    else prevNewFiber.sibling = newFiber;

    prevNewFiber = newFiber;
    oldFiber = oldFiber?.sibling ?? null;
  }

  // Any remaining old fibers have no counterpart in the new children → delete
  while (oldFiber) {
    addFlagToFiber(oldFiber, DeletionFlag);
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }

  if (deletions.length) {
    wip.deletions = deletions;
  }
};
