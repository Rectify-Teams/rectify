---
id: portals
title: Portals
sidebar_position: 5
slug: /learn/portals
---

# Portals

A portal lets you render part of your component tree into a different DOM node while keeping it fully connected to Rectify's virtual tree. Context, state, and events all work as if the content were rendered at its original position.

## The problem portals solve

Certain UI elements — modals, tooltips, dropdown menus — must appear above everything else on the page. The natural way to achieve this is to render them as a direct child of `document.body`, but doing so from a deeply nested component is awkward with plain DOM APIs.

At the same time, these elements logically _belong_ to the component that spawns them. They need the same props, context, and event handlers.

Portals solve both needs at once.

## Basic usage

```tsx
import { createPortal } from "@rectify-dev/core";

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body,
  );
}
```

`createPortal` returns a `RectifyPortal` that can be returned from any render function, just like a regular element.

## Context works through portals

Even though the portal's DOM node lives in `document.body`, it is still a descendant in the **Rectify tree**. Any context provided above it is available inside:

```tsx
const ThemeContext = createContext<"light" | "dark">("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  return (
    <main>
      <h1>Hello</h1>
      <ThemedModal />
    </main>
  );
}

function ThemedModal() {
  const theme = useContext(ThemeContext); // "dark"

  return createPortal(
    <div className={`modal modal--${theme}`}>I'm themed!</div>,
    document.body,
  );
}
```

## Events bubble through the Rectify tree

Synthetic events fired inside a portal bubble through the component tree rather than the DOM tree. A click handler on a portal's logical ancestor will fire even if the portal's DOM node is elsewhere in the document.

```tsx
function Page() {
  return (
    <div onClick={() => console.log("page clicked")}>
      <Modal />
    </div>
  );
}

function Modal() {
  // Clicking the button will log "page clicked" because the event
  // bubbles through the Rectify tree, not the DOM tree.
  return createPortal(
    <button onClick={() => console.log("button clicked")}>Click me</button>,
    document.body,
  );
}
```

## Dedicated portal containers

For performance or stacking-context reasons you may want a dedicated container instead of `document.body`:

```html title="index.html"
<div id="root"></div>
<div id="modal-root"></div>
```

```tsx title="src/App.tsx"
const modalRoot = document.getElementById("modal-root")!;

function Modal({ children }) {
  return createPortal(children, modalRoot);
}
```

## Conditionally rendering portals

A portal is just a value — conditionally return it like any other element:

```tsx
function Dialog({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
  );
}
```

```tsx
function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <Dialog isOpen={open} onClose={() => setOpen(false)} title="Hello">
        <p>This renders in document.body.</p>
      </Dialog>
    </>
  );
}
```

## Multiple portals and keys

When a single component renders more than one portal into the same container, pass a `key` to help the reconciler identify them across re-renders:

```tsx
function NotificationStack({ items }) {
  return items.map((item) =>
    createPortal(
      <Toast message={item.message} />,
      document.body,
      item.id, // key
    ),
  );
}
```

## Summary

| Feature | Behaviour |
|---------|-----------|
| DOM placement | Children appear inside the target `container` in the real DOM |
| Rectify tree | Portal children remain children of the component that created them |
| Context | Provided context flows through the portal as normal |
| Event bubbling | Synthetic events bubble through the Rectify tree, not the DOM |
| Cleanup | Portal is unmounted when its owning component unmounts |

For the full API reference see [`createPortal`](/api/create-portal).
