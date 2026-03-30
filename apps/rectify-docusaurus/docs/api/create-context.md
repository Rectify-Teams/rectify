---
id: create-context
title: createContext
sidebar_position: 8
slug: /api/create-context
---

# `createContext`

```ts
function createContext<T>(defaultValue: T): RectifyContext<T>
```

Creates a context object. The returned value is both a **context descriptor** and a **Provider component**.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `defaultValue` | `T` | Used when a component reads the context without a matching Provider above it. |

## Returns

```ts
type RectifyContext<T> = {
  // Use as a Provider:
  (props: { value: T; children?: RectifyNode }): null;

  _context:      RectifyContext<T>;  // self-reference
  _defaultValue: T;
  _subscribers:  Set<Fiber>;
  Provider:      RectifyContext<T>;  // alias — same object
};
```

## Usage

```tsx
import { createContext, useContext } from "@rectify-dev/core";

const ThemeContext = createContext<"dark" | "light">("dark");

// Provide
function App() {
  return <ThemeContext value="light"><Page /></ThemeContext>;
}

// Consume
function Page() {
  const theme = useContext(ThemeContext);
  return <div data-theme={theme}>…</div>;
}
```

## `.Provider`

`ThemeContext.Provider` is an alias for `ThemeContext` itself — both forms are equivalent:

```tsx
<ThemeContext value="dark">{children}</ThemeContext>
// same as
<ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
```
