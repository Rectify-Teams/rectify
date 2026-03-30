---
id: use-href
title: useHref
sidebar_position: 13
slug: /router/use-href
---

# `useHref`

```ts
function useHref(to: string): string
```

Returns the `href` string that a `<Link to={to}>` would produce. Handles the `#` prefix for `<HashRouter>`.

## Usage

```tsx
import { useHref } from "@rectify-dev/router";

function CopyLinkButton({ to }: { to: string }) {
  const href = useHref(to);

  const copy = () => {
    const url = new URL(href, window.location.origin);
    navigator.clipboard.writeText(url.toString());
  };

  return <button onClick={copy}>Copy link</button>;
}
```

## Notes

- With `BrowserRouter`: `useHref("/about")` → `"/about"`
- With `HashRouter`:    `useHref("/about")` → `"#/about"`
