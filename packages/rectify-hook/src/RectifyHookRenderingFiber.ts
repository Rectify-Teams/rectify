import { Fiber, isFunction } from "@rectify/shared";

type ScheduleRerender = (fiber: Fiber) => void;

type Instance = {
  fiberRendering: Fiber | null;
  hookIndex: number;
  scheduleRerender: ScheduleRerender | null;
};

const instance: Instance = {
  fiberRendering: null,
  hookIndex: 0,
  scheduleRerender: null,
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

export const setScheduleRerender = (fn: ScheduleRerender) => {
  instance.scheduleRerender = fn;
};

export const scheduleRerender = (fiber: Fiber) => {
  instance.scheduleRerender?.(fiber);
};
