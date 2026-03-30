---
id: quick-start
title: Quick Start
sidebar_position: 3
slug: /learn/quick-start
---

# Quick Start

This page shows the most common patterns you'll use every day in Rectify.

## Function component

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
```

Components are plain functions. They receive props as an object and return JSX (or `null`).

## State

```tsx
import { useState } from "@rectify-dev/core";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
    </div>
  );
}
```

## Handling events

Event handlers receive Rectify's [synthetic events](/api/hooks/use-state). Access the underlying native event via `e.nativeEvent`.

```tsx
function Form() {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onInput={(e) => setValue((e.target as HTMLInputElement).value)}
    />
  );
}
```

## Conditional rendering

```tsx
function Alert({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return <div className="alert">{message}</div>;
}
```

## Lists

Always provide a `key` prop when rendering lists:

```tsx
const items = ["Apple", "Banana", "Cherry"];

function List() {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

## Side effects

```tsx
import { useState, useEffect } from "@rectify-dev/core";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Elapsed: {seconds}s</p>;
}
```

## DOM refs

```tsx
import { useRef, useEffect } from "@rectify-dev/core";

function AutoFocus() {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="I'm focused on mount" />;
}
```

## Memoization

Skip expensive re-renders with [`memo()`](/learn/memo):

```tsx
import { memo, useState } from "@rectify-dev/core";

const HeavyList = memo(function HeavyList({ items }: { items: string[] }) {
  return <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>;
});
```

## Code splitting

```tsx
import { lazy, Suspense } from "@rectify-dev/core";

const Dashboard = lazy(() =>
  import("./Dashboard").then((m) => ({ default: m.Dashboard })),
);

function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}
```
