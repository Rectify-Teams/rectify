---
id: use-context
title: useContext
sidebar_position: 16
slug: /learn/use-context
---

# `useContext` and `createContext`

Context lets you share data across the component tree **without prop drilling**.

## Creating a context

```ts
function createContext<T>(defaultValue: T): RectifyContext<T>
```

```tsx
import { createContext } from "@rectify-dev/core";

type Theme = "dark" | "light";

const ThemeContext = createContext<Theme>("dark");
```

## Providing a value

The context object is itself a **Provider component**. Wrap any subtree in it and set the `value` prop:

```tsx
function App() {
  return (
    <ThemeContext value="light">
      <Toolbar />
    </ThemeContext>
  );
}
```

## Consuming the value

```tsx
import { useContext } from "@rectify-dev/core";

function ThemeButton() {
  const theme = useContext(ThemeContext);
  return (
    <button className={`btn btn--${theme}`}>
      Current theme: {theme}
    </button>
  );
}
```

## Dynamic context with state

```tsx
function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <ThemeContext value={theme}>
      <Header />
      <main>
        <Content />
      </main>
      <button onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}>
        Toggle theme
      </button>
    </ThemeContext>
  );
}
```

## Pattern: exporting an action-aware context

```tsx
import { createContext, useState, useContext } from "@rectify-dev/core";

type AuthUser = { id: string; name: string } | null;
type AuthCtx  = { user: AuthUser; login: (u: AuthUser) => void; logout: () => void };

const AuthContext = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<AuthUser>(null);
  return (
    <AuthContext value={{ user, login: setUser, logout: () => setUser(null) }}>
      {children}
    </AuthContext>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Then anywhere in your tree:

```tsx
function Profile() {
  const { user, logout } = useAuth();
  if (!user) return <p>Not logged in</p>;
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Default value

The default value passed to `createContext` is used when a component reads the context **without** a Provider above it in the tree. It is useful in tests and for providing baseline values.

```tsx
const CountContext = createContext(0); // default is 0

// Without a Provider — value is 0
function Counter() {
  const count = useContext(CountContext);
  return <p>{count}</p>; // renders "0"
}
```

:::tip
Unlike `useState`, `useContext` does **not** consume a hook slot and can be called conditionally. Rectify always reads directly from the nearest Provider, walking up the fiber tree.
:::
