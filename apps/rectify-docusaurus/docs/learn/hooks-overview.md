---
id: hooks-overview
title: Hooks Overview
sidebar_position: 8
slug: /learn/hooks-overview
---

# Hooks Overview

Hooks are functions that let you use state, lifecycle, and other Rectify features inside **function components**. All hooks are imported from `@rectify-dev/core`.

## Rules of Hooks

:::danger Rules — never break these
1. Only call hooks at the **top level** of a component or custom hook. Never inside loops, conditions, or nested functions.
2. Only call hooks from **function components** or **custom hooks**. Not from regular JS functions or class components.
:::

## Available hooks

| Hook | Purpose |
|------|---------|
| [`useState`](/learn/use-state) | Local reactive state |
| [`useReducer`](/learn/use-reducer) | Complex state with a reducer |
| [`useEffect`](/learn/use-effect) | Side effects after paint |
| [`useLayoutEffect`](/learn/use-layout-effect) | Side effects before paint (DOM measurement) |
| [`useRef`](/learn/use-ref) | Mutable ref / DOM node access |
| [`useMemo`](/learn/use-memo) | Memoized computed value |
| [`useCallback`](/learn/use-callback) | Memoized callback function |
| [`useContext`](/learn/use-context) | Read from a context |
| [`useId`](/learn/use-id) | Stable unique ID for accessibility |
| [`useDeferredValue`](/learn/use-deferred-value) | Defer updating a value to a lower priority |

## Custom hooks

Extract stateful logic into custom hooks by composing built-in hooks. Name them with the `use` prefix:

```tsx
import { useState, useEffect } from "@rectify-dev/core";

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

// Usage in any component:
function ResponsiveLayout() {
  const width = useWindowWidth();
  return <p>Window is {width}px wide</p>;
}
```
