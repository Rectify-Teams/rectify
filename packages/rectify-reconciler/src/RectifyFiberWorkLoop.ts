import {
  createElementFromRectifyNode,
  Fiber,
  isFunction,
  isValidRectifyElement,
  RectifyElement,
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

// ---------------------------------------------------------------------------
// reconcileChildren helpers
// ---------------------------------------------------------------------------

/** Reuse an existing fiber or create a fresh one for `element`. */
const reuseOrCreate = (
  oldFiber: Fiber,
  element: RectifyElement,
  wip: Fiber,
): Fiber => {
  const newFiber = createWorkInProgress(oldFiber, element.props);
  if (hasPropsChanged(oldFiber.memoizedProps, element.props)) {
    addFlagToFiber(newFiber, UpdateFlag);
  }
  newFiber.return = wip;
  return newFiber;
};

/** Create a brand-new fiber for `element` and mark it for placement. */
const createAndPlace = (element: RectifyElement, wip: Fiber): Fiber => {
  const newFiber = createFiberFromRectifyElement(element);
  // createFiberFromRectifyElement leaves type as null – assign it explicitly.
  newFiber.type = element.type;
  addFlagToFiber(newFiber, PlacementFlag);
  newFiber.return = wip;
  return newFiber;
};

const reconcileChildren = (wip: Fiber, children: RectifyNode) => {
  const newElements = toArray(children)
    .map(createElementFromRectifyNode)
    .filter(isValidRectifyElement);

  const deletions: Fiber[] = [];
  let index = 0;

  // Appends `fiber` to the new child list and advances the prev pointer.
  const append = (fiber: Fiber, prev: Fiber | null): Fiber => {
    fiber.index = index++;
    if (!prev) wip.child = fiber;
    else prev.sibling = fiber;
    return fiber;
  };

  // ------------------------------------------------------------------
  // Pass 1 – left-to-right index scan (fast path, no reordering)
  // Stops as soon as the keys diverge.
  // ------------------------------------------------------------------
  let oldFiber: Fiber | null = wip.alternate?.child ?? null;
  let pass1Stopped = 0;
  let prev: Fiber | null = null;

  for (; pass1Stopped < newElements.length; pass1Stopped++) {
    const element = newElements[pass1Stopped];
    const { key: elementKey = null, type: elementType } = element;

    if (!oldFiber) break; // old list exhausted
    if (oldFiber.key !== elementKey) break; // keys diverged → reorder

    if (oldFiber.type === elementType) {
      prev = append(reuseOrCreate(oldFiber, element, wip), prev);
    } else {
      // Same key but different type → delete old, create new
      addFlagToFiber(oldFiber, DeletionFlag);
      deletions.push(oldFiber);
      prev = append(createAndPlace(element, wip), prev);
    }

    oldFiber = oldFiber.sibling;
  }

  // ------------------------------------------------------------------
  // Pass 2 – key-map lookup (handles reordering / insertions / removals)
  // Only runs when pass 1 didn't consume every element.
  // ------------------------------------------------------------------
  if (pass1Stopped < newElements.length) {
    // Build a map from key (or fallback index) → old fiber for all
    // remaining old fibers that pass 1 didn't consume.
    const oldFiberMap = new Map<string | number, Fiber>();
    let remaining: Fiber | null = oldFiber;
    let remainingIdx = pass1Stopped;
    while (remaining) {
      const mapKey: string | number = remaining.key ?? remainingIdx;
      oldFiberMap.set(mapKey, remaining);
      remaining = remaining.sibling;
      remainingIdx++;
    }

    // Track the highest old index we've seen to detect moves.
    // Any reused fiber whose old index < lastPlacedIndex needs re-insertion.
    let lastPlacedIndex = 0;

    for (let i = pass1Stopped; i < newElements.length; i++) {
      const element = newElements[i];
      const { key: elementKey = null, type: elementType } = element;
      const mapKey: string | number = elementKey ?? i;
      const matched = oldFiberMap.get(mapKey) ?? null;

      if (matched && matched.type === elementType) {
        oldFiberMap.delete(mapKey);
        const newFiber = reuseOrCreate(matched, element, wip);

        if (matched.index < lastPlacedIndex) {
          // Moved to the right – needs re-insertion in the DOM.
          addFlagToFiber(newFiber, MoveFlag);
        } else {
          lastPlacedIndex = matched.index;
        }

        prev = append(newFiber, prev);
      } else {
        prev = append(createAndPlace(element, wip), prev);
      }
    }

    // Old fibers still in the map have no counterpart → delete.
    for (const orphan of oldFiberMap.values()) {
      addFlagToFiber(orphan, DeletionFlag);
      deletions.push(orphan);
    }
  } else {
    // Pass 1 consumed all new elements; delete leftover old fibers.
    while (oldFiber) {
      addFlagToFiber(oldFiber, DeletionFlag);
      deletions.push(oldFiber);
      oldFiber = oldFiber.sibling;
    }
  }

  // Terminate the new sibling chain.
  if (prev) prev.sibling = null;

  if (deletions.length) wip.deletions = deletions;
};
