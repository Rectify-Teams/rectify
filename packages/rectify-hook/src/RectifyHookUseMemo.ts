import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";
import { depsChanged } from "./RectifyHookDeps";

type MemoState<T> = {
  value: T;
  deps: any[] | undefined;
};

/**
 * Returns a memoized value. `factory` is only re-executed when one of the
 * `deps` changes (using `Object.is` comparison), otherwise the cached value
 * from the previous render is returned unchanged.
 *
 * @example
 * const sorted = useMemo(() => [...list].sort(), [list]);
 */
function useMemo<T>(factory: () => T, deps: any[]): T {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useMemo must be used within a function component.");
  }

  const hookIndex = getHookIndex();

  let hook = fiber.memoizedState;
  let prevHook = null;
  for (let i = 0; i < hookIndex; i++) {
    prevHook = hook;
    hook = hook?.next ?? null;
  }

  if (!hook) {
    // Mount – compute and cache the initial value.
    const state: MemoState<T> = { value: factory(), deps };
    const newHook = { memoizedState: state, queue: null, next: null };
    if (prevHook) prevHook.next = newHook;
    else fiber.memoizedState = newHook;
  } else {
    // Update – recompute only when deps changed.
    const prev = hook.memoizedState as MemoState<T>;
    if (depsChanged(prev.deps, deps)) {
      const state: MemoState<T> = { value: factory(), deps };
      hook.memoizedState = state;
    }
  }

  nextHookIndex();

  let slot = fiber.memoizedState;
  for (let i = 0; i < hookIndex; i++) slot = slot!.next;
  return (slot!.memoizedState as MemoState<T>).value;
}

export default useMemo;
