import { Fiber } from "@rectify-dev/shared";
import { setScheduleRerender, setMarkFiberDirty } from "@rectify-dev/hook";
import { enqueueUpdate } from "./RectifyFiberConcurrentUpdate";
import {
  requestUpdateLane,
  getCurrentLanePriority,
} from "./RectifyFiberRenderPriority";
import { scheduleRenderLane } from "./RectifyFiberScheduler";
import { SyncLane } from "./RectifyFiberLanes";
import { getIsFlushingLayoutEffects } from "./RectifyFiberFlushPhase";

// ---------------------------------------------------------------------------
// Injected callbacks — wired into the hook layer at startup
// ---------------------------------------------------------------------------

/**
 * Called by useState's dispatcher when state changes.
 * Enqueues the fiber for re-render on the appropriate lane.
 */
const onScheduleRerender = (fiber: Fiber): void => {
  // Inside useLayoutEffect: force SyncLane so the flush loop picks it up
  // synchronously instead of scheduling an async task.
  const lane = getIsFlushingLayoutEffects() ? SyncLane : requestUpdateLane();
  enqueueUpdate({ lanes: lane, fiber, next: null });
  if (!getIsFlushingLayoutEffects()) {
    scheduleRenderLane(lane);
  }
};

/**
 * Called by notifyContextConsumers when a Provider value changes.
 * Marks the subscriber's WIP fiber dirty so it fails the bailout and
 * re-renders in the current pass — no second render pass needed.
 *
 * The subscriber set holds committed (current) fibers; their WIP is .alternate.
 * We also bubble childLanes up the WIP tree so workLoopOnFiberLanes descends
 * into the subscriber's subtree.
 */
const onMarkFiberDirty = (fiber: Fiber): void => {
  const lane = getCurrentLanePriority();

  // Mark both sides so the lane survives createWorkInProgress copies.
  fiber.lanes |= lane;
  const wip = fiber.alternate;
  if (!wip) return;

  wip.lanes |= lane;

  let parent = wip.return;
  while (parent) {
    if ((parent.childLanes & lane) === lane) break; // already covered above
    parent.childLanes |= lane;
    parent = parent.return;
  }
};

setScheduleRerender(onScheduleRerender);
setMarkFiberDirty(onMarkFiberDirty);
