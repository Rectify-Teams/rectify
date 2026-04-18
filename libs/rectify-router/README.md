# @rectify-dev/router

[![npm](https://img.shields.io/npm/v/@rectify-dev/router)](https://www.npmjs.com/package/@rectify-dev/router) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

A first-class client-side router for [Rectify](https://rectify-teams.github.io/rectify) — BrowserRouter, HashRouter, nested routes, outlets, typed hooks, and full TypeScript support.

📖 **Full docs:** [rectify-teams.github.io/rectify/router](https://rectify-teams.github.io/rectify/router)

---

## Installation

```bash
# npm
npm install @rectify-dev/core @rectify-dev/router

# pnpm
pnpm add @rectify-dev/core @rectify-dev/router

# yarn
yarn add @rectify-dev/core @rectify-dev/router
```

---

## Setup

**`vite.config.ts`**

```ts
import { defineConfig } from "vite";
import rectify from "@rectify-dev/vite-plugin";

export default defineConfig({
  plugins: [rectify()],
});
```

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@rectify-dev/core"
  }
}
```

---

## Quick Start

```tsx
// src/main.tsx
import { createRoot } from "@rectify-dev/core";
import { BrowserRouter } from "@rectify-dev/router";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

```tsx
// src/App.tsx
import { Routes, Route, Link } from "@rectify-dev/router";
import Home from "./pages/Home";
import About from "./pages/About";
import User from "./pages/User";

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="*" element={<p>404 Not Found</p>} />
      </Routes>
    </>
  );
}
```

---

## API Reference

### `BrowserRouter`

Provides routing backed by the HTML5 History API (`pushState` / `popstate`). URLs look like `/about`, `/users/42`.

```ts
type BrowserRouterProps = {
  children?: any;
  basename?: string; // default "/"
};
```

```tsx
<BrowserRouter basename="/app">
  <App />
</BrowserRouter>
```

Use `basename` when your app is served from a sub-path (e.g. `/app`).

---

### `HashRouter`

Provides routing backed by `window.location.hash`. URLs look like `/#/about`. No server configuration required.

```ts
type HashRouterProps = {
  children?: any;
  basename?: string;
};
```

```tsx
<HashRouter>
  <App />
</HashRouter>
```

---

### `Routes` and `Route`

`<Routes>` renders the first `<Route>` whose `path` matches the current URL.

```ts
type RouteProps = {
  path?:     string;       // URL pattern, e.g. "/users/:id"
  index?:    boolean;      // matches the parent path exactly
  element?:  RectifyNode;
  children?: RectifyNode;  // nested <Route>s
};
```

```tsx
<Routes>
  {/* exact match */}
  <Route path="/" element={<Home />} />

  {/* URL param */}
  <Route path="/users/:id" element={<UserProfile />} />

  {/* catch-all */}
  <Route path="*" element={<NotFound />} />

  {/* layout route with nested children */}
  <Route path="/settings" element={<SettingsLayout />}>
    <Route index element={<GeneralSettings />} />
    <Route path="profile" element={<ProfileSettings />} />
  </Route>
</Routes>
```

---

### `Outlet`

Renders the matched child route's element inside a layout component.

```tsx
import { Outlet } from "@rectify-dev/router";

function SettingsLayout() {
  return (
    <div>
      <aside>
        <NavLink to="/settings">General</NavLink>
        <NavLink to="/settings/profile">Profile</NavLink>
      </aside>
      <main>
        <Outlet /> {/* child route renders here */}
      </main>
    </div>
  );
}
```

---

### `Link`

Client-side navigation anchor. Intercepts plain left-clicks to update the URL without a full page reload. Modified clicks (Ctrl / Cmd / Shift / Alt) and middle-button clicks are passed through.

```ts
type LinkProps = {
  to:        string;
  replace?:  boolean;
  state?:    unknown;
  children?: RectifyNode;
  className?: string;
  style?:    CSSProperties;
  onClick?:  (e: SyntheticMouseEvent) => void;
};
```

```tsx
<Link to="/about">About</Link>
<Link to="/checkout" replace state={{ from: "/cart" }}>Checkout</Link>
```

---

### `NavLink`

Like `Link` but applies `activeClassName` when the current path matches `to`.

```ts
type NavLinkProps = LinkProps & {
  activeClassName?: string; // default "active"
  end?:             boolean; // default true — exact match
};
```

```tsx
{/* exact match */}
<NavLink to="/settings">Settings</NavLink>

{/* active on /blog and any sub-path */}
<NavLink to="/blog" end={false} activeClassName="current">
  Blog
</NavLink>
```

---

### `Navigate`

Renders `null` but triggers a navigation as a side-effect. Useful for redirect-on-render patterns.

```ts
type NavigateProps = {
  to:       string;
  replace?: boolean;
  state?:   unknown;
};
```

```tsx
function ProtectedRoute({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Dashboard />;
}
```

---

### `useNavigate`

Returns the `navigate` function for programmatic navigation.

```ts
type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void; // go(-1) = back, go(1) = forward
};

type NavigateOptions = {
  replace?: boolean;
  state?:   unknown;
};
```

```tsx
const navigate = useNavigate();

navigate("/dashboard");                      // push
navigate("/login", { replace: true });       // replace
navigate(-1);                                // go back
```

---

### `useLocation`

Returns the current `RouterLocation`. Re-renders whenever the location changes.

```ts
type RouterLocation = {
  pathname: string;
  search:   string;  // includes "?" e.g. "?q=hello"
  hash:     string;
  state:    unknown;
  key:      string;
};
```

```tsx
const location = useLocation();
console.log(location.pathname); // e.g. "/users/42"
```

---

### `useParams`

Returns URL params extracted by the nearest matching `<Route>`.

```tsx
// Route: <Route path="/users/:id/posts/:postId" element={<Post />} />

const { id, postId } = useParams<{ id: string; postId: string }>();
```

---

### `useMatch`

Tries to match a pattern against the current pathname. Returns a `PathMatch` on success, or `null`.

```ts
type PathMatch = {
  params:   Record<string, string>;
  pathname: string; // matched portion
};
```

```tsx
const match = useMatch("/users/:id");
if (match) {
  console.log(match.params.id);
}
```

---

### `useSearchParams`

Returns `[URLSearchParams, setter]`. Calling the setter navigates to the current path with a new query string.

```tsx
const [params, setParams] = useSearchParams();

console.log(params.get("q"));

// navigates to ?q=hello&page=1
setParams({ q: "hello", page: "1" });
```

---

### `useHref`

Resolves a `to` path to a full `href` string respecting the router's `basename`.

```tsx
const href = useHref("/about");
// BrowserRouter → "/about"
// HashRouter    → "/#/about"
```

---

## URL Patterns

| Pattern | Matches |
|---------|---------|
| `/about` | Exactly `/about` |
| `/users/:id` | `/users/42`, `/users/alice` |
| `/files/*` | `/files/`, `/files/a/b/c` |
| `*` | Everything (catch-all / 404) |

---

## Nested Routes Example

```tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout route */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />

          {/* Nested layout */}
          <Route path="users" element={<UsersLayout />}>
            <Route index element={<UserList />} />
            <Route path=":id" element={<UserProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## License

MIT
