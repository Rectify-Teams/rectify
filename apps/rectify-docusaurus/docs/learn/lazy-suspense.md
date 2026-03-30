---
id: lazy-suspense
title: lazy & Suspense
sidebar_position: 19
slug: /learn/lazy-suspense
---

# `lazy` & `Suspense`

`lazy` and `Suspense` work together to **code-split** components and display a fallback UI while they load.

## `lazy()`

```ts
function lazy<T extends FC<any>>(
  factory: () => Promise<{ default: T } | T>
): T
```

Declare lazy components at **module level** (outside any function):

```tsx
import { lazy } from "@rectify-dev/core";

// Default export
const Dashboard = lazy(() => import("./Dashboard"));

// Named export — re-map to "default"
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
```

## `<Suspense>`

Wrap any subtree containing lazy components in a `<Suspense>` boundary. The `fallback` is rendered while the import resolves.

```tsx
import { Suspense } from "@rectify-dev/core";

function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}
```

## Nesting boundaries

Nest `<Suspense>` to give different parts independent loading states:

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />

  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart />
  </Suspense>

  <Footer />
</Suspense>
```

## With the router

```tsx
import { BrowserRouter, Routes, Route } from "@rectify-dev/router";
import { lazy, Suspense } from "@rectify-dev/core";

const Home  = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const About = lazy(() => import("./pages/About").then((m) => ({ default: m.About })));

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<Suspense fallback={<Loader />}><Home /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<Loader />}><About /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}
```

:::caution Module-level only
Always call `lazy()` at the module top level. Calling it inside a component creates a new lazy descriptor on every render and prevents the cached result from being reused.
:::
