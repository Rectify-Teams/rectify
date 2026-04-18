# Rectify

**Rectify** is a UI library built from scratch with a fiber-based reconciler, a complete hooks system, class components, lazy loading, Suspense boundaries, and a first-class client-side router — all with **zero React dependencies** and **~10 KB gzipped**.

[![npm](https://img.shields.io/npm/v/@rectify-dev/core?label=%40rectify-dev%2Fcore)](https://www.npmjs.com/package/@rectify-dev/core) [![npm](https://img.shields.io/npm/v/@rectify-dev/router?label=%40rectify-dev%2Frouter)](https://www.npmjs.com/package/@rectify-dev/router) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> If you know React, you already know Rectify. The component model, hooks, and JSX transform are intentionally compatible.

📖 **Full docs:** [rectify-teams.github.io/rectify](https://rectify-teams.github.io/rectify)

---

## Packages

| Package | Description |
|---|---|
| [`@rectify-dev/core`](packages/rectify) | Runtime, JSX transform, hooks, class components, memo, lazy, Suspense, context |
| [`@rectify-dev/router`](libs/rectify-router) | Client-side router — BrowserRouter, HashRouter, nested routes, full hook set |
| [`@rectify-dev/vite-plugin`](packages/vite-plugin-rectify) | Vite plugin — wires up the Rectify JSX transform automatically |
| [`@rectify-dev/babel-transform-rectify-jsx`](packages/babel-transform-rectify-jsx) | Babel plugin for non-Vite environments |
| [`@rectify-dev/create-rectify-app`](packages/create-rectify-app) | CLI scaffold — `npm create @rectify-dev/rectify-app my-app` |

---

## Quick Start

Scaffold a new project with one command — no config needed:

```bash
# npm
npm create @rectify-dev/rectify-app@latest my-app

# pnpm
pnpm create @rectify-dev/rectify-app my-app

# yarn
yarn create @rectify-dev/rectify-app my-app
```

```bash
cd my-app && pnpm install && pnpm dev
```

---

## Manual Installation

```bash
# core runtime
npm install @rectify-dev/core

# optional router
npm install @rectify-dev/router

# dev tools
npm install -D @rectify-dev/vite-plugin vite typescript
```

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
    "jsxImportSource": "@rectify-dev/core",
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ES2020"
  }
}
```

---

## A Quick Taste

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

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Fiber reconciler** | WIP/current fiber tree diffing with interruptible rendering |
| **Function components** | Auto-bailout when props are shallowly equal — no `memo()` wrapper needed |
| **Class components** | `Component<P, S>` with full lifecycle (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, `shouldComponentUpdate`) |
| **Hooks** | `useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useId` |
| **Context** | `createContext` + `useContext` with `<Ctx.Provider>` |
| **`memo()`** | Shallow-equality memoization; accepts a custom comparator |
| **`lazy()` + `<Suspense>`** | Dynamic imports with loading boundaries |
| **Router** | `@rectify-dev/router` — BrowserRouter, HashRouter, nested routes, Outlet, Link, NavLink |
| **TypeScript** | Every API fully typed; all HTML attributes, CSS properties, and synthetic events included |

---

## Hooks

All hooks are imported from `@rectify-dev/core`:

| Hook | Description |
|------|-------------|
| `useState` | Local state with direct-value or updater-function dispatch |
| `useReducer` | Reducer-based state with optional lazy initializer |
| `useEffect` | Side effects after paint; cleanup on unmount or dep change |
| `useLayoutEffect` | Synchronous effect after DOM mutations, before paint |
| `useRef` | Stable mutable ref; supports object refs and callback refs |
| `useMemo` | Memoised computation, recomputes on dep change |
| `useCallback` | Stable function reference, re-created on dep change |
| `useContext` | Subscribe to a context value |
| `useId` | Stable, globally unique ID for accessibility |

---

## Router

```bash
npm install @rectify-dev/router
```

```tsx
import { BrowserRouter, Routes, Route, Link, useParams } from "@rectify-dev/router";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function User() {
  const { id } = useParams<{ id: string }>();
  return <p>User {id}</p>;
}
```

Router hooks: `useNavigate`, `useLocation`, `useParams`, `useMatch`, `useSearchParams`, `useHref`.

See the [`@rectify-dev/router` README](libs/rectify-router/README.md) for the full API.

---

## Architecture

Rectify uses a **double-buffered fiber tree**:

- **Current tree** — the committed, visible UI
- **Work-in-progress (WIP) tree** — the next render being prepared

When state changes, Rectify builds a WIP tree, diffs it against the current using **lane-based priorities**, then commits the minimal set of DOM mutations.

| Lane | Used for |
|------|----------|
| Sync | Initial render and forced sync updates |
| Input | User interactions (click, keyboard) |
| Default | Normal `setState` outside event handlers |
| Idle | Background / lowest-priority work |

---

## Differences from React

| | React 19 | Rectify |
|---|---|---|
| Bundle (gzip) | ~45 KB | **~10 KB** |
| Function component auto-bailout | Needs `React.memo` | ✅ Built-in |
| Class components | Legacy | ✅ Full lifecycle |
| `memo` custom comparator | ✅ | ✅ |
| `lazy` + `Suspense` | ✅ | ✅ |
| `useReducer` | ✅ | ✅ |
| `useId` | ✅ | ✅ |
| Context — both Provider forms | ✅ | ✅ |
| `startTransition` | ✅ | ❌ |
| Server components | ✅ | ❌ |
| DevTools extension | ✅ | ❌ |

---

## License

MIT
