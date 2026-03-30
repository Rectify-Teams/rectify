---
id: use-deferred-value
title: useDeferredValue
slug: /api/hooks/use-deferred-value
---

# `useDeferredValue`

```ts
function useDeferredValue<T>(value: T): T
```

Returns a deferred copy of `value` that lags behind on high-priority renders and catches up on a lower-priority (TransitionLane) re-render.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `T` | The value to defer. |

## Returns

The deferred copy of `value`. On the initial render this equals `value`. On high-priority updates it returns the previous value until a deferred re-render catches up.

## Detecting staleness

```ts
const isStale = value !== deferredValue;
```

## See also

- [useDeferredValue guide](/learn/use-deferred-value)
