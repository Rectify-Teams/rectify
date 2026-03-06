import { Fiber, isFunction } from "@rectify/shared";

type Instance = {
  fiberRendering: Fiber | null;
  hookIndex: number;
};

const instance: Instance = {
  fiberRendering: null,
  hookIndex: 0,
};

export const getFiberRendering = () => instance.fiberRendering;
export const setFiberRendering = (fiber: Fiber | null) => {
  instance.fiberRendering = fiber;
};

export const getHookIndex = () => instance.hookIndex;
export const setHookIndex = (index: number | ((prev: number) => number)) => {
  instance.hookIndex = isFunction(index) ? index(instance.hookIndex) : index;
};
export const nextHookIndex = () => setHookIndex((p) => p + 1);
