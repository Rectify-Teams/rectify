import { Fiber } from "./RectifyFiberTypes";

export const createFiber = (): Fiber => {
  return {
    child: null,
    stateNode: null,
  };
};
