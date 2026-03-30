---
id: use-state
title: useState
sidebar_position: 9
slug: /learn/use-state
---

# `useState`

`useState` adds local reactive state to a function component. When state changes, Rectify re-renders the component.

```ts
function useState<S>(initialState: S | (() => S)): [S, StateDispatcher<S>]
```

## Basic usage

```tsx
import { useState } from "@rectify-dev/core";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

## Updater function

When the new state depends on the previous value, pass an updater function. This avoids stale closure issues when multiple updates are batched:

```tsx
// ✅ Safe — always reads the latest prev value
setCount((prev) => prev + 1);

// ⚠️ May stale in batched updates
setCount(count + 1);
```

## Lazy initial state

If computing the initial state is expensive, pass a function:

```tsx
const [data, setData] = useState(() => JSON.parse(localStorage.getItem("data") ?? "null"));
```

The factory is called only once on mount, not on every render.

## State with objects

`setState` **replaces** state, not merges it. Spread the previous state when updating partial fields:

```tsx
type User = { name: string; email: string };

function UserForm() {
  const [user, setUser] = useState<User>({ name: "", email: "" });

  const updateName = (name: string) =>
    setUser((prev) => ({ ...prev, name }));

  return (
    <input value={user.name} onInput={(e) =>
      updateName((e.target as HTMLInputElement).value)
    } />
  );
}
```

## State with arrays

```tsx
function TodoList() {
  const [todos, setTodos] = useState<string[]>([]);

  const add = (text: string) =>
    setTodos((prev) => [...prev, text]);

  const remove = (index: number) =>
    setTodos((prev) => prev.filter((_, i) => i !== index));

  return (/* ... */);
}
```

## Multiple state variables

Prefer multiple `useState` calls over one big object for unrelated pieces of state — it makes updates simpler:

```tsx
const [name, setName] = useState("");
const [age, setAge]   = useState(0);
const [open, setOpen] = useState(false);
```

## TypeScript

```tsx
// Inferred from initial value
const [count, setCount] = useState(0); // [number, Dispatch<number>]

// Explicit generic when initial value is ambiguous
const [user, setUser] = useState<User | null>(null);

// No initial value → S | undefined
const [value, setValue] = useState<string>();
```
