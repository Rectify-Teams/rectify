---
id: use-navigate
title: useNavigate
sidebar_position: 8
slug: /router/use-navigate
---

# `useNavigate`

```ts
function useNavigate(): NavigateFunction

type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
};

type NavigateOptions = {
  replace?: boolean;
  state?:   unknown;
};
```

Returns the router's navigate function for programmatic navigation.

## Usage

```tsx
import { useNavigate } from "@rectify-dev/router";

function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const ok = await login(/* ... */);
    if (ok) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## Options

```tsx
// Push new history entry (default)
navigate("/profile");

// Replace current entry (no back button)
navigate("/login", { replace: true });

// Attach state to history entry
navigate("/checkout", { state: { items: cart } });

// Go back / forward
navigate(-1);  // back
navigate(1);   // forward
navigate(-2);  // two steps back
```
