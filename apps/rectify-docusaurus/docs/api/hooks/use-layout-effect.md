---
id: use-layout-effect
title: useLayoutEffect
slug: /api/hooks/use-layout-effect
---

# `useLayoutEffect`

```ts
function useLayoutEffect(
  create: () => void | (() => void),
  deps?: any[]
): void
```

Identical signature to `useEffect`. Runs **synchronously after DOM mutations, before the browser paints**.

## When to prefer `useLayoutEffect`

| Situation | Use |
|-----------|-----|
| Read DOM measurements, update them synchronously | `useLayoutEffect` |
| Subscriptions, timers, data fetching | `useEffect` |
| Any blocking work | Avoid both — use `useEffect` |

## See also

- [useLayoutEffect guide](/learn/use-layout-effect)
- [useEffect](/api/hooks/use-effect)
