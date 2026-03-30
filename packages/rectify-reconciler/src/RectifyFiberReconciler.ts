import { RectifyNode } from "@rectify-dev/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import { createHostRootFiber, createWorkInProgress } from "./RectifyFiber";
import { setScheduledFiberRoot } from "./RectifyFiberInstance";
import { markContainerAsRoot } from "@rectify-dev/dom-binding";
import { workLoop } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { setCurrentRenderingLanes } from "./RectifyFiberRenderPriority";
import { SyncLane } from "./RectifyFiberLanes";
import { flushLayoutPhase, schedulePassiveEffects } from "./RectifyFiberFlushPhase";
// Side-effect import: wires up event priority, performWork, and hook callbacks.
import "./RectifyFiberBootstrap";

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
