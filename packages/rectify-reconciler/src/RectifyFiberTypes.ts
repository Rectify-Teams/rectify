import { Fiber, RectifyNode } from "@rectify-dev/shared";

export type FiberRoot = {
  root: Fiber;
  containerDom: Element;
  pendingLanes: number;
  children: RectifyNode;
};
