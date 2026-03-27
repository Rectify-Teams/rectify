import { Fiber } from "@rectify/shared";

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

export const getFiberRendering = (): Fiber | null => instance.fiberRendering;

export const setFiberRendering = (fiber: Fiber | null): void => {
  instance.fiberRendering = fiber;
};

export const getHookIndex = (): number => instance.hookIndex;

export const setHookIndex = (index: number): void => {
  instance.hookIndex = index;
};

export const nextHookIndex = (): void => {
  instance.hookIndex += 1;
};

export const setScheduleRerender = (fn: ScheduleRerender): void => {
  instance.scheduleRerender = fn;
};

export const scheduleRerender = (fiber: Fiber): void => {
  instance.scheduleRerender?.(fiber);
};
