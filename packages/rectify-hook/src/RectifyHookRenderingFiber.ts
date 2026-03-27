import { Fiber, Hook } from "@rectify/shared";

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

// ---------------------------------------------------------------------------
// Shared hook-slot utility
// ---------------------------------------------------------------------------

/**
 * Walks the hook linked list on `fiber` to the slot at `hookIndex`.
 * Returns the existing hook if found, or `null` on mount (slot doesn't exist
 * yet). In the mount case, `prevHook` points to the slot just before the gap
 * so the caller can attach the new hook.
 */
export const getHookSlot = (
  fiber: Fiber,
  hookIndex: number,
): { hook: Hook | null; prevHook: Hook | null } => {
  let hook: Hook | null = fiber.memoizedState;
  let prevHook: Hook | null = null;

  for (let i = 0; i < hookIndex; i++) {
    prevHook = hook;
    hook = hook?.next ?? null;
  }

  return { hook, prevHook };
};

/**
 * Attaches `newHook` into `fiber`'s linked list at the position indicated by
 * `prevHook` (null means insert at the head).
 */
export const attachHook = (fiber: Fiber, newHook: Hook, prevHook: Hook | null): void => {
  if (prevHook) prevHook.next = newHook;
  else fiber.memoizedState = newHook;
};
