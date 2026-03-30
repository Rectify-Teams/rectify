import { precacheFiberNode } from "@rectify-dev/dom-binding";
import { Fiber } from "@rectify-dev/shared";
import { getParentDom, getHostSibling } from "./RectifyFiberService";
import { attachRef } from "./RectifyFiberCommitRef";

// ---------------------------------------------------------------------------
// insertIntoParent
// ---------------------------------------------------------------------------

const insertIntoParent = (wip: Fiber, node: Node): void => {
  const parentDom = getParentDom(wip);
  // Look for a host sibling at this level; if none, check the parent level
  // (handles fibers nested inside function components with no host wrapper).
  const before =
    getHostSibling(wip) ??
    (wip.return ? getHostSibling(wip.return) : null);

  if (before) parentDom.insertBefore(node, before);
  else parentDom.appendChild(node);
};

// ---------------------------------------------------------------------------
// placeNode
// ---------------------------------------------------------------------------

/**
 * Physically place or re-place `node` in the DOM and attach its ref.
 * Used for both PlacementFlag (new nodes) and MoveFlag (reordered nodes).
 */
export const placeNode = (wip: Fiber, node: Node): void => {
  insertIntoParent(wip, node);
  precacheFiberNode(wip, node);
  attachRef(wip);
};
