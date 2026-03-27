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
import { setScheduleRerender, flushEffects, flushEffectCleanups } from "@rectify/hook";
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
  getResumeCursor,
  clearResumeCursor,
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

  // Only flush pending updates when starting a fresh render,
  // not when resuming a yielded concurrent work loop.
  if (!getResumeCursor()) flushPendingUpdates();

  setCurrentRenderingLanes(lanes);
  const completed = workLoopOnFiberLanes(fiberRoot.root, lanes);

  if (!completed) {
    // workLoopConcurrent saved the cursor inside RectifyFiberScheduler.
    // Re-post a task for the same lane so work continues next frame.
    scheduleRenderLane(lanes);
    return;
  }

  // Tree fully reconciled – safe to commit.
  clearResumeCursor();
  commitWork(fiberRoot.root);
  markContainerAsRoot(fiberRoot.root, fiberRoot.containerDom);
  flushEffectCleanups(); // run old effect cleanups before new effects fire
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
  flushEffectCleanups();
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
