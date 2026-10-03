---
title: useMemo
---

# `useMemo`

```ts
function useMemo<T>(factory: () => T, deps: any[]): T
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `factory` | `() => T` | Computes the memoized value. |
| `deps` | `any[]` | Re-runs `factory` when any dep changes (`Object.is`). Must not be empty. |

## Returns

The memoized value of type `T`.

## See also

- [useMemo guide](/learn/use-memo)
- [useCallback](/api/hooks/use-callback)
