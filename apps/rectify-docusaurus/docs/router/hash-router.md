---
id: hash-router
title: HashRouter
sidebar_position: 2
slug: /router/hash-router
---

# `HashRouter`

```ts
function HashRouter(props: HashRouterProps): JSX
```

Router backed by the URL hash (`#`). URLs look like `/#/about`, `/#/users/42`. Ideal for static file hosting where you can't configure server-side redirects.

```ts
type HashRouterProps = {
  children?: any;
  basename?: string;
};
```

## Setup

```tsx
import { HashRouter } from "@rectify-dev/router";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
```

## Difference from BrowserRouter

| | `BrowserRouter` | `HashRouter` |
|--|-----------------|--------------|
| URL style | `/about` | `/#/about` |
| Server config | Needs catch-all redirect | Not needed |
| History API | `pushState` | Hash + `hashchange` |
| `createHref(to)` | `to` as-is | `#` + `to` |

## When to use

- Deploying to GitHub Pages, S3, or any static host.
- Environments where you cannot configure server rewrites.
