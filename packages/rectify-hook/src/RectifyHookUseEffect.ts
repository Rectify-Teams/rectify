import { Fiber, Hook } from "@rectify/shared";
import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";

type EffectState = {
  create: () => void | (() => void);
  deps: any[] | undefined;
  cleanup: (() => void) | undefined;
};

// Effects collected during render, flushed after commit
const pendingEffects: EffectState[] = [];

const depsChanged = (
  prev: any[] | undefined,
  next: any[] | undefined,
): boolean => {
  if (!prev || !next) return true;
  if (prev.length !== next.length) return true;
  return next.some((dep, i) => !Object.is(dep, prev[i]));
};

function useEffect(
  create: () => void | (() => void),
  deps?: any[],
): void {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useEffect must be used within a function component.");
  }

  const hookIndex = getHookIndex();

  // Walk the hook linked list to find (or create) this hook's slot
  let hook: Hook | null = fiber.memoizedState;
  let prevHook: Hook | null = null;
  for (let i = 0; i < hookIndex; i++) {
    prevHook = hook;
    hook = hook?.next ?? null;
  }

  if (!hook) {
    // Mount – always schedule the effect
    const effectState: EffectState = { create, deps, cleanup: undefined };
    const newHook: Hook = { memoizedState: effectState, queue: null, next: null };

    if (prevHook) prevHook.next = newHook;
    else fiber.memoizedState = newHook;

    pendingEffects.push(effectState);
  } else {
    // Update – only re-run if deps changed
    const prev = hook.memoizedState as EffectState;
    if (depsChanged(prev.deps, deps)) {
      prev.cleanup?.();
      const effectState: EffectState = { create, deps, cleanup: undefined };
      hook.memoizedState = effectState;
      pendingEffects.push(effectState);
    }
  }

  nextHookIndex();
}

/** Run all effects collected during the last render. Called after commit. */
export const flushEffects = (): void => {
  for (const effect of pendingEffects.splice(0)) {
    const cleanup = effect.create();
    if (typeof cleanup === "function") {
      effect.cleanup = cleanup;
    }
  }
};

/**
 * Called during the commit deletion pass. Walks a fiber's hook linked list
 * and fires the cleanup of every effect hook found on it.
 */
export const runEffectCleanups = (fiber: Fiber): void => {
  let hook = fiber.memoizedState;
  while (hook) {
    const state = hook.memoizedState;
    if (state !== null && typeof (state as EffectState).create === "function") {
      (state as EffectState).cleanup?.();
    }
    hook = hook.next;
  }
};

export default useEffect;
