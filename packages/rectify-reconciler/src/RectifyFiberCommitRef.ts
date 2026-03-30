import { Fiber } from "@rectify-dev/shared";

// ---------------------------------------------------------------------------
// attachRef
// ---------------------------------------------------------------------------

/**
 * Attach a ref after a node is placed or the ref prop changes.
 * For callback refs, the return value is stored as a cleanup to be called
 * before the next attach or on unmount (React 19-style cleanup refs).
 */
export const attachRef = (wip: Fiber): void => {
  const ref = wip.pendingProps?.ref;
  if (!ref) return;

  if (typeof ref === "function") {
    const cleanup = ref(wip.stateNode);
    wip.refCleanup = typeof cleanup === "function" ? cleanup : null;
  } else if (typeof ref === "object" && "current" in ref) {
    ref.current = wip.stateNode;
  }
};

// ---------------------------------------------------------------------------
// detachRef
// ---------------------------------------------------------------------------

/**
 * Detach a ref when the fiber is removed or the ref prop changes.
 * Calls the stored cleanup (if any), otherwise falls back to `ref(null)` /
 * clearing `.current`.
 */
export const detachRef = (fiber: Fiber): void => {
  if (fiber.refCleanup) {
    fiber.refCleanup();
    fiber.refCleanup = null;
    return;
  }

  const ref = fiber.memoizedProps?.ref;
  if (!ref) return;

  if (typeof ref === "function") {
    ref(null);
  } else if (typeof ref === "object" && "current" in ref) {
    ref.current = null;
  }
};
