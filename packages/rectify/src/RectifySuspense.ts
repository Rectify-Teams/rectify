import type { SuspenseProps } from "@rectify-dev/shared";

/**
 * Catches thrown promises from any child (including lazy components) and
 * renders `fallback` until they resolve.
 *
 * Marked as a sentinel with `_isSuspense` so the reconciler can identify it
 * without a dedicated $$typeof symbol — consistent with how MemoComponent
 * and ContextProvider are detected.
 *
 * @example
 * <Suspense fallback={<Spinner />}>
 *   <LazyPage />
 * </Suspense>
 */
export const Suspense = (_props: SuspenseProps): null => null;
(Suspense as any)._isSuspense = true;
