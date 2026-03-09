import { Fiber, RectifyNode } from "@rectify/shared";

export type FiberRoot = {
  root: Fiber;
  containerDom: Element;
  pendingLanes: number;
  children: RectifyNode;
};
