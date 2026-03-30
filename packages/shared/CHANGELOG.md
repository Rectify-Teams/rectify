# @rectify-dev/shared

## 2.1.0

### Minor Changes

- Added `LazyStatus` type and `LazyComponent<T>` type (with call signature for JSX compatibility)
- Added `RectifyClassComponent<P>` constructor type; included in `RectifyTypeJsx` union
- Added `SuspenseProps` type (`{ fallback: RectifyNode; children?: RectifyNode }`)
- Added `classInstance` field to `Fiber` type for class component instance storage
- Exported `LazyComponent`, `LazyStatus`, `RectifyClassComponent`, `SuspenseProps` from the package index

## 2.0.0

### Major Changes

- Initial stable release with full type definitions for fiber architecture, JSX, hooks, events, and DOM bindings
