---
id: bailout
title: Automatic Re-render Bailout
sidebar_position: 14
slug: /learn/bailout
---

# Automatic Re-render Bailout

Rectify can **skip re-rendering a component** when its output won't change.
This is called a *bailout*. Understanding when bailouts fire—and when they
don't—lets you write performant components without manual micro-optimisation.

---

## How bailout works under the hood

Every render pass runs through Rectify's `beginWork` function for each fiber.
Before calling a component function, `beginWork` checks two conditions:

| Condition | Meaning |
|-----------|---------|
| `isUpdate` | This is not the first mount — there is a committed version to compare against. |
| `hasNoPendingWork` | The component has **no self-scheduled update** in the current render lane (i.e., its own `useState` dispatcher was not invoked). |

When both conditions hold **and** the new props are shallowly equal to the
previous props, Rectify clones the existing child fibers and returns without
calling the component. The subtree is still traversed — each child makes its
own bailout decision — but the component function itself does not run.

---

## Function components — automatic shallow bailout

:::info Key difference from React
In React, a bare function component **always** re-renders when its parent
re-renders. You must explicitly wrap it with `React.memo` to opt in to prop
comparison.

In Rectify, **all function components** automatically bail out when:
1. No self-scheduled state update is pending, **and**
2. The new props are shallowly equal to the previous props.

`memo()` is only needed in Rectify when you want a **custom comparator**.
:::

```tsx
import { useState } from "@rectify-dev/core";

// No memo() needed — Rectify will skip Banner re-renders when `title` hasn't changed.
function Banner({ title }: { title: string }) {
  console.log("Banner rendered");
  return <h1>{title}</h1>;
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* Banner bails out every tick because `title` is the same string. */}
      <Banner title="Welcome" />
      <button onClick={() => setCount((c) => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

### When bailout is skipped for a function component

The component **will** re-render despite shallow-equal props when:

- `useState` / `useReducer` dispatched an update on this component in the
  current pass (it has pending work in the current lane).
- It is the first render (mount).
- A prop reference changed — e.g. an inline object `{{ color: "red" }}` or
  an arrow function `() => doSomething()` creates a **new** reference every
  render, failing shallow equality.

---

## `memo()` — custom comparator

Use `memo()` only when you need a **non-shallow comparison** for props.

```tsx
import { memo } from "@rectify-dev/core";

const Chart = memo(
  function Chart({ points }: { points: { x: number; y: number }[] }) {
    return <canvas />;
  },
  // Custom comparator: only re-render when the array length changes.
  (prev, next) => prev.points.length === next.points.length,
);
```

The second argument receives `(prevProps, nextProps)`.  
Return **`true`** → props are equal → **skip** render.  
Return **`false`** → props changed → **allow** render.

:::caution
This is the **opposite** of `shouldComponentUpdate`, which returns `true` to
**allow** re-rendering.
:::

### `memo()` bailout conditions

| Condition | Required? |
|-----------|-----------|
| `isUpdate` | ✅ yes |
| `hasNoPendingWork` | ✅ yes |
| `comparator(prev, next) === true` | ✅ yes (uses `shallowEqual` when no comparator is supplied) |

When `hasNoPendingWork` is `false` (the component dispatched its own state
update), `memo` does **not** bail out — the component re-renders with its new
state regardless of what the comparator says.

---

## Class components — `shouldComponentUpdate`

For class components, Rectify checks:

1. **Auto-bailout** (same as function components): if there is no pending
   state queue **and** props are shallowly equal, the component is skipped.
2. **`shouldComponentUpdate`**: if defined, it is called with the next props
   and the already-flushed next state. Returning `false` bails out.

```tsx
import { Component } from "@rectify-dev/core";

class Counter extends Component<{ step: number }, { count: number }> {
  state = { count: 0 };

  // Only re-render when count or step actually changes.
  shouldComponentUpdate(
    nextProps: { step: number },
    nextState: { count: number },
  ) {
    return (
      nextProps.step !== this.props.step ||
      nextState.count !== this.state.count
    );
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + this.props.step })}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

:::tip
Prefer function components + automatic shallow bailout over class components
with manual `shouldComponentUpdate` — no extra code needed and Rectify handles
it for you.
:::

---

## Stabilising prop references

The automatic shallow comparison checks each prop with `Object.is`. Primitive
values (`string`, `number`, `boolean`) are always stable.  
Objects and functions need to be **stabilised** to keep the same reference
between renders.

### Stabilise with `useCallback`

```tsx
import { useState, useCallback } from "@rectify-dev/core";

function Parent() {
  const [count, setCount] = useState(0);

  // Same function reference as long as count doesn't change.
  const handleDelete = useCallback((id: number) => {
    console.log("delete", id, count);
  }, [count]);

  return <ItemList onDelete={handleDelete} />;
}
```

### Stabilise with `useMemo`

```tsx
import { useState, useMemo } from "@rectify-dev/core";

function Parent({ userId }: { userId: string }) {
  const [filter, setFilter] = useState("");

  // Same object reference when userId and filter haven't changed.
  const query = useMemo(() => ({ userId, filter }), [userId, filter]);

  return <DataTable query={query} />;
}
```

Without `useMemo`, a new `{ userId, filter }` object is created every render
and the shallow equality check on `DataTable`'s props always fails.

---

## `useState` dispatch and bailout

Calling a `setState` dispatcher **marks the fiber with pending work** in the
current render lane. Because `hasNoPendingWork` becomes `false`, the automatic
bailout is bypassed — the component will re-render to apply the new state.

```tsx
const [value, setValue] = useState(0);

// Always schedules a re-render — Rectify does NOT guard this dispatch
// with Object.is(prev, next) like React does.
setValue(0); // Component will re-render even though value is still 0.
```

:::note
Unlike React, Rectify's `useState` dispatcher does **not** perform an
`Object.is` early-exit check before scheduling a re-render.  If you need to
avoid redundant dispatches, add the check yourself:

```tsx
function handleChange(next: number) {
  // Guard the dispatch manually.
  if (next !== value) setValue(next);
}
```
:::

---

## Context provider bailout

A `ContextProvider` fiber bails out (and does not notify subscribers) when the
provided value is the same reference:

```tsx
// Same object reference → no subscriber re-renders.
const stable = useMemo(() => ({ user, logout }), [user, logout]);
return <AuthContext.Provider value={stable}>...</AuthContext.Provider>;
```

Passing an unstable object (e.g. `value={{ user, logout }}`) creates a new
reference every render, triggering all context consumers to re-render.

---

## Summary

| Component type | Auto-bailout condition | Custom bailout |
|---------------|----------------------|----------------|
| Function component | `isUpdate` + `hasNoPendingWork` + shallow-equal props | `memo(comparator)` |
| `memo()` component | `isUpdate` + `hasNoPendingWork` + comparator returns `true` | Custom comparator |
| Class component | `hasNoPendingWork` + no state queue + shallow-equal props | `shouldComponentUpdate` |
| Context provider | `isUpdate` + `hasNoPendingWork` + `Object.is(prevValue, nextValue)` | — |
