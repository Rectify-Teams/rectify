import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
  getHookSlot,
  attachHook,
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
  nextHookIndex();

  const { hook, prevHook } = getHookSlot(fiber, hookIndex);

  if (!hook) {
    // Mount – compute and cache the initial value.
    const state: MemoState<T> = { value: factory(), deps };
    attachHook(fiber, { memoizedState: state, queue: null, next: null }, prevHook);
    return state.value;
  }

  // Update – recompute only when deps changed.
  const prev = hook.memoizedState as MemoState<T>;
  if (depsChanged(prev.deps, deps)) {
    const state: MemoState<T> = { value: factory(), deps };
    hook.memoizedState = state;
    return state.value;
  }

  return prev.value;
}

export default useMemo;
