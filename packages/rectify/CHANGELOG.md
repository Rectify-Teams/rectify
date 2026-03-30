# @rectify/core

## 2.2.0

### Minor Changes

- **`lazy()` + `Suspense`** — code-split any component with `lazy(() => import('./MyComponent'))` and wrap it in `<Suspense fallback={<Loading />}>` to show a placeholder while the module loads.

- **Class components** — extend `Component<Props, State>` to write class-based components with full lifecycle support:
  - `componentDidMount()` — fires once after the first commit
  - `componentDidUpdate(prevProps, prevState)` — fires after every re-render; `prevProps`/`prevState` are correct snapshots taken before the render
  - `componentWillUnmount()` — fires before the component is removed from the DOM
  - `shouldComponentUpdate(nextProps, nextState)` — return `false` to skip re-rendering
  - `setState(partial | updater)` — queued state updates (safe to call multiple times synchronously)

- **`useId()`** — returns a stable, globally unique string ID (e.g. `":r0:"`) that never changes across re-renders. Useful for linking form labels to inputs via `id`/`htmlFor`.

- **`JSX.IntrinsicAttributes`** — `key` is now accepted on every JSX element (host and component) without TypeScript errors.

- **Reconciler: type-based unkeyed matching** — sibling components without explicit `key` props are now matched by component type rather than position. A component that shifts position because a sibling is conditionally inserted before it will be updated, not remounted.

- **Bug fixes**
  - `componentDidUpdate` now receives the correct `prevState` (state before the render, not after)
  - Class component bailout: props-unchanged + no queued state → skip re-render and lifecycle
  - Lazy component DOM placement: correctly uses `insertBefore` relative to already-committed siblings on first resolution

## 2.1.0

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

## 2.0.0

### Major Changes

- Tool create rectify app

### Minor Changes

- Initial release of Rectify packages.

  - `@rectify/core` — core runtime with hooks, context, memo, and JSX support
  - `@rectify/babel-transform-rectify-jsx` — Babel plugin that transforms JSX for Rectify
  - `@rectify/vite-plugin` — Vite plugin wrapping the Babel transform (`rectify()`)
  - `create-rectify-app` — CLI scaffolding tool (`npm create rectify-app my-app`)
