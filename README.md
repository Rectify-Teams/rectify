# Rectify

A lightweight React-like UI library built from scratch — fiber reconciler, concurrent rendering, a complete hooks system, class components, lazy/Suspense, context, and a first-class router. All with **zero React dependencies**.

[![npm](https://img.shields.io/npm/v/@rectify-dev/core?label=%40rectify-dev%2Fcore)](https://www.npmjs.com/package/@rectify-dev/core) [![npm](https://img.shields.io/npm/v/@rectify-dev/router?label=%40rectify-dev%2Frouter)](https://www.npmjs.com/package/@rectify-dev/router) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Packages

| Package | Description |
|---|---|
| [`@rectify-dev/core`](packages/rectify) | Runtime, JSX transform, hooks, class components, memo, lazy, Suspense, context |
| [`@rectify-dev/router`](libs/rectify-router) | Client-side router — BrowserRouter, HashRouter, nested routes, full hook set |
| [`@rectify-dev/vite-plugin`](packages/vite-plugin-rectify) | Vite plugin — wires up the Rectify JSX transform automatically |
| [`@rectify-dev/babel-transform-rectify-jsx`](packages/babel-transform-rectify-jsx) | Babel plugin for non-Vite environments (Jest, CRA, etc.) |
| [`@rectify-dev/create-rectify-app`](packages/create-rectify-app) | CLI scaffold — `npm create @rectify-dev/rectify-app my-app` |

---

## Quick Start

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
# core
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

## Feature Overview

### Function components & auto-bailout

Every function component **automatically skips re-rendering** when its props are shallowly equal and it has no pending state — no `memo()` wrapper required.

```tsx
import { createRoot, useState } from "@rectify-dev/core";

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>; // only re-renders when `name` changes
}

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Greeting name="Rectify" />
      <button onClick={() => setCount(c => c + 1)}>Tick: {count}</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
```

### Hooks

All hooks are imported from `@rectify-dev/core`.

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
| `useId` | Stable, globally unique ID (`":r0:"`) for accessibility |
| `useDeferredValue` | Defer non-urgent value updates to keep UI responsive |

### Class components

```tsx
import { Component } from "@rectify-dev/core";

class Counter extends Component<{}, { count: number }> {
  state = { count: 0 };

  componentDidMount() { console.log("mounted"); }
  componentDidUpdate(prevProps: {}, prevState: { count: number }) {}
  componentWillUnmount() { console.log("unmounting"); }
  shouldComponentUpdate(_nextProps: {}, nextState: { count: number }) {
    return nextState.count !== this.state.count;
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}
```

### Context

```tsx
import { createContext, useContext } from "@rectify-dev/core";

const ThemeCtx = createContext<"light" | "dark">("light");

function App() {
  return (
    <ThemeCtx.Provider value="dark">
      <Page />
    </ThemeCtx.Provider>
  );
}

function Page() {
  const theme = useContext(ThemeCtx);
  return <div data-theme={theme}>…</div>;
}
```

### `memo()` — custom comparator

Use `memo` only when you need a comparator other than shallow equality:

```tsx
import { memo } from "@rectify-dev/core";

const Chart = memo(
  ({ data }: { data: number[] }) => <canvas />,
  // skip re-render when array length is unchanged
  (prev, next) => prev.data.length === next.data.length,
);
```

### `lazy` + `Suspense`

```tsx
import { lazy, Suspense } from "@rectify-dev/core";

const Dashboard = lazy(() => import("./Dashboard"));

function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}
```

### Router

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

---

## Architecture

Rectify uses a **double-buffered fiber tree** identical to React's internal architecture:

- **Current tree** — the committed, visible UI
- **Work-in-progress (WIP) tree** — the next render being built

When state changes, Rectify builds a WIP tree, diffs it against current using **lane-based priorities**, then commits the minimal set of DOM mutations.

| Lane | Used for |
|------|----------|
| Sync | Initial render & forced sync updates |
| Input | User interactions (click, keyboard) |
| Default | Normal `setState` outside event handlers |
| Transition | `useDeferredValue` deferred work |
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
| `useId` / `useDeferredValue` | ✅ | ✅ |
| Context — both Provider forms | ✅ `<Ctx>` or `<Ctx.Provider>` | ✅ `<Ctx>` or `<Ctx.Provider>` |
| Router | React Router (separate) | `@rectify-dev/router` (separate) |
| `startTransition` | ✅ | ❌ |
| Server components | ✅ | ❌ |
| DevTools extension | ✅ | ❌ |

---

## Documentation

Full docs at **[rectify-teams.github.io/rectify](https://rectify-teams.github.io/rectify)**.

---

## License

MIT


## Packages

| Package | Version | Description |
|---|---|---|
| `@rectify-dev/core` | [![npm](https://img.shields.io/npm/v/@rectify-dev/core)](https://www.npmjs.com/package/@rectify-dev/core) | Runtime, hooks, JSX transform |
| `@rectify-dev/vite-plugin` | [![npm](https://img.shields.io/npm/v/@rectify-dev/vite-plugin)](https://www.npmjs.com/package/@rectify-dev/vite-plugin) | Vite plugin (configures Babel + JSX) |
| `@rectify-dev/create-rectify-app` | [![npm](https://img.shields.io/npm/v/@rectify-dev/create-rectify-app)](https://www.npmjs.com/package/@rectify-dev/create-rectify-app) | CLI scaffold tool |

---

## Quick Start

The fastest way to create a new Rectify app:

```bash
# npm
npm create @rectify-dev/rectify-app my-app

# pnpm
pnpm create @rectify-dev/rectify-app my-app

# yarn
yarn create @rectify-dev/rectify-app my-app
```

Then:

```bash
cd my-app
pnpm install
pnpm dev
```

---

## Manual Installation

```bash
npm install @rectify-dev/core
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

**`tsconfig.json`** — key settings:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@rectify-dev/core"
  }
}
```

---

## Usage

```tsx
import { createRoot, useState, useEffect } from "@rectify-dev/core";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}

createRoot(document.getElementById("app")!).render(<Counter />);
```

---

## API Reference

### Root

#### `createRoot(container)`

Mounts a Rectify tree into a DOM element.

```ts
const root = createRoot(document.getElementById("app")!);
root.render(<App />);
root.unmount();
```

---

### Hooks

All hooks are imported from `@rectify-dev/core`.

#### `useState<S>(initialState?)`

```ts
const [count, setCount] = useState(0);
setCount(1);           // set directly
setCount((c) => c + 1); // updater function
```

#### `useEffect(create, deps?)`

Runs after the browser paints. Return a cleanup function to run before the next effect or on unmount.

```ts
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

#### `useLayoutEffect(create, deps?)`

Runs synchronously after DOM mutations, before the browser paints. Use for measuring layout or synchronously updating the DOM.

```ts
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setOffset(height);
}, []);
```

#### `useRef<T>(initialValue?)`

Returns a stable mutable object — updating `.current` does **not** trigger a re-render.

```ts
const inputRef = useRef<HTMLInputElement>(null);
// <input ref={inputRef} />
```

#### `useMemo<T>(factory, deps)`

Recomputes only when `deps` change.

```ts
const sorted = useMemo(() => [...list].sort(), [list]);
```

#### `useCallback(fn, deps)`

Stable function reference — re-created only when `deps` change.

```ts
const handleClick = useCallback(() => doSomething(id), [id]);
```

#### `createContext<T>(defaultValue)`

```ts
const ThemeCtx = createContext<"light" | "dark">("light");
```

#### `useContext(context)`

```ts
const theme = useContext(ThemeCtx);
```

Provide a value via the context object itself or its `.Provider` alias — both are equivalent:

```tsx
<ThemeCtx value="dark">
  <App />
</ThemeCtx>
```

---

### Components

#### `memo(Component, compare?)`

Skips re-rendering when props are shallowly equal. Pass a custom `compare` function to override equality:

```ts
const Chart = memo(
  ({ data }) => <canvas />,
  (prev, next) => Object.is(prev.data, next.data),
);
```

> **Note:** All function components already bail out automatically on shallow-equal props. Use `memo` only when you need a **custom** comparator.

---

### Types

Common TypeScript types exported from `@rectify-dev/core`:

```ts
import type {
  FC,                  // FunctionComponent alias
  RectifyNode,         // anything renderable
  // HTML attribute types
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  // ... and all HTML element attribute sets
  // Synthetic event types
  SyntheticMouseEvent,
  SyntheticKeyboardEvent,
  SyntheticChangeEvent,
  SyntheticFocusEvent,
  SyntheticInputEvent,
  SyntheticSubmitEvent,
  SyntheticWheelEvent,
  SyntheticPointerEvent,
  SyntheticTouchEvent,
  SyntheticDragEvent,
  SyntheticClipboardEvent,
  SyntheticAnimationEvent,
  SyntheticTransitionEvent,
  // Misc
  CSSProperties,
  RefObject,
  RectifyContext,
  MemoComponent,
} from "@rectify-dev/core";
```

---

## Performance

Rectify is designed to stay out of the way for small-to-medium UIs.

### Bundle weight

| Metric | Value |
|---|---|
| `dist/index.js` (ESM, unminified) | ~48 KB |
| `dist/index.js` (gzipped) | **~10 KB** |
| Installed alongside (`@rectify-dev/shared`) | +~4 KB gzip |

For comparison, `react` + `react-dom` together ship **~45 KB gzipped**.

### Rendering behavior

- **Sync lane** — initial render and explicit sync updates, committed in the same task.
- **Input lane** — user interactions (click, keyboard), committed before the next frame to keep UI responsive.
- **Default lane** — normal `setState` calls outside event handlers, batched and time-sliced.
- **Transition / Idle lanes** — reserved for deferred work; yield to the browser every **5 ms**.
- **Automatic bailout** — every function component skips reconciliation when current and pending props are shallowly equal, without requiring `memo`.
- **Fiber architecture** — double-buffered fiber tree (current ↔ work-in-progress), identical to React's approach.

---

## License

MIT
