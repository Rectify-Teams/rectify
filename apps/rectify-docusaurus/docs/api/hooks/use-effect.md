---
id: use-effect
title: useEffect
slug: /api/hooks/use-effect
---

# `useEffect`

```ts
function useEffect(
  create: () => void | (() => void),
  deps?: any[]
): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `create` | `() => void \| (() => void)` | Effect function. May return a cleanup. |
| `deps` | `any[]` | Dependencies. Effect re-runs when any dep changes (`Object.is`). Omit to run after every render. `[]` to run once. |

## Timing

Runs **asynchronously after the browser paints**. Does not block visual updates.

## See also

- [useEffect guide](/learn/use-effect)
- [useLayoutEffect](/api/hooks/use-layout-effect) — synchronous variant
