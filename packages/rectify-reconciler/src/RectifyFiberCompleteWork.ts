import { Fiber } from "@rectify-dev/shared";
import { NoFlags } from "./RectifyFiberFlags";
import { NoLanes } from "./RectifyFiberLanes";
import { getCurrentLanePriority } from "./RectifyFiberRenderPriority";

// ---------------------------------------------------------------------------
// bubbleProperties
// ---------------------------------------------------------------------------

/**
 * Clear this fiber's own lane (it has been processed) and roll up child flags
 * and child lanes from direct children so the work loop can skip clean subtrees.
 */
export const bubbleProperties = (wip: Fiber): void => {
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
// bubbleFlagsToRoot
// ---------------------------------------------------------------------------

/**
 * After a concurrent subtree finishes, propagate its flags and lanes up to the
 * root so commitWork knows which parts of the tree need attention.
 */
export const bubbleFlagsToRoot = (wip: Fiber): void => {
  let current: Fiber = wip;
  let parent = current.return;

  while (parent) {
    parent.subtreeFlags |= current.flags | current.subtreeFlags;
    parent.childLanes |= current.lanes | current.childLanes;
    current = parent;
    parent = parent.return;
  }
};

// ---------------------------------------------------------------------------
// completeUnitOfWork
// ---------------------------------------------------------------------------

/**
 * Walk back up the tree after a leaf is reached: bubble properties on each
 * completed unit, then move to its sibling or continue up to the parent.
 * Returns null when `stopAt` is reached (the work loop's root).
 */
export const completeUnitOfWork = (unit: Fiber, stopAt: Fiber): Fiber | null => {
  let completed: Fiber | null = unit;

  while (completed) {
    bubbleProperties(completed);

    if (completed === stopAt) return null;
    if (completed.sibling) return completed.sibling;

    completed = completed.return;
  }

  return null;
};
