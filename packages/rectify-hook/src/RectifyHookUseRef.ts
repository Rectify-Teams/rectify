import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";

export type RefObject<T> = { current: T };

/**
 * Returns a stable mutable ref object whose `.current` property is initialised
 * to `initialValue`.  The same object is returned on every render — updating
 * `.current` does NOT trigger a re-render.
 *
 * Two common uses:
 *   1. Hold a DOM node:   const el = useRef<HTMLDivElement>(null)
 *   2. Hold a mutable value across renders without causing re-renders.
 */
function useRef<T>(initialValue: T): RefObject<T>;
function useRef<T>(initialValue: T | null): RefObject<T | null>;
function useRef<T = undefined>(): RefObject<T | undefined>;
function useRef<T>(initialValue?: T): RefObject<T | undefined> {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useRef must be used within a function component.");
  }

  const hookIndex = getHookIndex();
  nextHookIndex();

  // Walk the hook linked list to the slot for this hook call.
  let hook = fiber.memoizedState;
  let prevHook = null;
  for (let i = 0; i < hookIndex; i++) {
    prevHook = hook;
    hook = hook?.next ?? null;
  }

  if (!hook) {
    // Mount — create the ref object once and attach it to the linked list.
    const ref: RefObject<T | undefined> = { current: initialValue };
    const newHook = { memoizedState: ref, queue: null, next: null };

    if (prevHook) {
      prevHook.next = newHook;
    } else {
      fiber.memoizedState = newHook;
    }

    return ref;
  }

  // Update — the ref object already exists; return it unchanged.
  // Callers mutate .current directly, which never triggers a re-render.
  return hook.memoizedState as RefObject<T | undefined>;
}

export default useRef;
