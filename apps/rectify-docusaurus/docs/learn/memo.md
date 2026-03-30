---
id: memo
title: memo
sidebar_position: 6
slug: /learn/memo
---

# `memo()`

`memo()` wraps a function component so Rectify skips re-rendering it when its **props have not changed**. The comparison is shallow by default (using `Object.is` on each prop), but you can supply a custom comparator.

```ts
function memo<P>(
  Component: FC<P>,
  compare?: (prevProps: P, nextProps: P) => boolean
): MemoComponent<P>
```

## Basic usage

```tsx
import { memo, useState } from "@rectify-dev/core";

// This component only re-renders when `name` or `score` actually change.
const ScoreCard = memo(function ScoreCard({
  name,
  score,
}: {
  name: string;
  score: number;
}) {
  console.log("ScoreCard rendered");
  return (
    <div>
      <strong>{name}</strong>: {score}
    </div>
  );
});

function App() {
  const [tick, setTick] = useState(0);
  return (
    <div>
      {/* ScoreCard will NOT re-render when tick changes */}
      <ScoreCard name="Alice" score={42} />
      <button onClick={() => setTick((t) => t + 1)}>
        Tick: {tick}
      </button>
    </div>
  );
}
```

## Custom comparator

The optional second argument receives `(prevProps, nextProps)`. Return `true` to **skip** the render, `false` to **allow** it.

```tsx
const Chart = memo(
  function Chart({ data }: { data: number[] }) {
    return <canvas />;
  },
  (prev, next) => {
    // Re-render only when the data array length changes
    return prev.data.length === next.data.length;
  },
);
```

:::caution
Returning `true` from the comparator means "props are equal, skip re-render". This is the **opposite** of `shouldComponentUpdate`, which returns `true` to **allow** re-rendering.
:::

## When to use `memo()`

`memo()` is most valuable when:

1. The component renders **expensive content** (large lists, heavy computation, canvas drawing).
2. It re-renders often due to **parent state changes** that don't affect its props.
3. Combined with `useMemo` / `useCallback` to stabilize prop references.

### Stabilizing props with `useCallback` and `useMemo`

```tsx
import { memo, useState, useCallback, useMemo } from "@rectify-dev/core";

const ItemList = memo(function ItemList({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (item: string) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item} onClick={() => onSelect(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
});

function Parent() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  // Stable reference — won't change unless filter changes
  const filteredItems = useMemo(
    () => ["Apple", "Banana", "Cherry"].filter((i) => i.includes(filter)),
    [filter],
  );

  // Stable callback — reference never changes
  const handleSelect = useCallback((item: string) => {
    setSelected(item);
  }, []);

  return (
    <div>
      <input
        value={filter}
        onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
        placeholder="Filter…"
      />
      <ItemList items={filteredItems} onSelect={handleSelect} />
      {selected && <p>Selected: {selected}</p>}
    </div>
  );
}
```

## What memo does NOT do

- It does **not** prevent re-renders caused by **context changes** (`useContext`).
- It does **not** help if the parent always passes **new object/array/function references** (use `useMemo`/`useCallback` to stabilize those).
- It adds a small per-render comparison cost — only apply it where you've measured a real performance problem.
