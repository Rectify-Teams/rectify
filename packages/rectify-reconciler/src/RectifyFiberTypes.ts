import { RectifyKey, RectifyTypeJsx } from "@rectify/shared";

export type Fiber = {
  alternate: Fiber | null;
  key: RectifyKey;
  workTag: symbol;
  flags: number;
  type: RectifyTypeJsx;
  pendingProps: any;
  memoizedProps: any;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  stateNode: Node | null;
  deletions: Fiber[] | null;
  index: number;

  lanes: number;
  childLanes: number;
};

export type FiberRoot = {
  root: Fiber;
  containerDom: Element;
  pendingLanes: number;
};
