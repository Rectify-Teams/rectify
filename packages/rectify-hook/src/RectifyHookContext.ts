import { Fiber } from "@rectify-dev/shared";
import { getFiberRendering } from "./RectifyHookRenderingFiber";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A context object that is also its own Provider component.
 * Both forms are equivalent:
 *   jsx(MyContext, { value, children })           // Context as Provider
 *   jsx(MyContext.Provider, { value, children })  // Classic Provider form
 */
export type RectifyContext<T> = {
  (props: { value: T; children?: any }): null;
  /** Self-reference used by the reconciler to identify Provider fibers. */
  _context: RectifyContext<T>;
  _defaultValue: T;
  _subscribers: Set<Fiber>;
  /** Alias to self — `Context.Provider === Context`. */
  Provider: RectifyContext<T>;
};

// ---------------------------------------------------------------------------
// Mark-dirty injection (provided by the reconciler at startup)
// ---------------------------------------------------------------------------

type MarkFiberDirty = (fiber: Fiber) => void;
let markFiberDirtyFn: MarkFiberDirty | null = null;

/** Injected by the reconciler so context can mark subscriber lanes directly. */
export const setMarkFiberDirty = (fn: MarkFiberDirty): void => {
  markFiberDirtyFn = fn;
};

// ---------------------------------------------------------------------------
// Per-fiber subscription tracking (for cleanup on unmount)
// ---------------------------------------------------------------------------

/**
 * Maps each fiber to the contexts it has subscribed to.
 * WeakMap so fibers that become unreachable are GC'd automatically.
 */
const fiberSubscriptions = new WeakMap<Fiber, Set<RectifyContext<any>>>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new context. The returned object is itself a Provider component,
 * so both forms below are equivalent:
 *
 * @example
 * const ThemeCtx = createContext<'light' | 'dark'>('light');
 *
 * // Option A – Context used directly as Provider
 * jsx(ThemeCtx, { value: 'dark', children: ... })
 *
 * // Option B – Classic .Provider form
 * jsx(ThemeCtx.Provider, { value: 'dark', children: ... })
 */
export function createContext<T>(defaultValue: T): RectifyContext<T> {
  // The function body is intentionally a no-op — the reconciler gives this
  // fiber a ContextProvider work tag and handles it without calling the fn.
  function ProviderFn(_props: { value: T; children?: any }): null {
    return null;
  }

  const context = ProviderFn as unknown as RectifyContext<T>;
  context._context = context;      // self-reference: identifies Provider fibers
  context._defaultValue = defaultValue;
  context._subscribers = new Set();
  context.Provider = context;      // Provider is an alias to self

  return context;
}

/**
 * Reads the current value of `context` for the calling component.
 *
 * Walks up the fiber tree to the nearest matching Provider and reads its
 * `pendingProps.value` directly — no render-time stack required. This means
 * the correct value is always returned even when the Provider did not
 * re-render in the current pass.
 *
 * The component re-renders whenever the nearest Provider supplies a new value
 * (compared with `Object.is`). Unlike other hooks this does NOT consume a
 * hook slot and may be called conditionally.
 *
 * @example
 * const theme = useContext(ThemeCtx); // 'light' | 'dark'
 */
export function useContext<T>(context: RectifyContext<T>): T {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useContext must be used within a function component.");
  }

  // Walk up the fiber tree to find the nearest Provider for this context.
  let ancestor = fiber.return;
  while (ancestor) {
    if ((ancestor.type as any)?._context === context) {
      // Replace any stale subscription from the previous incarnation of this
      // fiber (its alternate) so the subscriber set never accumulates stale refs.
      if (fiber.alternate) {
        context._subscribers.delete(fiber.alternate);
        const altSet = fiberSubscriptions.get(fiber.alternate);
        if (altSet) {
          altSet.delete(context);
          if (altSet.size === 0) fiberSubscriptions.delete(fiber.alternate);
        }
      }

      context._subscribers.add(fiber);
      let ctxSet = fiberSubscriptions.get(fiber);
      if (!ctxSet) {
        ctxSet = new Set();
        fiberSubscriptions.set(fiber, ctxSet);
      }
      ctxSet.add(context);

      // Read the value straight from the Provider's pending props.
      // This is always correct: if the Provider re-rendered this pass its
      // pendingProps hold the new value; if it didn't, pendingProps equals
      // the last committed value (copied by createWorkInProgress).
      return ancestor.pendingProps.value as T;
    }
    ancestor = ancestor.return;
  }

  // No Provider found — return the default value (no subscription needed).
  return context._defaultValue;
}

// ---------------------------------------------------------------------------
// Reconciler helpers
// ---------------------------------------------------------------------------

/**
 * Mark all subscribers of `context` dirty so they skip the bailout and
 * re-render in the current pass. Called by `beginWork` when a ContextProvider
 * detects that its value has changed. Marks lanes directly instead of
 * scheduling a second render so consumers update in the same render pass.
 */
export function notifyContextConsumers<T>(context: RectifyContext<T>): void {
  if (!markFiberDirtyFn) return;
  for (const subscriber of context._subscribers) {
    markFiberDirtyFn(subscriber);
  }
}

/**
 * Unregister `fiber` from every context it subscribed to.
 * Called during the commit deletion pass.
 */
export function clearContextSubscriptions(fiber: Fiber): void {
  const ctxSet = fiberSubscriptions.get(fiber);
  if (!ctxSet) return;

  for (const context of ctxSet) {
    context._subscribers.delete(fiber);
  }

  fiberSubscriptions.delete(fiber);
}
