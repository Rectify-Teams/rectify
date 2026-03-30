---
id: lazy
title: lazy
sidebar_position: 6
slug: /api/lazy
---

# `lazy`

```ts
function lazy<T extends FC<any>>(
  factory: () => Promise<{ default: T } | T>
): T
```

Creates a lazily-loaded component. The `factory` is called only on first render. While loading, the nearest `<Suspense>` boundary shows its `fallback`.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `factory` | `() => Promise<{ default: T }>` | A function returning a dynamic import. Called once and cached. |

## Usage

```tsx
// Default export
const Settings = lazy(() => import("./pages/Settings"));

// Named export
const Profile = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile })),
);
```

## Internal shape

The returned object has these properties (do not depend on them in application code):

```ts
{
  _isLazy:   true;
  _status:   "pending" | "fulfilled" | "rejected";
  _result:   T | null;
  _promise:  Promise<void> | null;
  _payload:  () => Promise<{ default: T }>;
}
```

## Error handling

If the factory promise rejects, the error propagates as an unhandled rejection. Wrap with a custom error boundary if needed.
