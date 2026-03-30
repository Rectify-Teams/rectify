---
id: use-ref
title: useRef
sidebar_position: 12
slug: /learn/use-ref
---

# `useRef`

`useRef` returns a stable **mutable container** `{ current: T }`. Mutations to `.current` do **not** trigger a re-render.

```ts
function useRef<T>(initialValue?: T): RefObject<T | undefined>
```

## Accessing DOM nodes

The most common use: attach a ref to a JSX element via the `ref` prop.

```tsx
import { useRef, useEffect } from "@rectify-dev/core";

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Auto-focused" />;
}
```

## Storing mutable values

Use a ref when you need a value that persists across renders **without** causing re-renders on change:

```tsx
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameId   = useRef<number>(0);

  const start = () => {
    startTime.current = performance.now() - elapsed;
    const tick = () => {
      setElapsed(Math.floor(performance.now() - startTime.current!));
      frameId.current = requestAnimationFrame(tick);
    };
    frameId.current = requestAnimationFrame(tick);
  };

  const stop = () => cancelAnimationFrame(frameId.current);

  return (
    <div>
      <p>{(elapsed / 1000).toFixed(2)}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

## Storing the previous value

```tsx
function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current; // previous value (before this render)
}
```

## Callback refs

Instead of a ref object, pass a **function** to `ref`. Rectify calls it with the DOM node when mounted and with `null` (or your cleanup return value) when unmounted.

```tsx
function MeasureBox() {
  const [height, setHeight] = useState(0);

  const measure = (node: HTMLDivElement | null) => {
    if (node) setHeight(node.getBoundingClientRect().height);
  };

  return (
    <div>
      <div ref={measure} style={{ padding: "2rem" }}>
        Measured content
      </div>
      <p>Height: {height}px</p>
    </div>
  );
}
```

Callback refs can optionally return a cleanup function (called on unmount):

```tsx
const resizeRef = (node: HTMLElement | null) => {
  if (!node) return;
  const observer = new ResizeObserver(() => { /* ... */ });
  observer.observe(node);
  return () => observer.disconnect(); // ref cleanup
};
```

## `useRef` vs `useState`

| | `useRef` | `useState` |
|---|---|---|
| Causes re-render | ❌ No | ✅ Yes |
| Persists across renders | ✅ Yes | ✅ Yes |
| Synchronously readable | ✅ Yes | ✅ Yes (current render) |
| Use for | DOM nodes, timers, previous values | UI-visible state |
