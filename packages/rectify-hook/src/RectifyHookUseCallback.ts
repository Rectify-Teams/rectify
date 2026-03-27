import useMemo from "./RectifyHookUseMemo";

/**
 * Returns a memoized callback. The same function reference is returned on
 * every render unless one of the `deps` changes.
 *
 * This is sugar over `useMemo(() => fn, deps)` — it keeps function identity
 * stable so child components that compare props by reference don't re-render
 * unnecessarily.
 *
 * @example
 * const handleClick = useCallback(() => doSomething(id), [id]);
 */
function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
): T {
  return useMemo(() => callback, deps);
}

export default useCallback;
