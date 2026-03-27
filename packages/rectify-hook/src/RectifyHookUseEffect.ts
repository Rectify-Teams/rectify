import { Fiber, Hook } from "@rectify-dev/shared";
import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
  getHookSlot,
  attachHook,
} from "./RectifyHookRenderingFiber";
import { depsChanged } from "./RectifyHookDeps";
import type { EffectState } from "./RectifyHookTypes";

// Effects collected during render, flushed after commit.
const pendingEffects: EffectState[] = [];

// Cleanups deferred from the render phase — fired before new effects run.
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
  nextHookIndex();

  const { hook, prevHook } = getHookSlot(fiber, hookIndex);

  if (!hook) {
    // Mount — always schedule the effect.
    const effectState: EffectState = { create, deps, cleanup: undefined };
    const newHook: Hook = { memoizedState: effectState, queue: null, next: null };
    attachHook(fiber, newHook, prevHook);
    pendingEffects.push(effectState);
  } else {
    // Update — only re-run if deps changed.
    const prev = hook.memoizedState as EffectState;
    if (depsChanged(prev.deps, deps)) {
      pendingCleanups.push(prev); // defer old cleanup to post-commit
      const effectState: EffectState = { create, deps, cleanup: undefined };
      hook.memoizedState = effectState;
      pendingEffects.push(effectState);
    }
  }
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
