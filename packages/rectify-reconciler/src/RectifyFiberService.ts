import { Fiber } from "./RectifyFiberTypes";

const addFlagToFiber = (fiber: Fiber, flag: number): void => {
  if (hasFlagOnFiber(fiber, flag)) return;
  fiber.flags |= flag;
};

const removeFlagFromFiber = (fiber: Fiber | null, flag: number): void => {
  if (!hasFlagOnFiber(fiber, flag)) return;
  fiber!.flags &= ~flag;
};

const hasFlagOnFiber = (fiber: Fiber | null, flag: number): boolean => {
  if (!fiber) return false;
  return (fiber.flags & flag) !== 0;
};

export { addFlagToFiber, removeFlagFromFiber, hasFlagOnFiber };
