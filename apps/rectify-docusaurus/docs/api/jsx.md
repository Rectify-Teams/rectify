---
id: jsx
title: jsx / jsxs
sidebar_position: 2
slug: /api/jsx
---

# `jsx` / `jsxs`

Low-level element factory functions. You rarely call these directly — the JSX transform emits them automatically.

```ts
function jsx(
  type: string | Function | symbol,
  props?: object,
  key?: string | number | null,
): RectifyElement
```

## What the JSX transform emits

```tsx
// You write:
const el = <div className="box">Hello</div>;

// The transform produces:
import { jsx } from "@rectify-dev/core/jsx-runtime";
const el = jsx("div", { className: "box", children: "Hello" });
```

## Element shape

Every `RectifyElement` has:

```ts
type RectifyElement = {
  $$typeof: symbol;    // RECTIFY_ELEMENT_TYPE
  type:     string | Function | symbol;
  props:    object;
  key:      string | null;
};
```

## `Fragment`

`Fragment` is a special sentinel function. JSX shorthand `<>…</>` compiles to `jsx(Fragment, { children: … })`.

```tsx
import { Fragment } from "@rectify-dev/core";

const list = (
  <Fragment>
    <li>One</li>
    <li>Two</li>
  </Fragment>
);
```
