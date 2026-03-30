---
id: fragments
title: Fragments
sidebar_position: 7
slug: /learn/fragments
---

# Fragments

A component must return a **single root element**. When you need to return multiple elements without adding an extra DOM wrapper, use a Fragment.

## Shorthand syntax `<>…</>`

```tsx
function Row() {
  return (
    <>
      <td>Name</td>
      <td>Age</td>
    </>
  );
}
```

## Explicit `<Fragment>` with a key

Use the explicit form when you need a `key` prop (e.g., inside a map):

```tsx
import { Fragment } from "@rectify-dev/core";

const data = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob",   age: 25 },
];

function Table() {
  return (
    <table>
      <tbody>
        {data.map((row) => (
          <Fragment key={row.id}>
            <tr><td colSpan={2}><strong>{row.name}</strong></td></tr>
            <tr><td>Age</td><td>{row.age}</td></tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
```

:::info
`<>` shorthand does not support `key`. Use `<Fragment key={…}>` when you need to key a group of elements.
:::
