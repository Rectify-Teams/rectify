import { Fiber, RectifyNode } from "@rectify/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import { createHostRootFiber, createWorkInProgress } from "./RectifyFiber";
import {
  setScheduledFiberRoot,
  getScheduledFiberRoot,
} from "./RectifyFiberInstance";
import { markContainerAsRoot } from "@rectify/dom-binding";
import { workLoop } from "./RectifyFiberWorkLoop";
import { commitWork } from "./RectifyFiberCommitWork";
import { setScheduleRerender } from "@rectify/hook";

setScheduleRerender((_fiber: Fiber) => {
  const fiberRoot = getScheduledFiberRoot();
  if (!fiberRoot) return;

  setScheduledFiberRoot(fiberRoot);
  const wipRoot = createWorkInProgress(fiberRoot.root, {
    children: fiberRoot.children,
  });
  const finished = renderRoot(wipRoot);
  fiberRoot.root = finished;
  markContainerAsRoot(finished, fiberRoot.containerDom);
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
