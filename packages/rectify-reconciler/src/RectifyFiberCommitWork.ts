import { applyPropsToDom, precacheFiberNode } from "@rectify/dom-binding";
import { Fiber } from "@rectify/shared";
import { PlacementFlag, UpdateFlag } from "./RectifyFiberFlags";
import {
  createDomElementFromFiber,
  hasFlagOnFiber,
  getParentDom,
  getHostSibling,
  removeFlagFromFiber,
} from "./RectifyFiberService";
import { HostComponent, HostText } from "./RectifyFiberWorkTags";

const MutationMask = PlacementFlag | UpdateFlag;

export const commitWork = (finishedWork: Fiber) => {
  if (finishedWork.flags & MutationMask) {
    commitMutation(finishedWork);
    completedWork(finishedWork);
  }

  if (finishedWork.subtreeFlags & MutationMask) {
    let child = finishedWork.child;
    while (child) {
      commitWork(child);
      child = child.sibling;
    }
  }
};

const completedWork = (wip: Fiber) => {
  wip.memoizedProps = wip.pendingProps;
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
    const node = createDomElementFromFiber(wip);
    precacheFiberNode(wip, node);
    applyPropsToDom(node, wip.memoizedProps, wip.pendingProps);
    wip.stateNode = node;
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
    precacheFiberNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, UpdateFlag);
  }
};

const commitMutationHostText = (wip: Fiber) => {
  if (!wip.stateNode) {
    const node = createDomElementFromFiber(wip);
    precacheFiberNode(wip, node);
    wip.stateNode = node;
  }

  if (hasFlagOnFiber(wip, PlacementFlag)) {
    const parentDom = getParentDom(wip);
    const sibling = getHostSibling(wip);

    if (sibling) {
      parentDom.insertBefore(wip.stateNode!, sibling);
    } else {
      parentDom.appendChild(wip.stateNode!);
    }
    precacheFiberNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, PlacementFlag);
  }

  if (hasFlagOnFiber(wip, UpdateFlag)) {
    if (wip.memoizedProps !== wip.pendingProps) {
      (wip.stateNode as Text).nodeValue = String(wip.pendingProps);
    }
    precacheFiberNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, UpdateFlag);
  }
};
