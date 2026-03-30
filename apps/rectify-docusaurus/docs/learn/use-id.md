---
id: use-id
title: useId
sidebar_position: 17
slug: /learn/use-id
---

# `useId`

`useId` returns a **stable, globally unique string** generated once on mount. Its primary use case is generating accessible `id` attributes for form controls without collisions.

```ts
function useId(): string
// Returns e.g. "_r0_", "_r1_", "_r2_", …
```

## Basic usage

```tsx
import { useId } from "@rectify-dev/core";

function FormField({ label }: { label: string }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}
```

Every `<FormField>` instance gets its own unique `id`, so labeling works correctly even when the component is rendered multiple times.

## Multiple ids from one call

Append a suffix to create several related ids from a single `useId`:

```tsx
function RangeField({ label }: { label: string }) {
  const id = useId();

  return (
    <fieldset>
      <legend>{label}</legend>
      <label htmlFor={`${id}-min`}>Min</label>
      <input id={`${id}-min`} type="number" />
      <label htmlFor={`${id}-max`}>Max</label>
      <input id={`${id}-max`} type="number" />
    </fieldset>
  );
}
```

:::info
`useId` is **not** suitable for generating keys in lists. Use stable, content-derived identifiers for list keys.
:::
