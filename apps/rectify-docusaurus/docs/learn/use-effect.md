---
id: use-effect
title: useEffect
sidebar_position: 10
slug: /learn/use-effect
---

# `useEffect`

`useEffect` runs a side effect **after the browser paints** (asynchronously). Use it for subscriptions, data fetching, timers, and other operations that shouldn't block rendering.

```ts
function useEffect(
  create: () => void | (() => void),
  deps?: any[]
): void
```

## Basic usage

```tsx
import { useState, useEffect } from "@rectify-dev/core";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    // Cleanup: runs when component unmounts or before the effect re-runs
    return () => clearInterval(id);
  }, []); // ← empty deps = run once on mount

  return <p>Elapsed: {seconds}s</p>;
}
```

## Dependency array

### Run once on mount

```tsx
useEffect(() => {
  console.log("mounted");
  return () => console.log("unmounted");
}, []);
```

### Run when specific values change

```tsx
useEffect(() => {
  document.title = `${name} — My App`;
}, [name]); // re-runs whenever `name` changes
```

### Run after every render

Omit the dependency array entirely (use rare — most effects should have deps):

```tsx
useEffect(() => {
  console.log("rendered");
});
```

## Cleanup

The function returned from your effect runs:
1. **Before the effect re-runs** (when deps change).
2. **When the component unmounts**.

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/data", { signal: controller.signal })
    .then((res) => res.json())
    .then(setData);

  return () => controller.abort(); // cancel on unmount
}, []);
```

## Data fetching pattern

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchUser(userId).then((data) => {
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <p>Loading…</p>;
  return <p>{user?.name}</p>;
}
```

## Event subscriptions

```tsx
function useKeyPress(key: string, handler: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === key) handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, handler]);
}
```

## `useEffect` vs `useLayoutEffect`

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Timing | After browser paint | After DOM mutation, before paint |
| Use for | Data fetching, subscriptions, timers | DOM measurement, scroll restoration |
| Blocks paint? | No | Yes |

:::tip
Prefer `useEffect`. Use `useLayoutEffect` only when you need to read or mutate the DOM synchronously before the user sees the frame.
:::
