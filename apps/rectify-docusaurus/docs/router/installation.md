---
id: router-installation
title: Installation
sidebar_position: 0
slug: /router/installation
---

# Router Installation

`@rectify-dev/router` is a separate package and must be installed alongside
`@rectify-dev/core`.

## Install

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

<Tabs>
  <TabItem value="npm" label="npm" default>
```bash
npm install @rectify-dev/router
```
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
```bash
pnpm add @rectify-dev/core @rectify-dev/router
```
  </TabItem>
  <TabItem value="yarn" label="yarn">
```bash
yarn add @rectify-dev/core @rectify-dev/router
```
  </TabItem>
</Tabs>

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
