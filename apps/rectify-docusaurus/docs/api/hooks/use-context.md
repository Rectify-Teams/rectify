---
id: use-context
title: useContext
slug: /api/hooks/use-context
---

# `useContext`

```ts
function useContext<T>(context: RectifyContext<T>): T
```

Reads the value from the nearest matching Provider above the calling component.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `RectifyContext<T>` | Context object created by `createContext`. |

## Returns

The current context value `T`. Falls back to `context._defaultValue` if no Provider is found.

## Notes

- Does **not** consume a hook slot — can be called conditionally.
- Subscribes the component: when the Provider's `value` changes, the component re-renders.

## See also

- [useContext guide](/learn/use-context)
- [createContext](/api/create-context)
