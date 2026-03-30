import { Fiber } from "@rectify-dev/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import { workLoopOnFiberLanes } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { markContainerAsRoot } from "@rectify-dev/dom-binding";
import {
  flushEffects,
  flushEffectCleanups,
  flushLayoutEffects,
  flushLayoutEffectCleanups,
} from "@rectify-dev/hook";
import {
  dequeueUpdate,
  hasUpdate,
  UpdateQueue,
} from "./RectifyFiberConcurrentUpdate";
import { setCurrentRenderingLanes } from "./RectifyFiberRenderPriority";
import { clearResumeCursor } from "./RectifyFiberScheduler";
import { SyncLane } from "./RectifyFiberLanes";

// When true, setState calls inside useLayoutEffect must NOT schedule async
// tasks – they will be drained synchronously by flushLayoutPhase instead.
let _isFlushingLayoutEffects = false;
export const getIsFlushingLayoutEffects = (): boolean => _isFlushingLayoutEffects;
export const setIsFlushingLayoutEffects = (value: boolean): void => { _isFlushingLayoutEffects = value; };

// ---------------------------------------------------------------------------
// Passive effects
// ---------------------------------------------------------------------------

// A single reusable channel; the port1 handler is replaced each time so
// only the most recently scheduled flush ever runs.
const passiveChannel = new MessageChannel();

export const schedulePassiveEffects = (): void => {
  passiveChannel.port1.onmessage = () => {
    flushEffectCleanups();
    flushEffects();
  };
  passiveChannel.port2.postMessage(null);
};

// ---------------------------------------------------------------------------
// Layout phase
// ---------------------------------------------------------------------------

/**
 * Flush layout effects synchronously, then re-render and re-commit any state
 * updates triggered inside them – looping until stable.  This mirrors React's
 * behavior where setState inside useLayoutEffect causes a synchronous
 * re-render that the browser never sees as an intermediate frame.
 */
export const flushLayoutPhase = (fiberRoot: FiberRoot): void => {
  while (true) {
    setIsFlushingLayoutEffects(true);
    flushLayoutEffectCleanups();
    flushLayoutEffects();
    setIsFlushingLayoutEffects(false);

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

// ---------------------------------------------------------------------------
// Pending update propagation
// ---------------------------------------------------------------------------

export const flushPendingUpdates = (): void => {
  let update = dequeueUpdate();
  while (update) {
    propagateLaneToAncestors(update);
    update = dequeueUpdate();
  }
};

/**
 * Stamps `lane` onto the target fiber and bubbles it up as `childLanes` so
 * `workLoopOnFiberLanes` knows to descend into that subtree.
 */
const propagateLaneToAncestors = (updateQueue: UpdateQueue): void => {
  const lane = updateQueue.lanes;
  let fiber: Fiber | null = updateQueue.fiber;

  // Mark the fiber itself (and its alternate) with the lane.
  fiber.lanes |= lane;
  if (fiber.alternate) fiber.alternate.lanes |= lane;

  // Walk up and set childLanes on every ancestor.
  fiber = fiber.return;
  while (fiber) {
    fiber.childLanes |= lane;
    if (fiber.alternate) fiber.alternate.childLanes |= lane;
    fiber = fiber.return;
  }
};
