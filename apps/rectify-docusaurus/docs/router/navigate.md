---
id: navigate
title: Navigate
sidebar_position: 6
slug: /router/navigate
---

# `Navigate`

```ts
function Navigate(props: NavigateProps): null

type NavigateProps = {
  to:       string;
  replace?: boolean;
  state?:   unknown;
};
```

Renders `null` but triggers `navigate(to, { replace, state })` inside a `useEffect` — effectively redirecting while React renders.

## Usage

```tsx
import { Navigate } from "@rectify-dev/router";

function ProtectedRoute({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ returnTo: "/dashboard" }} />;
  }
  return <Dashboard />;
}
```

## Notes

- `replace = true` replaces the current history entry so the user can't go "back" to the redirected page.
- For programmatic navigation without rendering, use `useNavigate()` in a `useEffect` or event handler.
