---
id: create-root
title: createRoot
sidebar_position: 1
slug: /api/create-root
---

# `createRoot`

```ts
function createRoot(container: Element): {
  render(node: RectifyNode): void;
  unmount(): void;
}
```

Creates a Rectify root attached to a DOM container and returns a handle for rendering and unmounting.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `Element` | The DOM element to mount into. Typically `document.getElementById("root")`. |

## Returns

An object with two methods:

| Method | Description |
|--------|-------------|
| `render(node)` | Mounts or updates the component tree inside `container`. |
| `unmount()` | Cleans up all mounted components and removes Rectify's internal tracking from `container`. |

## Usage

```tsx title="src/main.tsx"
import { createRoot } from "@rectify-dev/core";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

## Re-rendering

Calling `render()` multiple times updates the tree in place (reconciles):

```tsx
const root = createRoot(container);
root.render(<App theme="dark" />);

// Later — reconciles instead of full remount
root.render(<App theme="light" />);
```

## Unmounting

```tsx
root.unmount();
// container is now empty and untracked
```

:::info
`createRoot` sets up delegated event listeners on the container once. All synthetic event handlers (`onClick`, `onChange`, etc.) bubble up to this single root listener, keeping the actual DOM event count constant regardless of how many components are rendered.
:::
