---
id: browser-router
title: BrowserRouter
sidebar_position: 1
slug: /router/browser-router
---

# `BrowserRouter`

```ts
function BrowserRouter(props: BrowserRouterProps): JSX
```

Provides routing backed by the HTML5 History API (`pushState` / `replaceState` / `popstate`). URLs look like regular paths: `/about`, `/users/42`.

```ts
type BrowserRouterProps = {
  children?: any;
  basename?: string; // default "/"
};
```

## Setup

```tsx title="src/main.tsx"
import { createRoot } from "@rectify-dev/core";
import { BrowserRouter } from "@rectify-dev/router";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

## `basename`

Set `basename` when your app is served from a sub-path:

```tsx
<BrowserRouter basename="/my-app">
  <App />
</BrowserRouter>
```

All `<Link to="…">` values are relative to the basename.

## How navigation works

1. `<Link>` intercepting a click calls `navigate(to)`.
2. `navigate` calls `window.history.pushState()` and updates the internal `location` state.
3. The `RouterContext` value changes, causing all `NavLink` and `useLocation` consumers to re-render.
4. `<Routes>` picks the matching `<Route>` and renders it.

For hash-based routing see [`HashRouter`](/router/hash-router).
