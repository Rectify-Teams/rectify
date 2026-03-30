---
id: introduction
title: Introduction
sidebar_position: 1
slug: /
---

# Introduction

**Rectify** is a UI library built from scratch with a fiber-based reconciler, a complete hooks system, class components, lazy loading, Suspense boundaries, and a first-class client-side router — all with zero React dependencies.

## Why Rectify?

Rectify exists to demystify how UI libraries actually work. Every file is readable, purposefully structured, and fully typed in TypeScript. If you've ever wondered what React is doing under the hood, Rectify makes it visible.

:::tip Familiar API
If you know React, you already know Rectify. The component model, hooks, and JSX transform are intentionally compatible.
:::

## Key features

| Feature | Description |
|---------|-------------|
| **Fiber reconciler** | WIP/current fiber tree diffing with interruptible rendering |
| **Function components** | Plain functions returning JSX |
| **Class components** | `Component<P, S>` base with full lifecycle |
| **Hooks** | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`, `useId`, `useDeferredValue` |
| **Context** | `createContext` + `useContext` |
| **`memo()`** | Shallow-equality memoization to skip re-renders |
| **`lazy()` + `<Suspense>`** | Dynamic imports with loading boundaries |
| **Router** | `@rectify-dev/router` — BrowserRouter, HashRouter, nested routes, hooks |
| **TypeScript** | Every API is fully typed |

## A quick taste

```tsx
import { createRoot, useState } from "@rectify-dev/core";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Counter />);
```

## Architecture overview

Rectify's reconciler maintains two fiber trees in parallel:

- **Current tree** — the committed, visible UI
- **Work-in-progress (WIP) tree** — the next render being prepared

When state changes, Rectify builds a WIP tree, diffs it against the current tree using **lane-based priorities**, then commits the minimal set of DOM mutations. This is the same architecture React uses internally (called "fiber").
