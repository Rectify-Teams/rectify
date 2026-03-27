import { Fiber, Hook } from "@rectify/shared";
import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";
import { depsChanged } from "./RectifyHookDeps";
import type { EffectState } from "./RectifyHookTypes";

// Layout effects collected during render, flushed synchronously after commit
const pendingLayoutEffects: EffectState[] = [];

// Layout cleanups deferred from the render phase
const pendingLayoutCleanups: EffectState[] = [];

/**
 * Like `useEffect`, but fires **synchronously after every DOM mutation** and
 * before the browser has a chance to paint.  Use this when you need to read
 * layout or synchronously re-style the DOM (tooltips, scroll restoration,
 * measuring element sizes, etc.).
 *
 * Prefer `useEffect` for everything else – `useLayoutEffect` blocks the paint.
 *
 * @example
 * useLayoutEffect(() => {
 *   const { height } = ref.current.getBoundingClientRect();
 *   setTooltipTop(-height);
 * }, []);
 */
function useLayoutEffect(
  create: () => void | (() => void),
  deps?: any[],
): void {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useLayoutEffect must be used within a function component.");
  }

  const hookIndex = getHookIndex();
  nextHookIndex();

  let hook: Hook | null = fiber.memoizedState;
  let prevHook: Hook | null = null;
  for (let i = 0; i < hookIndex; i++) {
    prevHook = hook;
    hook = hook?.next ?? null;
  }

  if (!hook) {
    // Mount – always schedule the layout effect.
    const effectState: EffectState = { create, deps, cleanup: undefined };
    const newHook: Hook = { memoizedState: effectState, queue: null, next: null };

    if (prevHook) {
      prevHook.next = newHook;
    } else {
      fiber.memoizedState = newHook;
    }

    pendingLayoutEffects.push(effectState);
  } else {
    // Update – only re-run if deps changed.
    const prev = hook.memoizedState as EffectState;
    if (depsChanged(prev.deps, deps)) {
      pendingLayoutCleanups.push(prev);
      const effectState: EffectState = { create, deps, cleanup: undefined };
      hook.memoizedState = effectState;
      pendingLayoutEffects.push(effectState);
    }
  }
}

/**
 * Run layout cleanups queued during render (dep-changed layout effects).
 * Called synchronously after commit, before flushLayoutEffects.
 */
export const flushLayoutEffectCleanups = (): void => {
  for (const effect of pendingLayoutCleanups.splice(0)) {
    effect.cleanup?.();
  }
};

/**
 * Run all layout effects collected during the last render.
 * Called synchronously after commit, before the browser paints.
 */
export const flushLayoutEffects = (): void => {
  for (const effect of pendingLayoutEffects.splice(0)) {
    const cleanup = effect.create();
    if (typeof cleanup === "function") {
      effect.cleanup = cleanup;
    }
  }
};

/**
 * Called during the commit deletion pass. Fires layout cleanups on removed
 * fibers so they don't observe a stale DOM.
 */
export const runLayoutEffectCleanups = (fiber: Fiber): void => {
  let hook = fiber.memoizedState;
  while (hook) {
    const state = hook.memoizedState;
    if (state !== null && typeof (state as EffectState).create === "function") {
      (state as EffectState).cleanup?.();
    }
    hook = hook.next;
  }
};

export default useLayoutEffect;
