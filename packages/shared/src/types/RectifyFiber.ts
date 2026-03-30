import { RectifyKey, RectifyTypeJsx } from "./RectifyTypes";

export type UpdateQueue<S = any> = {
  action: S | ((prev: S) => S);
  next: UpdateQueue<S> | null;
};

export type Hook<S = any> = {
  memoizedState: S;
  queue: UpdateQueue<S> | null;
  next: Hook | null;
};

export type Fiber = {
  alternate: Fiber | null;
  key: RectifyKey;
  workTag: symbol;
  type: RectifyTypeJsx;
  pendingProps: any;
  memoizedProps: any;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  stateNode: Node | null;
  /** For ClassComponent fibers: holds the class instance. */
  classInstance: { render(): any; [key: string]: any } | null;
  deletions: Fiber[] | null;
  index: number;

  lanes: number;
  childLanes: number;

  flags: number;
  subtreeFlags: number;

  memoizedState: Hook | null;

  /** Cleanup function returned by a callback ref. Called before the next attach or on unmount. */
  refCleanup: (() => void) | null;
};
