import { Fiber, RectifyElement, RectifyKey } from "@rectify-dev/shared";
import { NoFlags } from "./RectifyFiberFlags";
import { NoLanes } from "./RectifyFiberLanes";
import { HostComponent, HostRoot } from "./RectifyFiberWorkTags";
import { getFiberTagFromElement } from "./RectifyFiberService";

export const createFiber = (
  workTag: symbol,
  pendingProps: any,
  key: RectifyKey = null,
): Fiber => {
  return {
    index: 0,
    key,
    workTag,
    type: null,
    pendingProps,
    memoizedProps: null,
    child: null,
    sibling: null,
    return: null,
    stateNode: null,
    deletions: null,
    alternate: null,

    lanes: NoLanes,
    childLanes: NoLanes,

    subtreeFlags: NoFlags,
    flags: NoFlags,

    memoizedState: null,
    refCleanup: null,
  };
};

export const createHostRootFiber = (containerDom: Element) => {
  const root = createFiber(HostRoot, null);
  root.stateNode = containerDom; // containerDom lives on the fiber, not the global
  return {
    containerDom,
    root,
    pendingLanes: NoLanes,
    children: null,
  };
};

export const createWorkInProgress = (current: Fiber, pendingProps: any) => {
  let wip = current.alternate;

  if (!wip) {
    wip = createFiber(current.workTag, pendingProps, current.key);
    wip.type = current.type;
    wip.stateNode = current.stateNode;

    wip.alternate = current;
    current.alternate = wip;
  } else {
    wip.pendingProps = pendingProps;
    wip.deletions = null;
  }

  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;
  wip.refCleanup = current.refCleanup;
  wip.return = current.return;
  wip.child = current.child;
  wip.sibling = current.sibling;
  wip.flags = NoFlags;
  wip.subtreeFlags = NoFlags;
  wip.lanes = current.lanes;
  wip.childLanes = current.childLanes;
  return wip;
};

export const createFiberFromRectifyElement = (
  element: RectifyElement,
): Fiber => {
  const tag = getFiberTagFromElement(element) ?? HostComponent;
  return createFiber(tag, element.props, element.key);
};
