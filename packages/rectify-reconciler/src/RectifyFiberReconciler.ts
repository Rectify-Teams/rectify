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
import { setScheduleRerender } from "@rectify/hook";
import {
  dequeueUpdate,
  enqueueUpdate,
  UpdateQueue,
} from "./RectifyFiberConcurrentUpdate";
import {
  getCurrentLanePriority,
  requestUpdateLane,
} from "./RectifyFiberRenderPriority";

setScheduleRerender((_fiber: Fiber) => {
  enqueueUpdate({
    lanes: requestUpdateLane(),
    fiber: _fiber,
    next: null,
  });

  if (getSchedulingRenderer()) return;
  setSchedulingRenderer(true);

  queueMicrotask(() => {
    const fiberRoot = getScheduledFiberRoot();
    if (!fiberRoot) return;
    markLaneToRoot();
    setScheduledFiberRoot(fiberRoot);
    const renderLanes = getCurrentLanePriority();
    workLoopOnFiberLanes(fiberRoot.root, renderLanes);
    commitWork(fiberRoot.root);
    markContainerAsRoot(fiberRoot.root, fiberRoot.containerDom);
    setSchedulingRenderer(false);
  });
});

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
  return wipRoot;
};

const markLaneToRoot = () => {
  let update = dequeueUpdate();
  while (update) {
    bubbleLaneToRoot(update);
    update = dequeueUpdate();
  }
};

const bubbleLaneToRoot = (updateQueue: UpdateQueue) => {
  let fiber: Fiber | null = updateQueue.fiber;
  fiber.lanes |= updateQueue.lanes;
  fiber = fiber.return;
  while (fiber) {
    fiber.childLanes |= updateQueue.lanes;
    fiber = fiber.return;
  }
};
