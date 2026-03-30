---
id: context
title: Context (deep dive)
sidebar_position: 20
slug: /learn/context
---

# Context (deep dive)

See [useContext](/learn/use-context) for the basic guide. This page covers advanced patterns.

## Splitting context to avoid unnecessary re-renders

If a context holds multiple values but consumers only depend on one, split it:

```tsx
const UserContext        = createContext<User | null>(null);
const UserActionsContext = createContext({ updateName: (_: string) => {} });

function UserProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | null>(null);

  const actions = useMemo(
    () => ({ updateName: (name: string) => setUser((u) => u ? { ...u, name } : u) }),
    [],
  );

  return (
    <UserContext value={user}>
      <UserActionsContext value={actions}>
        {children}
      </UserActionsContext>
    </UserContext>
  );
}

// Only re-renders when `user` changes, not when `actions` reference changes
function UserName() {
  const user = useContext(UserContext);
  return <p>{user?.name}</p>;
}
```

## Using `.Provider`

The context object also exposes a `.Provider` property. Both forms are identical:

```tsx
// These two are equivalent:
<ThemeContext value="dark">{children}</ThemeContext>
<ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
```

## Composition over nesting

Avoid deeply nested providers with a composition helper:

```tsx
function Providers({ children }: { children: any }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider>
          {children}
        </RouterProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```
