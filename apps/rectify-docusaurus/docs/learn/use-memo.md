---
id: use-memo
title: useMemo
sidebar_position: 13
slug: /learn/use-memo
---

# `useMemo`

`useMemo` memoizes the **result of a computation**. The factory is re-executed only when the dependency array changes.

```ts
function useMemo<T>(factory: () => T, deps: any[]): T
```

## Basic usage

```tsx
import { useState, useMemo } from "@rectify-dev/core";

const numbers = Array.from({ length: 10_000 }, (_, i) => i + 1);

function PrimeCounter() {
  const [filter, setFilter] = useState("");

  const primes = useMemo(() => {
    return numbers.filter(isPrime); // expensive operation
  }, []); // ← computed once

  const filtered = useMemo(() => {
    return primes.filter((n) => String(n).includes(filter));
  }, [primes, filter]); // ← re-computed only when filter changes

  return (/* ... */);
}

function isPrime(n: number) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
```

## Stabilizing object references

`useMemo` also prevents unnecessary child re-renders by keeping object/array references stable:

```tsx
function Parent({ userId }: { userId: string }) {
  const [role, setRole] = useState("viewer");

  // Without useMemo: new object every render → child always re-renders
  // With useMemo: same reference if userId + role haven't changed
  const user = useMemo(
    () => ({ id: userId, role }),
    [userId, role],
  );

  return <Child user={user} />;
}
```

## Dependency comparison

Rectify uses `Object.is` to compare each dependency value:

```tsx
// ✅ Primitives compare by value
useMemo(() => compute(count), [count]);

// ⚠️ Objects/arrays compare by reference — pass stable refs
const opts = useMemo(() => ({ theme }), [theme]);
useMemo(() => compute(opts), [opts]);
```

## `useMemo` vs `useCallback`

| | `useMemo` | `useCallback` |
|---|---|---|
| Memoizes | Return value of factory | The function itself |
| Use for | Computed values, derived data | Event handlers, callbacks |
| Equivalent | `useMemo(() => fn, deps)` | `useCallback(fn, deps)` |

:::tip
Don't over-memoize. Every `useMemo` adds a comparison on every render. Only apply it when you've profiled and confirmed a real performance issue, or when you _know_ the value is expensive to compute.
:::
