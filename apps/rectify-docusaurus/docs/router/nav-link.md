---
id: nav-link
title: NavLink
sidebar_position: 5
slug: /router/nav-link
---

# `NavLink`

```ts
function NavLink(props: NavLinkProps): JSX
```

Like `Link` but adds `activeClassName` to the element's class list when the current path matches `to`.

## Props

```ts
type NavLinkProps = LinkProps & {
  activeClassName?: string;  // default "active"
  end?:             boolean; // default true
};
```

| Prop | Default | Description |
|------|---------|-------------|
| `activeClassName` | `"active"` | Extra class added when the link is active. |
| `end` | `true` | `true` = exact match. `false` = prefix match (active on any sub-path). |

## Usage

```tsx
import { NavLink } from "@rectify-dev/router";

// Exact match (default)
<NavLink to="/settings">Settings</NavLink>

// Active for /learn and any sub-path like /learn/hooks
<NavLink to="/learn" end={false} activeClassName="current">
  Learn
</NavLink>
```

## Styling active links

```css
/* global CSS */
.nav-link { color: #64748b; }
.nav-link.active { color: #7c6af7; font-weight: 600; }
```

```tsx
<NavLink to="/profile" className="nav-link">
  Profile
</NavLink>
```

:::tip
Avoid `style={{ color: "..." }}` inline props on `NavLink` — inline styles always win in CSS specificity, so `activeClassName` colors will never show. Use CSS classes or `className` instead.
:::
