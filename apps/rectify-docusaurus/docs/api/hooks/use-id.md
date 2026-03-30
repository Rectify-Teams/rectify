---
id: use-id
title: useId
slug: /api/hooks/use-id
---

# `useId`

```ts
function useId(): string
```

Returns a stable unique ID string (e.g. `"_r0_"`) generated once on mount.

## Returns

A string that is:
- **Unique** across the component tree
- **Stable** — the same string on every re-render
- **Not suitable** as a list key

## Use case

Linking form controls to their labels for accessibility:

```tsx
function Labeled({ label }: { label: string }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

## See also

- [useId guide](/learn/use-id)
