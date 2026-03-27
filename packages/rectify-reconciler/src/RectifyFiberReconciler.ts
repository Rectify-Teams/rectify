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
import {
  setScheduleRerender,
  setMarkFiberDirty,
  flushEffects,
  flushEffectCleanups,
  flushLayoutEffects,
  flushLayoutEffectCleanups,
} from "@rectify/hook";
import {
  dequeueUpdate,
  enqueueUpdate,
  hasUpdate,
  UpdateQueue,
} from "./RectifyFiberConcurrentUpdate";
import {
  requestUpdateLane,
  setCurrentEventPriority,
  resetCurrentEventPriority,
  setCurrentRenderingLanes,
  getCurrentLanePriority,
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

// When true, setState calls inside useLayoutEffect must NOT schedule async
// tasks – they will be drained synchronously by flushLayoutPhase instead.
let isFlushingLayoutEffects = false;

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
  // Flush layout effects synchronously, draining any setState they trigger
  // before the browser gets a chance to paint.
  flushLayoutPhase(fiberRoot);
  // Passive effects (useEffect) are deferred so the browser can paint first.
  schedulePassiveEffects();
};

setWorkCallback(performWork);

// ---------------------------------------------------------------------------
// Schedule rerender – called by useState dispatcher
// ---------------------------------------------------------------------------
setScheduleRerender((fiber: Fiber) => {
  // Inside useLayoutEffect: force SyncLane so the drain loop below can
  // pick up the update, and skip the async scheduler entirely.
  const lane = isFlushingLayoutEffects ? SyncLane : requestUpdateLane();
  enqueueUpdate({ lanes: lane, fiber, next: null });
  if (!isFlushingLayoutEffects) {
    scheduleRenderLane(lane);
  }
});

// Mark a context subscriber's WIP fiber dirty so it fails the bailout and
// re-renders in the current pass — no second render needed.
// The subscriber set holds committed (current) fibers; their WIP is .alternate.
setMarkFiberDirty((fiber: Fiber) => {
  const lane = getCurrentLanePriority();

  // Mark both current and wip so the lane survives createWorkInProgress copies.
  fiber.lanes |= lane;
  const wip = fiber.alternate;
  if (wip) {
    wip.lanes |= lane;

    // Bubble childLanes up the WIP tree so workLoopOnFiberLanes descends into
    // this subtree. We only need to go as far as an ancestor whose childLanes
    // already includes this lane (it will cover everything above that).
    let parent = wip.return;
    while (parent) {
      if ((parent.childLanes & lane) === lane) break;
      parent.childLanes |= lane;
      parent = parent.return;
    }
  }
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
  // Flush layout effects synchronously, draining any setState they trigger
  // before the browser gets a chance to paint.
  flushLayoutPhase(fiberRoot);
  // Passive effects (useEffect) are deferred so the browser can paint first.
  schedulePassiveEffects();
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// A single reusable channel; the port1 handler is replaced each time so
// only the most recently scheduled flush ever runs.
const passiveChannel = new MessageChannel();
const schedulePassiveEffects = (): void => {
  passiveChannel.port1.onmessage = () => {
    flushEffectCleanups();
    flushEffects();
  };
  passiveChannel.port2.postMessage(null);
};

/**
 * Flush layout effects synchronously, then re-render and re-commit any state
 * updates triggered inside them – looping until stable.  This mirrors React's
 * behaviour where setState inside useLayoutEffect causes a synchronous
 * re-render that the browser never sees as an intermediate frame.
 */
const flushLayoutPhase = (fiberRoot: FiberRoot): void => {
  while (true) {
    isFlushingLayoutEffects = true;
    flushLayoutEffectCleanups();
    flushLayoutEffects();
    isFlushingLayoutEffects = false;

    // No updates were triggered during layout effects – we are done.
    if (!hasUpdate()) break;

    // Drain the updates synchronously (they were enqueued with SyncLane).
    flushPendingUpdates();
    setCurrentRenderingLanes(SyncLane);
    const completed = workLoopOnFiberLanes(fiberRoot.root, SyncLane);
    if (!completed) break; // shouldn't happen for sync lanes
    clearResumeCursor();
    commitWork(fiberRoot.root);
    markContainerAsRoot(fiberRoot.root, fiberRoot.containerDom);
    // Loop back to flush any layout effects produced by this new render.
  }
};

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
