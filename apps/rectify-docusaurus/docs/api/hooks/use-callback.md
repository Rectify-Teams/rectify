---
id: use-callback
title: useCallback
slug: /api/hooks/use-callback
---

# `useCallback`

```ts
function useCallback<T extends Function>(callback: T, deps: any[]): T
```

Equivalent to `useMemo(() => callback, deps)`.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `T` | The function to memoize. |
| `deps` | `any[]` | Re-creates the callback when any dep changes. |

## Returns

A stable function reference of type `T`.

## See also

- [useCallback guide](/learn/use-callback)
- [useMemo](/api/hooks/use-memo)
