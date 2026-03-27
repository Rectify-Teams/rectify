import { Fiber, Hook } from "@rectify/shared";
import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";
import { depsChanged } from "./RectifyHookDeps";

type EffectState = {
  create: () => void | (() => void);
  deps: any[] | undefined;
  cleanup: (() => void) | undefined;
};

// Effects collected during render, flushed after commit
const pendingEffects: EffectState[] = [];

// Cleanups deferred from the render phase – fired before new effects run
const pendingCleanups: EffectState[] = [];

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
      // Defer the old cleanup to post-commit (not during render).
      pendingCleanups.push(prev);
      const effectState: EffectState = { create, deps, cleanup: undefined };
      hook.memoizedState = effectState;
      pendingEffects.push(effectState);
    }
  }

  nextHookIndex();
}

/**
 * Run cleanups queued during the render phase (dep-changed effects).
 * Must be called after commit but before flushEffects.
 */
export const flushEffectCleanups = (): void => {
  for (const effect of pendingCleanups.splice(0)) {
    effect.cleanup?.();
  }
};

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
