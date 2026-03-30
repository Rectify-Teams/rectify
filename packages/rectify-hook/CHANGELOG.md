# @rectify-dev/hook

## 1.2.0

### Minor Changes

- **`useId()`** — returns a stable, globally unique string ID that is generated once on mount and returned unchanged on every subsequent render. Format: `":rXX:"` (base-36 counter). Each `useId()` call within a component gets its own independent ID.

## 1.1.0

### Minor Changes

- Add `useReducer`, `useDeferredValue`, and `ref` improvements

  **New hooks**

  - `useReducer(reducer, initialArg, init?)` — full implementation including lazy initializer overload
  - `useDeferredValue(value)` — defers non-urgent updates to TransitionLane, keeping high-priority renders fast

  **`ref` prop**

  - `useRef` — already implemented; object refs (`{ current }`) now correctly attached on mount, update, and unmount
  - Callback refs — `ref={(node) => { … return cleanup }}` supported; cleanup is called before the next attach or on unmount (React 19-style)
  - `RefFlag` — ref-only changes trigger a dedicated commit pass so `attachRef`/`detachRef` always fire even when no other props changed

  **Bug fixes**

  - `insertBefore` `NotFoundError` when re-rendering lists: `getHostSibling` now skips fibers that are pending their own placement (not yet in the DOM)
  - `insertBefore` across DOM container boundaries: the sibling search stops at `HostComponent`/`HostRoot` and no longer escapes to a sibling's parent element

  **Internal**

  - Refactored `useRef`, `useMemo`, `useState`, and `useReducer` to share `getHookSlot` + `attachHook` helpers (eliminates duplicated linked-list walk boilerplate)
