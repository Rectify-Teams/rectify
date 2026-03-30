---
id: use-reducer
title: useReducer
sidebar_position: 15
slug: /learn/use-reducer
---

# `useReducer`

`useReducer` manages complex state transitions via a **reducer function**. It is a good alternative to `useState` when the next state depends on the previous state in non-trivial ways, or when multiple sub-values are updated together.

```ts
// Standard form
function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, Dispatch<A>]

// Lazy initialization form
function useReducer<S, A, I>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init: (arg: I) => S
): [S, Dispatch<A>]
```

## Basic usage

```tsx
import { useReducer } from "@rectify-dev/core";

type State  = { count: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    case "reset":     return { count: action.payload };
    default:          return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset", payload: 0 })}>Reset</button>
    </div>
  );
}
```

## Lazy initialization

Pass a third `init` function to compute the initial state lazily. Useful when initial state depends on props or an expensive calculation:

```tsx
type FormState = { name: string; email: string };

function initForm(initial: Partial<FormState>): FormState {
  return { name: initial.name ?? "", email: initial.email ?? "" };
}

function UserForm({ defaults }: { defaults: Partial<FormState> }) {
  const [form, dispatch] = useReducer(
    (state: FormState, patch: Partial<FormState>) => ({ ...state, ...patch }),
    defaults,
    initForm,  // ← called once with `defaults`
  );

  return (
    <form>
      <input
        value={form.name}
        onInput={(e) =>
          dispatch({ name: (e.target as HTMLInputElement).value })
        }
      />
    </form>
  );
}
```

## Complex state example — shopping cart

```tsx
type Item   = { id: string; name: string; qty: number; price: number };
type Cart   = { items: Item[]; coupon: string | null };
type Action =
  | { type: "ADD";    item: Item }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "APPLY_COUPON"; code: string }
  | { type: "CLEAR" };

function cartReducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case "ADD":
      return { ...state, items: [...state.items, action.item] };
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "SET_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i,
        ),
      };
    case "APPLY_COUPON":
      return { ...state, coupon: action.code };
    case "CLEAR":
      return { items: [], coupon: null };
    default:
      return state;
  }
}

function Cart() {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], coupon: null });
  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div>
      <ul>
        {cart.items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.qty}
            <button onClick={() => dispatch({ type: "REMOVE", id: item.id })}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}
```

## `useReducer` vs `useState`

| | `useState` | `useReducer` |
|---|---|---|
| Best for | Simple, independent values | Related values or complex transitions |
| State shape | Primitive / simple object | Any |
| Update logic | Inline in handler | Centralized in reducer |
| Testing | Test component | Test pure reducer function |
