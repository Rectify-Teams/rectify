import {
  Fiber,
  RectifyNode,
  createElementFromRectifyNode,
  isFunction,
  isValidRectifyElement,
  toArray,
} from "@rectify/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import {
  createFiberFromRectifyElement,
  createHostRootFiber,
  createWorkInProgress,
} from "./RectifyFiber";
import { setScheduledFiberRoot } from "./RectifyFiberInstance";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./RectifyFiberWorkTags";
import {
  addFlagToFiber,
  createDomElementFromFiber,
  getHostSibling,
  getParentDom,
  hasFlagOnFiber,
  removeFlagFromFiber,
} from "./RectifyFiberService";
import { PlacementFlag, UpdateFlag } from "./RectifyFiberFlags";
import { withHooks } from "@rectify/hook";
import {
  applyPropsToDom,
  markContainerAsRoot,
  precacheFiberNode,
} from "@rectify/dom-binding";

export const createContainer = (container: Element): FiberRoot => {
  const fiberRoot = createHostRootFiber(container);
  return fiberRoot;
};

export const updateContainer = (
  children: RectifyNode,
  fiberRoot: FiberRoot,
) => {
  setScheduledFiberRoot(fiberRoot);
  const wipRoot = createWorkInProgress(fiberRoot.root, { children });

  const finished = renderRoot(wipRoot);
  fiberRoot.root = finished;
  markContainerAsRoot(finished, fiberRoot.containerDom);
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
      const ComponentWithHooks = withHooks(wip, Component);
      const nextChildren = ComponentWithHooks(wip.pendingProps);
      reconcilerChildren(wip, nextChildren);
      break;
    }
    case HostRoot:
    case HostComponent: {
      const nextChildren = wip.pendingProps?.children;
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
    const childElement = createElementFromRectifyNode(child);
    if (!isValidRectifyElement(childElement)) return;

    const childKey = childElement.key ?? null;
    const childType = childElement.type;

    let newFiber: Fiber;

    const isMatched =
      oldCurrentFiberChild &&
      oldCurrentFiberChild.key === childKey &&
      oldCurrentFiberChild.type === childType;

    if (isMatched) {
      newFiber = createWorkInProgress(
        oldCurrentFiberChild!,
        childElement.props,
      );
      addFlagToFiber(newFiber, UpdateFlag);
    } else {
      newFiber = createFiberFromRectifyElement(childElement);
      addFlagToFiber(newFiber, PlacementFlag);
    }

    newFiber.return = wip;
    newFiber.index = index++;
    newFiber.key = childKey;
    newFiber.type = childType;

    if (!prevSibling) wip.child = newFiber;
    else prevSibling.sibling = newFiber;

    prevSibling = newFiber;
    oldCurrentFiberChild = oldCurrentFiberChild?.sibling;
  });
};

const commitWork = (finishedWork: Fiber) => {
  commitMutation(finishedWork);

  let child = finishedWork.child;
  while (child) {
    commitWork(child);
    child = child.sibling;
  }
};

const commitMutation = (childFiber: Fiber) => {
  switch (childFiber.workTag) {
    case HostComponent:
      commitMutationHostComponent(childFiber);
      break;
    case HostText:
      commitMutationHostText(childFiber);
      break;
  }
};

const commitMutationHostComponent = (wip: Fiber) => {
  if (!wip.stateNode) {
    const dom = createDomElementFromFiber(wip);
    wip.stateNode = dom;
    applyPropsToDom(wip.stateNode, wip.memoizedProps, wip.pendingProps);
  }

  if (hasFlagOnFiber(wip, PlacementFlag)) {
    const parentDom = getParentDom(wip);
    const sibling = getHostSibling(wip);

    if (sibling) {
      parentDom.insertBefore(wip.stateNode, sibling);
    } else {
      parentDom.appendChild(wip.stateNode);
    }
    precacheFiberNode(wip, wip.stateNode);
    removeFlagFromFiber(wip, PlacementFlag);
  }

  if (hasFlagOnFiber(wip, UpdateFlag)) {
    applyPropsToDom(wip.stateNode, wip.memoizedProps, wip.pendingProps);
    precacheFiberNode(wip, wip.stateNode);
    removeFlagFromFiber(wip, UpdateFlag);
  }
};

const commitMutationHostText = (wip: Fiber) => {
  if (!wip.stateNode) {
    const textNode = document.createTextNode(String(wip.pendingProps));
    wip.stateNode = textNode;
  }

  if (hasFlagOnFiber(wip, PlacementFlag)) {
    const sibling = getHostSibling(wip);
    const parentDom = getParentDom(wip);

    if (sibling) {
      parentDom.insertBefore(wip.stateNode, sibling);
    } else {
      parentDom.appendChild(wip.stateNode);
    }
    precacheFiberNode(wip, wip.stateNode);
    removeFlagFromFiber(wip, PlacementFlag);
  }

  if (hasFlagOnFiber(wip, UpdateFlag)) {
    if (wip.memoizedProps !== wip.pendingProps) {
      (wip.stateNode as Text).nodeValue = String(wip.pendingProps);
    }
    precacheFiberNode(wip, wip.stateNode);
    removeFlagFromFiber(wip, UpdateFlag);
  }
};
