import { RectifyNode } from "@rectify/shared";
import {
  isFunction,
  isValidRectifyElement,
  toArray,
} from "@rectify/shared/utilities";
import { Fiber, FiberRoot } from "./RectifyFiberTypes";
import { createHostRootFiber, createWorkInProgress } from "./RectifyFiber";
import { setScheduledFiberRoot } from "./RectifyFiberInstantce";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
} from "./RectifyFiberWorkTags";

export const createContainer = (container: Element): FiberRoot => {
  const fiberRoot = createHostRootFiber(container);
  return fiberRoot;
};

export const updateContainer = (node: RectifyNode, fiberRoot: FiberRoot) => {
  setScheduledFiberRoot(fiberRoot);
  const wipRoot = createWorkInProgress(fiberRoot.root, node);

  const finished = renderRoot(wipRoot);
  fiberRoot.root = finished;
  setScheduledFiberRoot(fiberRoot);
};

const renderRoot = (wipRoot: Fiber): Fiber => {
  beginWork(wipRoot);
  commitWork(wipRoot);
  return wipRoot;
};

const beginWork = (wip: Fiber) => {
  let nextChild: Fiber | null = wip;
  while (nextChild) {
    nextChild = performUnitOfWork(nextChild);
  }
};

const performUnitOfWork = (wip: Fiber): Fiber | null => {
  const workTag = wip.workTag;

  switch (workTag) {
    case FunctionComponent: {
      const Component = wip.type;
      if (!isFunction(Component)) break;
      const nextChildren = Component(wip.pendingProps);
      reconcilerChildren(wip, nextChildren);
      break;
    }
    case HostRoot:
    case HostComponent: {
      const nextChildren = wip.pendingProps.children;
      reconcilerChildren(wip, nextChildren);
      break;
    }
  }

  if (wip.child) return wip.child;
  let node: Fiber | null = wip;
  while (node) {
    if (node.sibling) return node.sibling;
    node = node.return;
  }
  return null;
};

const reconcilerChildren = (wip: Fiber, children: RectifyNode) => {
  const currentFiber = wip.alternate;
  const currentFiberChildHead = currentFiber?.child;

  let index = 0;
  let oldCurrentFiberChild = currentFiberChildHead;
  let prevSibling: Fiber | null = null;

  toArray(children).forEach((child) => {
    if (!isValidRectifyElement(child)) return;
  });
};

const commitWork = (finishedWork: Fiber) => {};
