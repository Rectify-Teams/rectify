---
title: Installation
---

# Router Installation

`@rectify-dev/router` is a separate package and must be installed alongside
`@rectify-dev/core`.

## Install

::: code-group

```bash [npm]
npm install @rectify-dev/router
```

```bash [pnpm]
pnpm add @rectify-dev/core @rectify-dev/router
```

```bash [yarn]
yarn add @rectify-dev/core @rectify-dev/router
```

:::

## Vite setup

Configure `jsxImportSource` so JSX inside your app transpiles with Rectify's
runtime:

```ts title="vite.config.ts"
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@rectify-dev/core",
  },
});
```

## TypeScript

Add `jsxImportSource` to `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@rectify-dev/core"
  }
}
```

## Basic usage

```tsx title="src/main.tsx"
import { createRoot } from "@rectify-dev/core";
import { BrowserRouter, Routes, Route } from "@rectify-dev/router";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

```tsx title="src/App.tsx"
import { Routes, Route } from "@rectify-dev/router";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```
