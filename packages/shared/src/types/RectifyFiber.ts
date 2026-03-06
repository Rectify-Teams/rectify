import { RectifyKey, RectifyTypeJsx } from "./RectifyTypes";

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
