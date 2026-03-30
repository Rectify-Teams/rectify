---
id: installation
title: Installation
sidebar_position: 2
slug: /learn/installation
---

# Installation

## Prerequisites

- Node.js 18 or higher
- A bundler that supports JSX transforms (Vite recommended)

## Create a new project

The fastest way to get started:

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

<Tabs>
  <TabItem value="npm" label="npm" default>

```bash
npx @rectify-dev/create-rectify-app@latest my-app
cd my-app
npm install
npm run dev
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm create @rectify-dev/rectify-app my-app
cd my-app
pnpm install
pnpm dev
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn create @rectify-dev/rectify-app my-app
cd my-app
yarn
yarn dev
```

  </TabItem>
</Tabs>

## Manual setup

### 1. Install packages

<Tabs>
  <TabItem value="npm" label="npm" default>

```bash
npm install @rectify-dev/core
# optional router
npm install @rectify-dev/router
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add @rectify-dev/core
# optional router
pnpm add @rectify-dev/router
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add @rectify-dev/core
# optional router
yarn add @rectify-dev/router
```

  </TabItem>
</Tabs>

### 2. Configure Vite

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import rectify from "@rectify-dev/vite-plugin";

export default defineConfig({
  plugins: [rectify()],
});
```

The Vite plugin configures the JSX transform automatically. No Babel needed.

### 3. Mount your app

```tsx title="src/main.tsx"
import { createRoot } from "@rectify-dev/core";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

```tsx title="src/App.tsx"
export default function App() {
  return <h1>Hello Rectify!</h1>;
}
```

## Manual Babel setup

If you prefer Babel (e.g., Jest environments):

<Tabs>
  <TabItem value="npm" label="npm" default>

```bash
npm install --save-dev @rectify-dev/babel-transform-rectify-jsx
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add -D @rectify-dev/babel-transform-rectify-jsx
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add --dev @rectify-dev/babel-transform-rectify-jsx
```

  </TabItem>
</Tabs>

```json title=".babelrc"
{
  "plugins": ["@rectify-dev/babel-transform-rectify-jsx"]
}
```

## TypeScript `tsconfig.json`

```json title="tsconfig.json"
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
