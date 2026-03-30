import type { LazyComponent } from "@rectify-dev/shared";

/**
 * Lazily loads a component via a dynamic import factory.
 *
 * The returned object is used as a JSX element type and behaves like a normal
 * function component once loaded. While loading it suspends the nearest
 * `<Suspense>` boundary, which renders its `fallback` instead.
 *
 * @example
 * const HeavyChart = lazy(() => import("./HeavyChart"));
 *
 * function App() {
 *   return (
 *     <Suspense fallback={<Spinner />}>
 *       <HeavyChart />
 *     </Suspense>
 *   );
 * }
 */
export const lazy = <T>(
  factory: () => Promise<{ default: T } | T>,
): LazyComponent<T> => {
  // Use Object.assign so the value has both the call signature (stub) and
  // the marker properties that the reconciler reads at runtime.
  const stub = (() => null) as unknown as LazyComponent<T>;
  return Object.assign(stub, {
    _isLazy: true as const,
    _status: "uninitialized" as const,
    _result: null,
    _promise: null,
    _factory: factory,
  });
};
