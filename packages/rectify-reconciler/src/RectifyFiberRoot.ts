import { RectifyNode } from "@rectify/shared";
import { FiberRoot } from "./RectifyFiberTypes";
import { createFiber } from "./RectifyFiber";

export const createContainer = (container: Element): FiberRoot => {
  return {
    containerDom: container,
    root: createFiber(),
  };
};

export const updateContainer = (node: RectifyNode, root: FiberRoot) => {
  console.log(">>", { node, root });
};
