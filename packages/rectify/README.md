# @rectify-dev/core

[![npm](https://img.shields.io/npm/v/@rectify-dev/core)](https://www.npmjs.com/package/@rectify-dev/core) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

A lightweight React-compatible UI library built from scratch — fiber reconciler, concurrent rendering, class components, a complete hooks API, lazy/Suspense, and context. All with **zero React dependencies** and **~10 KB gzipped**.

📖 **Full docs:** [rectify-teams.github.io/rectify](https://rectify-teams.github.io/rectify)

---

## Features

| Feature | Status |
|---------|--------|
| Function components + auto-bailout | ✅ |
| Class components (full lifecycle) | ✅ |
| `useState`, `useReducer` | ✅ |
| `useEffect`, `useLayoutEffect` | ✅ |
| `useRef` (object + callback refs) | ✅ |
| `useMemo`, `useCallback` | ✅ |
| `useContext` + `createContext` | ✅ |
| `useId` | ✅ |
| `memo()` with custom comparator | ✅ |
| `lazy()` + `<Suspense>` | ✅ |
| Portals | ✅ |
| SVG elements | ✅ |
| Client-side router | [`@rectify-dev/router`](../../libs/rectify-router) |

---

## Quick Start

Scaffold a new project with one command — no config needed:

```bash
# pnpm
pnpm create @rectify-dev/rectify-app my-app

# npm
npm create @rectify-dev/rectify-app@latest my-app

# yarn
yarn create @rectify-dev/rectify-app my-app
```

```bash
cd my-app && pnpm install && pnpm dev
```

This scaffolds a Vite + TypeScript project pre-configured with the Rectify JSX runtime, `@rectify-dev/vite-plugin`, and a ready-to-edit `src/App.tsx`.

---

## Installation

```bash
pnpm add @rectify-dev/core
# or
npm install @rectify-dev/core
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
    "moduleResolution": "bundler"
  }
}
```

---

## Rendering

```tsx
import { createRoot } from "@rectify-dev/core";

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
```

---

## Hooks

### useState

```tsx
import { useState } from "@rectify-dev/core";

const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};
```

Supports lazy initializer:

```tsx
const [state, setState] = useState(() => expensiveComputation());
```

---

### useReducer

```tsx
import { useReducer } from "@rectify-dev/core";

type Action = { type: "inc" } | { type: "dec" };

const reducer = (state: number, action: Action) => {
  if (action.type === "inc") return state + 1;
  if (action.type === "dec") return state - 1;
  return state;
};

const Counter = () => {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <>
      <button onClick={() => dispatch({ type: "dec" })}>-</button>
      {count}
      <button onClick={() => dispatch({ type: "inc" })}>+</button>
    </>
  );
};
```

---

### useEffect

Runs after the browser has painted. Clean up by returning a function.

```tsx
import { useEffect } from "@rectify-dev/core";

const Timer = () => {
  useEffect(() => {
    const id = setInterval(() => console.log("tick"), 1000);
    return () => clearInterval(id);
  }, []); // empty deps → run once on mount
};
```

---

### useLayoutEffect

Fires synchronously after DOM mutations, before the browser paints. Use for measuring layout or imperatively updating the DOM.

```tsx
import { useLayoutEffect, useRef } from "@rectify-dev/core";

const Tooltip = () => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    console.log(ref.current?.getBoundingClientRect());
  });
  return <div ref={ref}>hover me</div>;
};
```

---

### useRef

Returns a stable mutable container. Updating `.current` does **not** trigger a re-render.

```tsx
import { useRef } from "@rectify-dev/core";

const Input = () => {
  const ref = useRef<HTMLInputElement>(null);
  return <input ref={ref} onFocus={() => ref.current?.select()} />;
};
```

Callback refs (React 19 style with cleanup return):

```tsx
<div ref={(node) => {
  // attach
  return () => { /* cleanup */ };
}} />
```

---

### useMemo

Memoises an expensive computation; recomputes only when `deps` change.

```tsx
import { useMemo } from "@rectify-dev/core";

const List = ({ items }: { items: number[] }) => {
  const sorted = useMemo(() => [...items].sort((a, b) => a - b), [items]);
  return <ul>{sorted.map(n => <li key={n}>{n}</li>)}</ul>;
};
```

---

### useCallback

Memoises a function reference.

```tsx
import { useCallback } from "@rectify-dev/core";

const Parent = () => {
  const handleClick = useCallback(() => console.log("click"), []);
  return <Child onClick={handleClick} />;
};
```

---

### useId

Returns a stable, globally unique string ID — ideal for linking form labels to inputs.

```tsx
import { useId } from "@rectify-dev/core";

const Field = ({ label }: { label: string }) => {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
};
```

---

### useContext / createContext

Share values through the tree without prop drilling.

```tsx
import { createContext, useContext } from "@rectify-dev/core";

const ThemeContext = createContext<"light" | "dark">("light");

const App = () => (
  <ThemeContext.Provider value="dark">
    <Page />
  </ThemeContext.Provider>
);

const Page = () => {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
};
```

---

## Class Components

Extend `Component<Props, State>` to write class-based components.

```tsx
import { Component } from "@rectify-dev/core";

interface Props { title: string }
interface State { open: boolean }

class Accordion extends Component<Props, State> {
  state = { open: false };

  componentDidMount() { console.log("mounted"); }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.open !== this.state.open) console.log("toggled");
  }

  componentWillUnmount() { console.log("unmounted"); }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return nextState.open !== this.state.open || nextProps.title !== this.props.title;
  }

  render() {
    return (
      <div>
        <button onClick={() => this.setState({ open: !this.state.open })}>
          {this.props.title}
        </button>
        {this.state.open && <div>content</div>}
      </div>
    );
  }
}
```

`setState` accepts a partial object or an updater function:

```tsx
this.setState({ count: 42 });
this.setState(prev => ({ count: prev.count + 1 }));
```

---

## memo

Prevents re-renders when props are shallowly equal. All function components already bail out automatically — use `memo` only when you need a **custom comparator**.

```tsx
import { memo } from "@rectify-dev/core";

const Item = memo(({ name }: { name: string }) => <li>{name}</li>);

// Custom comparator
const Chart = memo(
  ({ data }: { data: number[] }) => <canvas />,
  (prev, next) => prev.data.length === next.data.length,
);
```

---

## lazy + Suspense

Code-split a component and show a fallback while it loads.

```tsx
import { lazy, Suspense } from "@rectify-dev/core";

const HeavyChart = lazy(() => import("./HeavyChart"));

const Dashboard = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyChart data={data} />
  </Suspense>
);
```

---

## Fragment

Group children without adding a DOM node.

```tsx
import { Fragment } from "@rectify-dev/core";

const Rows = () => (
  <Fragment>
    <tr><td>A</td></tr>
    <tr><td>B</td></tr>
  </Fragment>
);

// Shorthand
const Rows = () => (
  <>
    <tr><td>A</td></tr>
    <tr><td>B</td></tr>
  </>
);
```

---

## TypeScript

All JSX element attributes, event handlers, CSS properties, and ARIA attributes are fully typed:

```tsx
import type {
  FC,
  RectifyNode,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  SuspenseProps,
  RefObject,
  RectifyContext,
  Reducer,
  Dispatch,
  SyntheticMouseEvent,
  SyntheticKeyboardEvent,
  SyntheticChangeEvent,
  SyntheticFocusEvent,
  SyntheticInputEvent,
  SyntheticSubmitEvent,
} from "@rectify-dev/core";
```

The `key` prop is accepted on every element without appearing in the component's own props type:

```tsx
items.map(item => <Row key={item.id} data={item} />);
```

---

## License

MIT
