---
id: suspense
title: Suspense
sidebar_position: 7
slug: /api/suspense
---

# `Suspense`

```ts
const Suspense: (props: SuspenseProps) => null
```

A boundary component that renders `fallback` while any descendant throws a Promise (i.e., is loading via `lazy` or a data-fetching library that uses the Suspense protocol).

## Props

```ts
type SuspenseProps = {
  /** Rendered while any child is loading. */
  fallback: RectifyNode;
  children?: RectifyNode;
};
```

| Prop | Type | Description |
|------|------|-------------|
| `fallback` | `RectifyNode` | UI to show while loading. Can be any valid Rectify node. |
| `children` | `RectifyNode` | The content to render once loaded. |

## Usage

```tsx
import { Suspense, lazy } from "@rectify-dev/core";

const Chart = lazy(() => import("./Chart"));

function Dashboard() {
  return (
    <Suspense fallback={<div className="skeleton" />}>
      <Chart />
    </Suspense>
  );
}
```

## Nesting

Multiple `<Suspense>` boundaries can be nested. Rectify activates the **nearest ancestor** when a child suspends:

```tsx
<Suspense fallback={<PageShell />}>
  <Header /> {/* already loaded */}

  <Suspense fallback={<ChartLoader />}>
    <HeavyChart /> {/* lazy — shows ChartLoader, not PageShell */}
  </Suspense>
</Suspense>
```
