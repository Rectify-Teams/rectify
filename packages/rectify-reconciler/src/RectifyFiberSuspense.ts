import { Fiber } from "@rectify-dev/shared";
import { SuspenseComponent } from "./RectifyFiberWorkTags";
import { enqueueUpdate } from "./RectifyFiberConcurrentUpdate";
import { scheduleRenderLane } from "./RectifyFiberScheduler";
import { DefaultLane } from "./RectifyFiberLanes";

// ---------------------------------------------------------------------------
// Suspension state
// ---------------------------------------------------------------------------

/**
 * Tracks which Suspense fibers are currently suspended.
 *
 * We key by the "stable" fiber — the committed (current) side of the
 * alternate pair — so the state survives across WIP ↔ current swaps.
 * The WeakSet lets GC reclaim entries when boundaries are unmounted.
 */
const suspendedBoundaries = new WeakSet<Fiber>();

/** Resolve the committed side of a fiber for stable identity. */
const stableFiber = (fiber: Fiber): Fiber => fiber.alternate ?? fiber;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns true when the Suspense boundary is currently showing its fallback. */
export const isSuspendedBoundary = (fiber: Fiber): boolean =>
  suspendedBoundaries.has(stableFiber(fiber));

/**
 * Walk up the return chain and return the nearest ancestor whose workTag
 * is SuspenseComponent, or null if there is none.
 */
export const findNearestSuspenseBoundary = (fiber: Fiber): Fiber | null => {
  let current = fiber.return;
  while (current) {
    if (current.workTag === SuspenseComponent) return current;
    current = current.return;
  }
  return null;
};

/**
 * Called by the work loop when a child throws a thenable (promise).
 *
 * Responsibilities:
 *  1. Mark the boundary as suspended so `beginWork` renders the fallback.
 *  2. Reset its partial render (clear child / deletions).
 *  3. Subscribe to the thenable — when it resolves, clear the suspended
 *     state and schedule a re-render of the boundary.
 */
export const handleSuspendedWork = (
  boundary: Fiber,
  thenable: Promise<any>,
): void => {
  const stable = stableFiber(boundary);

  // Avoid double-subscribing if a second suspend fires for the same boundary.
  if (suspendedBoundaries.has(stable)) return;
  suspendedBoundaries.add(stable);

  // Discard any partially-rendered children so beginWork starts fresh
  // and reconciles against the fallback instead.
  boundary.child = null;
  boundary.deletions = null;

  thenable.then(
    () => {
      // Module loaded / promise resolved — un-suspend and re-render.
      suspendedBoundaries.delete(stable);
      enqueueUpdate({ lanes: DefaultLane, fiber: stable, next: null });
      scheduleRenderLane(DefaultLane);
    },
    () => {
      // Rejection: un-suspend so error boundaries (future work) can take over.
      suspendedBoundaries.delete(stable);
    },
  );
};

/** Returns true for any value that looks like a thenable (Promise or custom). */
export const isThenable = (value: unknown): value is Promise<any> =>
  value !== null &&
  typeof value === "object" &&
  typeof (value as any).then === "function";
