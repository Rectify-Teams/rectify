import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
  getHookSlot,
  attachHook,
} from "./RectifyHookRenderingFiber";

/**
 * Counter that increments once per `useId` call across the whole render pass.
 * Reset to 0 before each component render via `prepareToUseHooks`.
 * Using a module-level counter keeps IDs stable across concurrent renders
 * because each fiber renders in isolation and the counter is local to the
 * hook slot (stored in memoizedState).
 */
let _idCounter = 0;

/** Generate the next unique ID string. */
const generateId = (): string => `_r${(_idCounter++).toString(36)}_`;

/**
 * Returns a stable, globally unique ID string that is consistent across
 * server and client renders within the same component instance.
 *
 * The ID is generated once on mount and returned unchanged on every
 * subsequent render — it never changes for the lifetime of the component.
 *
 * @example
 * const inputId = useId();
 * return (
 *   <>
 *     <label htmlFor={inputId}>Name</label>
 *     <input id={inputId} />
 *   </>
 * );
 */
const useId = (): string => {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useId must be used within a function component.");
  }

  const hookIndex = getHookIndex();
  nextHookIndex();

  const { hook, prevHook } = getHookSlot(fiber, hookIndex);

  if (!hook) {
    // Mount: generate and permanently store the ID.
    const newHook = {
      memoizedState: generateId(),
      queue: null,
      next: null,
    };
    attachHook(fiber, newHook, prevHook);
    return newHook.memoizedState as string;
  }

  // Update: return the already-stored ID unchanged.
  return hook.memoizedState as string;
};

export default useId;
