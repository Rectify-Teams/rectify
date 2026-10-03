---
"@rectify-dev/core": patch
---

Fix state updates being dropped when a page has more than one `createRoot()` container. The scheduler remembered only the most recently rendered root; it now tracks every mounted root, and `root.unmount()` stops scheduling work for its root.
