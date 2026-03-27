import { Fiber, RectifyNode } from "@rectify/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import { createHostRootFiber, createWorkInProgress } from "./RectifyFiber";
import {
  setScheduledFiberRoot,
  getScheduledFiberRoot,
} from "./RectifyFiberInstance";
import {
  markContainerAsRoot,
  injectEventPriorityCallbacks,
} from "@rectify/dom-binding";
import { workLoop, workLoopOnFiberLanes } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { setScheduleRerender, flushEffects } from "@rectify/hook";
import {
  dequeueUpdate,
  enqueueUpdate,
  UpdateQueue,
} from "./RectifyFiberConcurrentUpdate";
import {
  requestUpdateLane,
  setCurrentEventPriority,
  resetCurrentEventPriority,
  setCurrentRenderingLanes,
} from "./RectifyFiberRenderPriority";
import {
  scheduleRenderLane,
  setWorkCallback,
  setWipRoot,
  getWipRoot,
  clearWipRoot,
} from "./RectifyFiberScheduler";
import { SyncLane } from "./RectifyFiberLanes";

// ---------------------------------------------------------------------------
// Wire up event priority into dom-binding
// ---------------------------------------------------------------------------
injectEventPriorityCallbacks(
  setCurrentEventPriority,
  resetCurrentEventPriority,
);

// ---------------------------------------------------------------------------
// Work callback – called by the scheduler for each lane tier
// ---------------------------------------------------------------------------
const performWork = (lanes: number): void => {
  const fiberRoot = getScheduledFiberRoot();
  if (!fiberRoot) return;

  // Only flush pending updates when starting fresh (not resuming a yield).
  if (!getWipRoot()) flushPendingUpdates();

  setCurrentRenderingLanes(lanes);
  const completed = workLoopOnFiberLanes(fiberRoot.root, lanes);

  if (!completed) {
    // Tree is only partially reconciled – store the root so the next
    // scheduler task for this lane can resume rather than restart.
    setWipRoot(fiberRoot.root);
    scheduleRenderLane(lanes); // re-post a task for the same lane
    return;
  }

  // Tree fully reconciled – safe to commit.
  clearWipRoot();
  commitWork(fiberRoot.root);
  markContainerAsRoot(fiberRoot.root, fiberRoot.containerDom);
  flushEffects();
};

setWorkCallback(performWork);

// ---------------------------------------------------------------------------
// Schedule rerender – called by useState dispatcher
// ---------------------------------------------------------------------------
setScheduleRerender((fiber: Fiber) => {
  const lane = requestUpdateLane();
  enqueueUpdate({ lanes: lane, fiber, next: null });
  scheduleRenderLane(lane);
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const createContainer = (container: Element): FiberRoot => {
  return createHostRootFiber(container);
};

export const updateContainer = (
  children: RectifyNode,
  fiberRoot: FiberRoot,
): void => {
  fiberRoot.children = children;
  setScheduledFiberRoot(fiberRoot);

  const wipRoot = createWorkInProgress(fiberRoot.root, { children });
  setCurrentRenderingLanes(SyncLane);
  workLoop(wipRoot);
  commitWork(wipRoot);
  fiberRoot.root = wipRoot;
  markContainerAsRoot(wipRoot, fiberRoot.containerDom);
  setScheduledFiberRoot(fiberRoot);
  flushEffects();
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const flushPendingUpdates = (): void => {
  let update = dequeueUpdate();
  while (update) {
    propagateLaneToAncestors(update);
    update = dequeueUpdate();
  }
};

const propagateLaneToAncestors = (updateQueue: UpdateQueue): void => {
  let fiber: Fiber | null = updateQueue.fiber;
  fiber.lanes |= updateQueue.lanes;
  if (fiber.alternate) fiber.alternate.lanes |= updateQueue.lanes;
  fiber = fiber.return;
  while (fiber) {
    fiber.childLanes |= updateQueue.lanes;
    if (fiber.alternate) fiber.alternate.childLanes |= updateQueue.lanes;
    fiber = fiber.return;
  }
};
