# Rectify

A lightweight React-like UI library — fiber-based reconciler, hooks, concurrent rendering, and a JSX transform — all in **~10 KB gzipped**.

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

## Differences from React

| Feature | React 19 | Rectify |
|---|---|---|
| **Bundle size** | ~140 KB min / ~45 KB gzip | ~48 KB min / **~10 KB gzip** |
| **JSX transform** | `react/jsx-runtime` | `@rectify-dev/core/jsx-runtime` |
| **Hooks** | Full set (20+) | Core set: `useState`, `useEffect`, `useLayoutEffect`, `useRef`, `useMemo`, `useCallback`, `useContext` |
| **`startTransition`** | ✅ | ❌ Not implemented |
| **`Suspense`** | ✅ | ❌ Not implemented |
| **Server components** | ✅ | ❌ Not implemented |
| **`useReducer`** | ✅ | ❌ Use `useState` with updater fn |
| **`useId` / `useDeferredValue`** | ✅ | ❌ |
| **Concurrent rendering** | Full (scheduler + lanes) | Partial — 5 lanes, time-sliced work loop, yields every 5 ms |
| **Auto-bailout (memo)** | `React.memo` required | Built-in shallow comparison on every function component, `memo` only needed for custom comparators |
| **Context Provider syntax** | `<Ctx.Provider value={...}>` | `<Ctx value={...}>` or `<Ctx.Provider value={...}>` (both work) |
| **Synthetic events** | Full SyntheticEvent system | Lightweight wrapper — `stopPropagation()`, `isPropagationStopped()` |
| **`ref` prop** | `useRef` + `ref={...}` | `useRef` — direct DOM attachment via `ref` prop not yet implemented |
| **Class components** | Legacy support | ❌ Function components only |
| **DevTools** | React DevTools extension | ❌ No DevTools extension |

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
