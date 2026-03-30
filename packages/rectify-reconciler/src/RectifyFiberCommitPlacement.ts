import { precacheFiberNode } from "@rectify-dev/dom-binding";
import { Fiber } from "@rectify-dev/shared";
import { getParentDom, getHostSibling } from "./RectifyFiberService";
import { HostComponent, HostRoot } from "./RectifyFiberWorkTags";
import { attachRef } from "./RectifyFiberCommitRef";

// ---------------------------------------------------------------------------
// insertIntoParent
// ---------------------------------------------------------------------------

const insertIntoParent = (wip: Fiber, node: Node): void => {
  const parentDom = getParentDom(wip);

  // Walk up through non-host ancestors looking for a host sibling to use as
  // an insertBefore reference.  Only climbing as far as the host parent —
  // stopping at HostComponent/HostRoot prevents us from crossing into a
  // sibling DOM subtree that belongs to a different parent.
  let cursor: Fiber | null = wip;
  while (cursor) {
    const before = getHostSibling(cursor);
    if (before) {
      parentDom.insertBefore(node, before);
      return;
    }
    const parent: Fiber | null = cursor.return;
    // Stop once the immediate parent is itself a host node.
    if (!parent || parent.workTag === HostComponent || parent.workTag === HostRoot) break;
    cursor = parent;
  }

  parentDom.appendChild(node);
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
