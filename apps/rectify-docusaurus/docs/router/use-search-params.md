---
id: use-search-params
title: useSearchParams
sidebar_position: 12
slug: /router/use-search-params
---

# `useSearchParams`

```ts
function useSearchParams(): [
  URLSearchParams,
  (next: Record<string, string> | URLSearchParams) => void
]
```

Returns the current URL query string as a `URLSearchParams` object plus a setter that navigates to the same path with updated params.

## Usage

```tsx
import { useSearchParams } from "@rectify-dev/router";

function ProductList() {
  const [params, setParams] = useSearchParams();

  const category = params.get("category") ?? "all";
  const page     = Number(params.get("page") ?? "1");

  return (
    <div>
      <select
        value={category}
        onChange={(e) =>
          setParams({ category: (e.target as HTMLSelectElement).value, page: "1" })
        }
      >
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <button onClick={() => setParams({ category, page: String(page - 1) })}>
        ← Prev
      </button>
      <span> Page {page} </span>
      <button onClick={() => setParams({ category, page: String(page + 1) })}>
        Next →
      </button>
    </div>
  );
}
```

## Notes

- `setParams` calls `navigate(path + "?" + new URLSearchParams(next))` which pushes a history entry.
- Pass a `URLSearchParams` instance directly, or a plain `Record<string, string>`.
- All existing params are replaced — merge manually if you want to update a subset:

```tsx
const keep = Object.fromEntries(params.entries());
setParams({ ...keep, page: "2" });
```
