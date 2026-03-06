import { RectifyElement, RectifyKey } from "@rectify/shared";
import { NoFlags } from "./RectifyFiberFlags";
import { NoLanes } from "./RectifyFiberLanes";
import { Fiber } from "./RectifyFiberTypes";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
} from "./RectifyFiberWorkTags";
import { isFunction } from "@rectify/shared/utilities";

export const createFiber = (
  workTag: symbol,
  pendingProps: any,
  key: RectifyKey = null,
): Fiber => {
  return {
    index: 0,
    key,
    workTag,
    flags: NoFlags,
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
  };
};

export const createHostRootFiber = (containerDom: Element) => {
  return {
    containerDom,
    root: createFiber(HostRoot, null),
    pendingLanes: NoLanes,
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

    wip.flags = NoFlags;
    wip.deletions = null;
    wip.lanes = NoLanes;
    wip.childLanes = NoLanes;
  }

  wip.memoizedProps = current.memoizedProps;
  wip.return = current.return;
  wip.child = current.child;
  wip.sibling = current.sibling;

  return wip;
};

export const createFiberFromRectifyElement = (
  element: RectifyElement,
): Fiber => {
  const type = element.type;
  const tag = isFunction(type) ? FunctionComponent : HostComponent;

  return createFiber(tag, element.props, element.key);
};
