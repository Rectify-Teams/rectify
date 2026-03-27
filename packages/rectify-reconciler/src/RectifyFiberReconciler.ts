import { Fiber, RectifyNode } from "@rectify/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import { createHostRootFiber, createWorkInProgress } from "./RectifyFiber";
import {
  setScheduledFiberRoot,
  getScheduledFiberRoot,
  getSchedulingRenderer,
  setSchedulingRenderer,
} from "./RectifyFiberInstance";
import { markContainerAsRoot } from "@rectify/dom-binding";
import { workLoop, workLoopOnFiberLanes } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { setScheduleRerender, flushEffects } from "@rectify/hook";
import {
  dequeueUpdate,
  enqueueUpdate,
  UpdateQueue,
} from "./RectifyFiberConcurrentUpdate";
import {
  getCurrentLanePriority,
  requestUpdateLane,
} from "./RectifyFiberRenderPriority";

const scheduleChannel = new MessageChannel();

const initRerenderScheduler = () => {
  scheduleChannel.port1.onmessage = () => {
    const fiberRoot = getScheduledFiberRoot();
    if (!fiberRoot) return;
    flushPendingUpdates();
    setScheduledFiberRoot(fiberRoot);
    const renderLanes = getCurrentLanePriority();
    workLoopOnFiberLanes(fiberRoot.root, renderLanes);
    commitWork(fiberRoot.root);
    markContainerAsRoot(fiberRoot.root, fiberRoot.containerDom);
    setSchedulingRenderer(false);
    flushEffects();
  };

  setScheduleRerender((fiber: Fiber) => {
    enqueueUpdate({
      lanes: requestUpdateLane(),
      fiber,
      next: null,
    });

    if (getSchedulingRenderer()) return;
    setSchedulingRenderer(true);
    scheduleChannel.port2.postMessage(null);
  });
};

initRerenderScheduler();

export const createContainer = (container: Element): FiberRoot => {
  const fiberRoot = createHostRootFiber(container);
  return fiberRoot;
};

export const updateContainer = (
  children: RectifyNode,
  fiberRoot: FiberRoot,
) => {
  fiberRoot.children = children;
  setScheduledFiberRoot(fiberRoot);
  const wipRoot = createWorkInProgress(fiberRoot.root, { children });

  const finished = renderRoot(wipRoot);
  fiberRoot.root = finished;
  markContainerAsRoot(finished, fiberRoot.containerDom);
  setScheduledFiberRoot(fiberRoot);
};

const renderRoot = (wipRoot: Fiber): Fiber => {
  workLoop(wipRoot);
  commitWork(wipRoot);
  flushEffects();
  return wipRoot;
};

const flushPendingUpdates = () => {
  let update = dequeueUpdate();
  while (update) {
    propagateLaneToAncestors(update);
    update = dequeueUpdate();
  }
};

const propagateLaneToAncestors = (updateQueue: UpdateQueue) => {
  let fiber: Fiber | null = updateQueue.fiber;
  fiber.lanes |= updateQueue.lanes;
  // Also mark the alternate so that whichever copy is currently
  // in the live tree (fibers alternate between wip and current
  // after each render) will have its lanes set.
  if (fiber.alternate) fiber.alternate.lanes |= updateQueue.lanes;
  fiber = fiber.return;
  while (fiber) {
    fiber.childLanes |= updateQueue.lanes;
    if (fiber.alternate) fiber.alternate.childLanes |= updateQueue.lanes;
    fiber = fiber.return;
  }
};
