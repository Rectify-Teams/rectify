import { Fiber } from "@rectify/shared";

export type FiberRoot = {
  root: Fiber;
  containerDom: Element;
  pendingLanes: number;
};
