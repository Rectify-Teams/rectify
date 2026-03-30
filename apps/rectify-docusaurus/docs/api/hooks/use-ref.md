---
id: use-ref
title: useRef
slug: /api/hooks/use-ref
---

# `useRef`

```ts
function useRef<T>(initialValue?: T): RefObject<T | undefined>

type RefObject<T> = { current: T }
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialValue` | `T` | Initial value for `current`. Defaults to `undefined`. |

## Returns

A `RefObject<T>` — `{ current: T }`. The same object is returned on every render. Mutating `.current` does **not** trigger a re-render.

## Attaching to DOM

```tsx
const ref = useRef<HTMLDivElement>();
<div ref={ref} />
// ref.current is the HTMLDivElement after mount
```

## Callback refs

The `ref` prop also accepts a function:

```ts
type RefCallback = (node: Element | null) => void | (() => void)
```

The function receives the node on mount and `null` on unmount. If it returns a function, that function is called as cleanup on unmount.

## See also

- [useRef guide](/learn/use-ref)
- [Refs and the DOM](/learn/refs-and-dom)
