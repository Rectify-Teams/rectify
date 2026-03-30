---
id: use-location
title: useLocation
sidebar_position: 9
slug: /router/use-location
---

# `useLocation`

```ts
function useLocation(): RouterLocation

type RouterLocation = {
  pathname: string;   // e.g. "/users/42"
  search:   string;   // e.g. "?tab=profile"
  hash:     string;   // e.g. "#section-1"
  state:    unknown;  // value from navigate(..., { state })
  key:      string;   // unique key for this history entry
};
```

Returns the current location object. The component re-renders on every navigation.

## Usage

```tsx
import { useLocation } from "@rectify-dev/router";

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav>
      {parts.map((part, i) => (
        <span key={i}> / {part}</span>
      ))}
    </nav>
  );
}
```

## Reading navigation state

```tsx
function WelcomePage() {
  const { state } = useLocation() as { state: { from?: string } | null };
  return <p>Redirected from: {state?.from ?? "direct"}</p>;
}
```

## Route change effect

```tsx
useEffect(() => {
  window.scrollTo(0, 0);
}, [location.pathname]);
```
