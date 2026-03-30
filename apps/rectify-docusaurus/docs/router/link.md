---
id: link
title: Link
sidebar_position: 4
slug: /router/link
---

# `Link`

```ts
function Link(props: LinkProps): JSX
```

A client-side navigation anchor. Intercepts plain left-clicks to update the URL without a full page reload. Modified clicks (Ctrl / Cmd / Shift / Alt) and middle-button clicks are passed through so "open in new tab" works.

## Props

```ts
type LinkProps = {
  to:        string;            // destination path
  replace?:  boolean;           // replace history entry instead of push
  state?:    unknown;           // attached to history.state
  children?: RectifyNode;
  className?: string;
  style?:    CSSProperties;
  onClick?:  (e: SyntheticMouseEvent) => void;
};
```

## Usage

```tsx
import { Link } from "@rectify-dev/router";

<Link to="/about">About</Link>
<Link to="/users/42">User 42</Link>
<Link to="/checkout" replace state={{ from: "/cart" }}>
  Checkout
</Link>
```

## External links

For external URLs, use a plain `<a>` tag:

```tsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External site ↗
</a>
```

## Reading navigation state

```tsx
function Checkout() {
  const { state } = useLocation();
  return <p>Came from: {(state as any)?.from ?? "unknown"}</p>;
}
```

## See also

- [`NavLink`](/router/nav-link) — active-class variant
- [`useNavigate`](/router/use-navigate) — programmatic navigation
