import {
  markContainerAsRoot,
  injectEventPriorityCallbacks,
} from "@rectify-dev/dom-binding";
import { workLoopOnFiberLanes } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { getScheduledFiberRoot } from "./RectifyFiberInstance";
import {
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
import {
  flushLayoutPhase,
  flushPendingUpdates,
  schedulePassiveEffects,
} from "./RectifyFiberFlushPhase";
// Side-effect import: wires onScheduleRerender / onMarkFiberDirty into the hook layer.
import "./RectifyFiberHookBridge";

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
  // Flush layout effects synchronously, draining any setState they trigger
  // before the browser gets a chance to paint.
  flushLayoutPhase(fiberRoot);
  // Passive effects (useEffect) are deferred so the browser can paint first.
  schedulePassiveEffects();
};

setWorkCallback(performWork);
