import { applyPropsToDom, precacheFiberNode } from "@rectify-dev/dom-binding";
import { Fiber } from "@rectify-dev/shared";
import { MoveFlag, PlacementFlag, RefFlag, UpdateFlag } from "./RectifyFiberFlags";
import {
  createDomElementFromFiber,
  hasFlagOnFiber,
  removeFlagFromFiber,
} from "./RectifyFiberService";
import { HostComponent, HostText } from "./RectifyFiberWorkTags";
import { attachRef, detachRef } from "./RectifyFiberCommitRef";
import { placeNode } from "./RectifyFiberCommitPlacement";

// ---------------------------------------------------------------------------
// Host element
// ---------------------------------------------------------------------------

const commitMutationHostComponent = (wip: Fiber): void => {
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

// ---------------------------------------------------------------------------
// Host text
// ---------------------------------------------------------------------------

const commitMutationHostText = (wip: Fiber): void => {
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

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export const commitMutation = (fiber: Fiber): void => {
  switch (fiber.workTag) {
    case HostComponent:
      commitMutationHostComponent(fiber);
      break;
    case HostText:
      commitMutationHostText(fiber);
      break;
  }
};
