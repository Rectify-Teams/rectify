import { applyPropsToDom, precacheFiberNode } from "@rectify-dev/dom-binding";
import { Fiber } from "@rectify-dev/shared";
import { runEffectCleanups, clearContextSubscriptions } from "@rectify-dev/hook";
import { NoFlags, MoveFlag, PlacementFlag, RefFlag, UpdateFlag } from "./RectifyFiberFlags";
import {
  createDomElementFromFiber,
  hasFlagOnFiber,
  getParentDom,
  getHostSibling,
  removeFlagFromFiber,
} from "./RectifyFiberService";
import { HostComponent, HostText } from "./RectifyFiberWorkTags";

const MutationMask = PlacementFlag | UpdateFlag | MoveFlag | RefFlag;

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

/** Attach a ref after a node is placed or the ref prop changes.
 * For callback refs, the return value is stored as a cleanup to be called
 * before the next attach or on unmount (React 19-style cleanup refs). */
const attachRef = (wip: Fiber): void => {
  const ref = wip.pendingProps?.ref;
  if (!ref) return;
  if (typeof ref === "function") {
    const cleanup = ref(wip.stateNode);
    wip.refCleanup = typeof cleanup === "function" ? cleanup : null;
  } else if (typeof ref === "object" && "current" in ref) {
    ref.current = wip.stateNode;
  }
};

/** Detach a ref when the fiber is removed or the ref prop changes.
 * Calls the stored cleanup (if any), otherwise falls back to `ref(null)` /
 * clearing `.current`. */
const detachRef = (fiber: Fiber): void => {
  if (fiber.refCleanup) {
    fiber.refCleanup();
    fiber.refCleanup = null;
    return;
  }
  const ref = fiber.memoizedProps?.ref;
  if (!ref) return;
  if (typeof ref === "function") {
    ref(null);
  } else if (typeof ref === "object" && "current" in ref) {
    ref.current = null;
  }
};

const insertIntoParent = (wip: Fiber, node: Node): void => {
  const parentDom = getParentDom(wip);
  // Look for a host sibling at this level; if none, check the parent level
  // (handles fibers nested inside function components with no host wrapper).
  const before = getHostSibling(wip) ?? (wip.return ? getHostSibling(wip.return) : null);
  if (before) parentDom.insertBefore(node, before);
  else parentDom.appendChild(node);
};

/**
 * Physically place or re-place `node` in the DOM and attach its ref.
 * Used for both PlacementFlag (new nodes) and MoveFlag (reordered nodes).
 */
const placeNode = (wip: Fiber, node: Node): void => {
  insertIntoParent(wip, node);
  precacheFiberNode(wip, node);
  attachRef(wip);
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
    placeNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, PlacementFlag);
  }

  if (hasFlagOnFiber(wip, MoveFlag)) {
    // Node already exists in the DOM but at the wrong position — re-insert.
    (wip.stateNode as Element).remove();
    placeNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, MoveFlag);
  }

  if (hasFlagOnFiber(wip, UpdateFlag)) {
    applyPropsToDom(wip.stateNode, wip.memoizedProps, wip.pendingProps);
    precacheFiberNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, UpdateFlag);
    // ref attachment is handled exclusively via PlacementFlag/MoveFlag (placeNode)
    // and RefFlag (below) so we never double-invoke callback refs on plain updates.
  }

  if (hasFlagOnFiber(wip, RefFlag)) {
    // Detach the previously committed ref, then attach the incoming one.
    detachRef(wip); // reads memoizedProps.ref → sets .current = null
    attachRef(wip); // reads pendingProps.ref  → sets .current = stateNode
    removeFlagFromFiber(wip, RefFlag);
  }
};

const commitMutationHostText = (wip: Fiber) => {
  if (!wip.stateNode) {
    const node = createDomElementFromFiber(wip);
    precacheFiberNode(wip, node);
    wip.stateNode = node;
  }

  if (hasFlagOnFiber(wip, PlacementFlag)) {
    placeNode(wip, wip.stateNode!);
    removeFlagFromFiber(wip, PlacementFlag);
  }

  if (hasFlagOnFiber(wip, MoveFlag)) {
    (wip.stateNode as Text).remove();
    placeNode(wip, wip.stateNode!);
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
