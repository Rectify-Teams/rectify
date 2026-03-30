---
id: use-callback
title: useCallback
sidebar_position: 14
slug: /learn/use-callback
---

# `useCallback`

`useCallback` returns a **memoized function**. The reference is stable as long as the dependency array doesn't change.

```ts
function useCallback<T extends Function>(callback: T, deps: any[]): T
```

Internally it is implemented as:

```ts
const memoizedFn = useMemo(() => callback, deps);
```

## Basic usage

```tsx
import { useState, useCallback, memo } from "@rectify-dev/core";

const Child = memo(function Child({ onClick }: { onClick: () => void }) {
  console.log("Child rendered");
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Without useCallback: new function every render → Child always re-renders
  // With useCallback: same reference → Child skips re-render when text changes
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // no deps → stable forever

  return (
    <div>
      <input
        value={text}
        onInput={(e) => setText((e.target as HTMLInputElement).value)}
      />
      <Child onClick={handleClick} />
      <p>Count: {count}</p>
    </div>
  );
}
```

## With dependencies

Include any values captured from the function's scope:

```tsx
function SearchForm({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(() => {
    if (query.trim()) onSearch(query);
  }, [query, onSearch]); // re-creates when query or onSearch changes

  return (
    <form onSubmit={(e) => { e.preventDefault?.(); handleSubmit(); }}>
      <input
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

## With `useEffect`

Stabilizing callbacks lets you declare them as `useEffect` dependencies safely:

```tsx
function useInterval(callback: () => void, ms: number) {
  // Stable reference so the effect doesn't restart on every render
  const stableCallback = useCallback(callback, []);

  useEffect(() => {
    const id = setInterval(stableCallback, ms);
    return () => clearInterval(id);
  }, [stableCallback, ms]);
}
```

:::info
`useCallback(fn, deps)` is **exactly** `useMemo(() => fn, deps)`. Use whichever reads more clearly for your team.
:::
