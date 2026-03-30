---
id: use-reducer
title: useReducer
slug: /api/hooks/use-reducer
---

# `useReducer`

```ts
function useReducer<S, A>(
  reducer: Reducer<S, A>,
  initialState: S
): [S, Dispatch<A>]

function useReducer<S, A, I>(
  reducer: Reducer<S, A>,
  initialArg: I,
  init: (arg: I) => S
): [S, Dispatch<A>]
```

## Types

```ts
type Reducer<S, A> = (state: S, action: A) => S
type Dispatch<A>   = (action: A) => void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `reducer` | `Reducer<S, A>` | Pure function `(state, action) => newState`. |
| `initialState` | `S` | Initial state value. |
| `initialArg` | `I` | Passed to `init` to compute initial state lazily. |
| `init` | `(arg: I) => S` | Optional lazy initializer. |

## Returns

`[state, dispatch]`

## See also

- [useReducer guide](/learn/use-reducer)
