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
import { workLoop } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { setScheduleRerender } from "@rectify/hook";
import { enqueueUpdate } from "./RectifyFiberConcurrentUpdate";
import { requestUpdateLane } from "./RectifyFiberRenderPriority";

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

    setScheduledFiberRoot(fiberRoot);
    const wipRoot = createWorkInProgress(fiberRoot.root, {
      children: fiberRoot.children,
    });
    const finished = renderRoot(wipRoot);
    fiberRoot.root = finished;
    markContainerAsRoot(finished, fiberRoot.containerDom);
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
