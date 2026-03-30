---
id: outlet
title: Outlet
sidebar_position: 7
slug: /router/outlet
---

# `Outlet`

```ts
function Outlet(): any
```

Renders the matched child route's `element` inside a layout component. Must be used inside a parent route that has nested `<Route>` children.

## Usage

```tsx
import { Outlet } from "@rectify-dev/router";

function AppLayout() {
  return (
    <div className="layout">
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/users">Users</Link>
        </nav>
      </header>

      <main>
        {/* Child route element renders here */}
        <Outlet />
      </main>

      <footer>© 2026 My App</footer>
    </div>
  );
}

// Route config
<Route path="/" element={<AppLayout />}>
  <Route index element={<Home />} />
  <Route path="users" element={<Users />} />
  <Route path="users/:id" element={<UserDetail />} />
</Route>
```

Visiting `/` renders `<AppLayout>` with `<Home />` in the outlet.  
Visiting `/users/42` renders `<AppLayout>` with `<UserDetail />` in the outlet.
