---
id: memo
title: memo
sidebar_position: 5
slug: /api/memo
---

# `memo`

```ts
function memo<P>(
  Component: FC<P>,
  compare?: (prevProps: P, nextProps: P) => boolean
): MemoComponent<P>
```

Wraps a function component to skip re-renders when props are equal. See [memo guide](/learn/memo) for usage examples.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `Component` | `FC<P>` | required | The function component to wrap. |
| `compare` | `(prev: P, next: P) => boolean` | shallow equality | Custom comparator. Return `true` to skip re-render. |

## Returns

A `MemoComponent<P>` — a function component that behaves identically but skips reconciliation when props are equal.

## MemoComponent type

```ts
type MemoComponent<P> = FC<P> & {
  _isMemo:   true;
  _render:   FC<P>;     // the original component
  _compare:  ((prev: P, next: P) => boolean) | null;
};
```
