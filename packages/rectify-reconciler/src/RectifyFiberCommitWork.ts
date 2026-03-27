import { applyPropsToDom, precacheFiberNode } from "@rectify/dom-binding";
import { Fiber } from "@rectify/shared";
import { runEffectCleanups } from "@rectify/hook";
import { NoFlags, PlacementFlag, UpdateFlag } from "./RectifyFiberFlags";
import {
  createDomElementFromFiber,
  hasFlagOnFiber,
  getParentDom,
  getHostSibling,
  removeFlagFromFiber,
} from "./RectifyFiberService";
import { HostComponent, HostText } from "./RectifyFiberWorkTags";

const MutationMask = PlacementFlag | UpdateFlag;

const commitWork = (finishedWork: Fiber) => {
  if (finishedWork.deletions?.length) {
    finishedWork.deletions.forEach(removeHostTree);
    finishedWork.deletions = null;
  }

  if (finishedWork.flags & MutationMask) {
    commitMutation(finishedWork);
    syncMemoizedProps(finishedWork);
  }

  if (finishedWork.subtreeFlags & MutationMask) {
    let child = finishedWork.child;
    while (child) {
      commitWork(child);
      child = child.sibling;
    }
  }

  finishedWork.flags = NoFlags;
  finishedWork.subtreeFlags = NoFlags;
};

const syncMemoizedProps = (wip: Fiber) => {
  wip.memoizedProps = wip.pendingProps;
};

const insertIntoParent = (wip: Fiber, node: Node) => {
  const parentDom = getParentDom(wip);
  const sibling = getHostSibling(wip) ?? (wip.return ? getHostSibling(wip.return) : null);
  if (sibling) parentDom.insertBefore(node, sibling);
  else parentDom.appendChild(node);
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
    insertIntoParent(wip, wip.stateNode!);
    precacheFiberNode(wip, wip.stateNode!);
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
    insertIntoParent(wip, wip.stateNode!);
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

const removeHostTree = (fiber: Fiber) => {
  // Fire effect cleanups before removing from the DOM
  if (fiber.memoizedState) {
    runEffectCleanups(fiber);
  }

  if (fiber.workTag === HostComponent || fiber.workTag === HostText) {
    (fiber.stateNode as Element)?.remove();
  }

  let child = fiber.child;
  while (child) {
    removeHostTree(child);
    child = child.sibling;
  }
};

export { commitWork };
