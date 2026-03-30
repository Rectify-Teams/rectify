---
id: fragment
title: Fragment
sidebar_position: 3
slug: /api/fragment
---

# `Fragment`

```ts
const Fragment: () => null
```

A sentinel component for grouping multiple children without adding an extra DOM element.

## Usage

```tsx
import { Fragment } from "@rectify-dev/core";

// These are equivalent:
const a = <Fragment><span>A</span><span>B</span></Fragment>;
const b = <><span>A</span><span>B</span></>;
```

Use the explicit `Fragment` when you need a `key` prop:

```tsx
{items.map((item) => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </Fragment>
))}
```
