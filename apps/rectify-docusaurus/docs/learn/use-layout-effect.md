---
id: use-layout-effect
title: useLayoutEffect
sidebar_position: 11
slug: /learn/use-layout-effect
---

# `useLayoutEffect`

`useLayoutEffect` fires **synchronously after all DOM mutations** but **before the browser paints**. The signature is identical to `useEffect`.

```ts
function useLayoutEffect(
  create: () => void | (() => void),
  deps?: any[]
): void
```

## When to use it

Use `useLayoutEffect` when you need to read or adjust the DOM before the user sees the screen — for example, measuring an element's dimensions and applying a style based on that measurement (avoids a visual flicker).

```tsx
import { useState, useLayoutEffect, useRef } from "@rectify-dev/core";

function Tooltip({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>();
  const [left, setLeft] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Clamp tooltip within viewport
      setLeft(Math.min(rect.left, window.innerWidth - rect.width - 8));
    }
  }, [text]);

  return (
    <div ref={ref} style={{ position: "fixed", left }}>
      {text}
    </div>
  );
}
```

## Scroll restoration

```tsx
useLayoutEffect(() => {
  window.scrollTo(0, 0);
}, [routePath]);
```

## Comparison with `useEffect`

```tsx
function Demo() {
  useLayoutEffect(() => {
    // ← runs 1st (synchronous, blocks paint)
    console.log("layout effect");
    return () => console.log("layout cleanup");
  }, []);

  useEffect(() => {
    // ← runs 2nd (asynchronous, after paint)
    console.log("effect");
    return () => console.log("cleanup");
  }, []);

  return <div />;
}
// Logs on mount:  "layout effect", "effect"
// Logs on unmount: "layout cleanup", "cleanup"
```

:::caution
`useLayoutEffect` blocks the browser from painting. Expensive work inside it will delay the first visible frame. Keep it minimal.
:::
