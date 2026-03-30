---
id: routes-and-route
title: Routes & Route
sidebar_position: 3
slug: /router/routes-and-route
---

# `Routes` and `Route`

`<Routes>` renders the first `<Route>` child whose `path` matches the current URL, establishes a `RouteContext`, and supports nested routes via `<Outlet>`.

## `<Routes>`

```ts
function Routes(props: { children?: RectifyNode }): JSX | null
```

## `<Route>`

```ts
type RouteProps = {
  path?:     string;       // URL pattern
  index?:    boolean;      // matches parent path exactly
  element?:  RectifyNode;  // what to render on match
  children?: RectifyNode;  // nested <Route>s
};
```

`<Route>` itself renders `null` — it is a data carrier read by `<Routes>`.

## Basic routing

```tsx
import { BrowserRouter, Routes, Route } from "@rectify-dev/router";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## URL parameters

Use `:paramName` segments. Access them with `useParams()`:

```tsx
<Route path="/users/:id" element={<UserProfile />} />

// Inside UserProfile:
const { id } = useParams<{ id: string }>();
```

## Wildcard / catch-all

```tsx
<Route path="*" element={<NotFound />} />
```

## Nested routes with `<Outlet>`

```tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout route */}
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings"  element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Layout({ children }: { children: any }) {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

## Index routes

An `index` route renders when the parent path is matched exactly:

```tsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<Overview />} />       {/* /dashboard */}
  <Route path="stats" element={<Stats />} />   {/* /dashboard/stats */}
</Route>
```

## Path matching rules

| Pattern | Matches |
|---------|---------|
| `/about` | `/about` only (exact) |
| `/users/:id` | `/users/42`, `/users/alice` |
| `/blog/*` | `/blog/`, `/blog/post/1`, etc. |
| `*` | Any unmatched path |
