/**
 * Returns true when the dependency arrays are different.
 * Used by useEffect, useMemo and useCallback.
 */
export const depsChanged = (
  prev: any[] | undefined,
  next: any[] | undefined,
): boolean => {
  if (!prev || !next) return true;
  if (prev.length !== next.length) return true;
  return next.some((dep, i) => !Object.is(dep, prev[i]));
};
