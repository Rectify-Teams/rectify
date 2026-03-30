---
id: use-state
title: useState
slug: /api/hooks/use-state
---

# `useState`

```ts
function useState<S>(): [S | undefined, StateDispatcher<S | undefined>]
function useState<S>(initialState: S): [S, StateDispatcher<S>]
function useState<S>(initialState: () => S): [S, StateDispatcher<S>]
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialState` | `S \| (() => S)` | Initial value or a factory called once on mount. Omit for `undefined`. |

## Returns

`[state, setState]`

| | Type | Description |
|--|------|-------------|
| `state` | `S` | Current state value. |
| `setState` | `StateDispatcher<S>` | Enqueues a state update and schedules a re-render. |

## `StateDispatcher<S>`

```ts
type StateDispatcher<S> = (updater: S | ((prevState: S) => S)) => void
```

Accepts either a new value or an updater function receiving the previous state.

## See also

- [useState guide](/learn/use-state)
