---
id: create-portal
title: createPortal
sidebar_position: 3
slug: /api/create-portal
---

# `createPortal`

```ts
function createPortal(
  children: RectifyNode,
  container: Element,
  key?: RectifyKey
): RectifyPortal
```

Renders `children` into a different DOM `container` while keeping them inside the Rectify component tree. Context, state, and event propagation all behave as if the portal's children were rendered in their original position in the tree.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `children` | `RectifyNode` | Any renderable Rectify content — elements, text, fragments, etc. |
| `container` | `Element` | The DOM element to render into. Must already exist in the document. |
| `key` | `RectifyKey` | Optional key for reconciliation when rendering multiple portals from the same parent. |

## Returns

A `RectifyPortal` object that can be returned from any component's render function.

## Usage

```tsx
import { createPortal } from "@rectify-dev/core";

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body,
  );
}
```

## Common use cases

### Modals and dialogs

Render a modal at `document.body` so it sits above all other content, while still receiving props and context from its logical parent in the tree:

```tsx
function Dialog({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

### Tooltips

Render tooltips in a dedicated container to avoid `overflow: hidden` clipping:

```tsx
const tooltipRoot = document.getElementById("tooltip-root")!;

function Tooltip({ text, children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered &&
        createPortal(
          <div className="tooltip">{text}</div>,
          tooltipRoot,
        )}
    </span>
  );
}
```

### Multiple portals with keys

When a single component renders more than one portal into the same container, supply unique keys to help the reconciler match them across renders:

```tsx
function Overlays({ notifications }) {
  return notifications.map((n) =>
    createPortal(
      <Notification message={n.message} />,
      document.body,
      n.id,
    ),
  );
}
```

## Context propagation

Portals are part of the Rectify tree, not the DOM tree. Context provided above a portal is accessible inside it:

```tsx
const ThemeContext = createContext("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Modal />
    </ThemeContext.Provider>
  );
}

function Modal() {
  // Reads "dark" even though the portal renders in document.body
  const theme = useContext(ThemeContext);
  return createPortal(
    <div className={`modal ${theme}`}>Hello</div>,
    document.body,
  );
}
```

## Event bubbling

Synthetic events fired inside a portal bubble through the **Rectify component tree**, not the DOM tree. An `onClick` handler on the portal's logical parent will still fire even though the portal's DOM node is somewhere else in the document.

## Notes

- `container` must be a live DOM element when the component renders. If you create the element dynamically, make sure it is appended to the document first.
- Rectify sets up delegated event listeners on `container` automatically.
- Portals are cleaned up when the component that owns them unmounts.
