# @rectify-dev/reconciler

## 1.1.0

### Minor Changes

- **`lazy()` + `Suspense`** — `LazyComponent` and `SuspenseComponent` work tags; work loop catches thrown thenables and suspends the nearest `SuspenseComponent` boundary; resolves via `handleSuspendedWork` scheduling a `DefaultLane` re-render.

- **Class components** — `ClassComponent` work tag; `beginWork` mounts instances, flushes `_pendingStateQueue`, snapshots `_prevProps`/`_prevState` before render; `commitWork` fires `componentDidMount` / `componentDidUpdate(prevProps, prevState)` / `componentWillUnmount` at the correct times.

- **Type-based unkeyed reconciliation** — `reconcileKeyed` now partitions old fibers into `keyedMap` (explicit key) and `unkeyedByType` (type queue). Unkeyed children are matched by component type in order of appearance rather than by position index, preventing unmount/remount when a sibling is conditionally inserted.

- **`getHostSibling` PlacementFlag skip** — siblings being placed in the same commit pass are excluded from `insertBefore` reference search.

- **`insertIntoParent` multi-level climb** — walks all non-host ancestor levels to find the correct `insertBefore` anchor for deeply nested components (e.g. inside `Suspense`).

- **Updated dependencies**
  - @rectify-dev/hook@1.2.0
  - @rectify-dev/shared@2.1.0

## 1.0.1

### Patch Changes

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

- Updated dependencies
  - @rectify-dev/hook@1.1.0
