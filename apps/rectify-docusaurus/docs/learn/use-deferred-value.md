---
id: use-deferred-value
title: useDeferredValue
sidebar_position: 22
slug: /learn/use-deferred-value
---

# `useDeferredValue`

`useDeferredValue` lets you defer updating a part of the UI so that more
urgent updates (like typing into an input) remain responsive.

```ts
const deferred = useDeferredValue(value);
```

---

## Basic usage

```tsx
import { useState, useDeferredValue } from "@rectify-dev/core";

function SearchPage() {
  const [query, setQuery] = useState("");

  // `deferredQuery` lags behind `query` during rapid typing,
  // so the heavy list update doesn't block the input.
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
      />
      <SearchResults query={deferredQuery} />
    </>
  );
}
```

While the user types quickly, `query` updates immediately so the input stays
responsive. `deferredQuery` catches up only when the browser is idle, letting
`SearchResults` re-render without blocking the input.

---

## Showing stale content

Use `useDeferredValue` together with a visual indicator to show that content is
being refreshed:

```tsx
import { useState, useDeferredValue } from "@rectify-dev/core";

function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div style={{ opacity: isStale ? 0.5 : 1, transition: "opacity 0.2s" }}>
        <SearchResults query={deferredQuery} />
      </div>
    </>
  );
}
```

---

## With `memo()` for maximum benefit

`useDeferredValue` only helps when the component that uses the deferred value
can bail out when the value hasn't changed. Wrap it with `memo()` (or rely on
Rectify's automatic shallow-prop bailout) to ensure it does not re-render while
the query is still being deferred.

```tsx
import { memo } from "@rectify-dev/core";

const SearchResults = memo(function SearchResults({ query }: { query: string }) {
  const results = expensiveFilter(query);
  return <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>;
});
```

---

## Comparison with `useTransition`

| | `useDeferredValue` | `useTransition` |
|---|---|---|
| Controls | A **value** | A **state update** |
| Useful when | You receive a value from outside (props / uncontrolled input) | You own the state setter |
| API | `const d = useDeferredValue(v)` | `const [isPending, startTransition] = useTransition()` |

---

## Reference

```ts
const deferred = useDeferredValue<T>(value: T): T
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `T` | The value to defer. Any type. |

### Returns

The deferred value. During the initial render it is the same as `value`. When
`value` changes, Rectify first re-renders with the **old** deferred value
(allowing bailout), then schedules a lower-priority re-render to update it.

---

## Caveats

- `useDeferredValue` does not add any artificial delay. If Rectify is already
  idle, the deferred value updates in the same pass.
- The deferred value is always a render behind when updates come in rapidly.
  Do not use it for values that must be exact (e.g. form validation).
