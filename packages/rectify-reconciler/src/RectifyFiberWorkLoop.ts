import { Fiber } from "@rectify-dev/shared";
import { Lanes, SyncLane, InputLane } from "./RectifyFiberLanes";
import { createWorkInProgress } from "./RectifyFiber";
import {
  shouldYield,
  getResumeCursor,
  setResumeCursor,
  clearResumeCursor,
} from "./RectifyFiberScheduler";
import { beginWork } from "./RectifyFiberBeginWork";
import {
  completeUnitOfWork,
  bubbleFlagsToRoot,
} from "./RectifyFiberCompleteWork";
import {
  isThenable,
  findNearestSuspenseBoundary,
  handleSuspendedWork,
} from "./RectifyFiberSuspense";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Swap the committed fiber (`current`) for its work-in-progress twin in the
 * parent's child/sibling chain so the work loop operates on the WIP tree.
 */
const swapCurrentForWip = (current: Fiber, wip: Fiber): void => {
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

// ---------------------------------------------------------------------------
// Work loops
// ---------------------------------------------------------------------------

/** Synchronous work loop — runs to completion without yielding. */
export const workLoop = (wipRoot: Fiber): void => {
  let workInProgress: Fiber | null = wipRoot;

  while (workInProgress) {
    try {
      const next = beginWork(workInProgress);
      workInProgress = next ?? completeUnitOfWork(workInProgress, wipRoot);
    } catch (thrown) {
      if (isThenable(thrown) && workInProgress) {
        const boundary = findNearestSuspenseBoundary(workInProgress);
        if (boundary) {
          handleSuspendedWork(boundary, thrown);
          // Re-process the boundary, this time rendering the fallback.
          workInProgress = boundary;
          continue;
        }
      }
      throw thrown;
    }
  }
};

/**
 * Interruptible work loop used for non-urgent lanes (Default / Transition / Idle).
 * Yields back to the browser when the frame budget is exceeded; the scheduler
 * will re-post a task to continue with the remaining pending lanes.
 * Returns true when the tree is fully processed, false when it yielded early.
 */
export const workLoopConcurrent = (wipRoot: Fiber): boolean => {
  // Resume from the saved cursor if we yielded on a previous task,
  // otherwise start fresh from the WIP root.
  let workInProgress: Fiber | null = getResumeCursor() ?? wipRoot;
  clearResumeCursor();

  while (workInProgress && !shouldYield()) {
    try {
      const next = beginWork(workInProgress);
      workInProgress = next ?? completeUnitOfWork(workInProgress, wipRoot);
    } catch (thrown) {
      if (isThenable(thrown) && workInProgress) {
        const boundary = findNearestSuspenseBoundary(workInProgress);
        if (boundary) {
          handleSuspendedWork(boundary, thrown);
          // Re-process the boundary, this time rendering the fallback.
          workInProgress = boundary;
          continue;
        }
      }
      throw thrown;
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
 * Descend into the fiber tree and process only fibers that have pending work
 * on `renderLanes`. Returns true when fully processed, false if yielded early.
 */
export const workLoopOnFiberLanes = (
  wipRoot: Fiber,
  renderLanes: Lanes,
): boolean => {
  if (wipRoot.lanes & renderLanes) {
    const wip = createWorkInProgress(wipRoot, wipRoot.pendingProps);
    swapCurrentForWip(wipRoot, wip);

    const isSync = !!(renderLanes & (SyncLane | InputLane));
    const completed = isSync ? (workLoop(wip), true) : workLoopConcurrent(wip);

    if (completed) bubbleFlagsToRoot(wip);
    return completed;
  }

  if (wipRoot.childLanes & renderLanes) {
    let child: Fiber | null = wipRoot.child;
    while (child) {
      if (!workLoopOnFiberLanes(child, renderLanes)) return false; // propagate early-exit
      child = child.sibling;
    }
  }

  return true;
};
