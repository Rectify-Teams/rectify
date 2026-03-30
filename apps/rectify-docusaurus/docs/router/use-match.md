---
id: use-match
title: useMatch
sidebar_position: 11
slug: /router/use-match
---

# `useMatch`

```ts
function useMatch(pattern: string): PathMatch | null

type PathMatch = {
  params:       Record<string, string>;
  pathnameBase: string;
};
```

Tests `pattern` against the current pathname. Returns a match object on success, `null` on failure.

## Usage

```tsx
import { useMatch } from "@rectify-dev/router";

function PromoNavLink() {
  const isOnPromo = useMatch("/promo/:code");

  return (
    <a
      href="/promo/SUMMER25"
      style={{ fontWeight: isOnPromo ? "bold" : "normal" }}
    >
      Summer Sale
    </a>
  );
}
```

## Extracting params

```tsx
const match = useMatch("/blog/:slug");

if (match) {
  console.log(match.params.slug);      // e.g. "hello-world"
  console.log(match.pathnameBase);     // e.g. "/blog/hello-world"
}
```
