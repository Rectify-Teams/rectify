import { applyPropsToDom, precacheFiberNode } from "@rectify/dom-binding";
import { Fiber } from "@rectify/shared";
import { runEffectCleanups, clearContextSubscriptions } from "@rectify/hook";
import { NoFlags, MoveFlag, PlacementFlag, UpdateFlag } from "./RectifyFiberFlags";
import {
  createDomElementFromFiber,
  hasFlagOnFiber,
  getParentDom,
  getHostSibling,
  removeFlagFromFiber,
} from "./RectifyFiberService";
import { HostComponent, HostText } from "./RectifyFiberWorkTags";

const MutationMask = PlacementFlag | UpdateFlag | MoveFlag;

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

/** Set ref.current = DOM node after the node is placed/updated/moved. */
const attachRef = (wip: Fiber): void => {
  const ref = wip.pendingProps?.ref;
  if (ref && typeof ref === "object" && "current" in ref) {
    ref.current = wip.stateNode;
  }
};

/** Clear ref.current = null when the fiber is removed from the tree. */
const detachRef = (fiber: Fiber): void => {
  const ref = fiber.memoizedProps?.ref;
  if (ref && typeof ref === "object" && "current" in ref) {
    ref.current = null;
  }
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
    attachRef(wip);
    removeFlagFromFiber(wip, PlacementFlag);
  }

  if (hasFlagOnFiber(wip, MoveFlag)) {
    // Node already exists in the DOM but at the wrong position – re-insert.
    (wip.stateNode as Element).remove();
    insertIntoParent(wip, wip.stateNode!);
    precacheFiberNode(wip, wip.stateNode!);
    attachRef(wip);
    removeFlagFromFiber(wip, MoveFlag);
  }

  if (hasFlagOnFiber(wip, UpdateFlag)) {
    applyPropsToDom(wip.stateNode, wip.memoizedProps, wip.pendingProps);
    precacheFiberNode(wip, wip.stateNode!);
    attachRef(wip);
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

  if (hasFlagOnFiber(wip, MoveFlag)) {
    (wip.stateNode as Text).remove();
    insertIntoParent(wip, wip.stateNode!);
    precacheFiberNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, MoveFlag);
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
  // Fire effect cleanups and unsubscribe from contexts before removing.
  if (fiber.memoizedState) {
    runEffectCleanups(fiber);
  }
  clearContextSubscriptions(fiber);

  if (fiber.workTag === HostComponent || fiber.workTag === HostText) {
    detachRef(fiber);
    (fiber.stateNode as Element)?.remove();
  }

  let child = fiber.child;
  while (child) {
    removeHostTree(child);
    child = child.sibling;
  }
};

export { commitWork };
