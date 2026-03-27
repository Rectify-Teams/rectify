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

  // Walk the hook linked list to find (or create) this hook's slot.
  let hook = fiber.memoizedState;
  let prevHook = null;
  for (let i = 0; i < hookIndex; i++) {
    prevHook = hook;
    hook = hook?.next ?? null;
  }

  if (!hook) {
    // Mount – create the ref object once and store it.
    const ref: RefObject<T | undefined> = { current: initialValue };
    const newHook = { memoizedState: ref, queue: null, next: null };

    if (prevHook) prevHook.next = newHook;
    else fiber.memoizedState = newHook;
  }
  // Update – the same ref object is already in memoizedState; do nothing.
  // Callers mutate .current directly; that never triggers a re-render.

  nextHookIndex();

  // The hook slot is guaranteed to exist by this point.
  let slot = fiber.memoizedState;
  for (let i = 0; i < hookIndex; i++) slot = slot!.next;
  return slot!.memoizedState as RefObject<T | undefined>;
}

export default useRef;
