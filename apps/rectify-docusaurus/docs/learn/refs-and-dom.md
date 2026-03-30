---
id: refs-and-dom
title: Refs and the DOM
sidebar_position: 21
slug: /learn/refs-and-dom
---

# Refs and the DOM

Refs give you direct access to DOM nodes or mutable values that don't affect rendering. See [`useRef`](/learn/use-ref) for the hook guide. This page covers callback refs and the `ref` prop in depth.

## Object refs (`useRef`)

```tsx
const ref = useRef<HTMLInputElement>();
<input ref={ref} />
// Later: ref.current.focus();
```

## Callback refs

Pass a function to `ref`. Rectify calls it with the DOM node on mount, and with `null` (or calls the returned cleanup) on unmount.

```tsx
function LogMount() {
  const logRef = (node: HTMLDivElement | null) => {
    if (node) console.log("mounted", node);
    else      console.log("unmounted");
  };

  return <div ref={logRef} />;
}
```

### Cleanup-returning callback refs

Return a function from a callback ref to handle teardown (e.g., cancel an observer):

```tsx
function ObservedBox() {
  const refCallback = (node: HTMLElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      console.log("visible:", entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect(); // called on unmount
  };

  return <div ref={refCallback} style={{ height: 100 }} />;
}
```

## Forwarding refs

Rectify does not have `forwardRef`. Instead, pass a ref via an explicit prop:

```tsx
type InputProps = {
  inputRef?: { current: HTMLInputElement | undefined };
  placeholder?: string;
};

function FancyInput({ inputRef, placeholder }: InputProps) {
  return (
    <input
      ref={inputRef}
      className="fancy-input"
      placeholder={placeholder}
    />
  );
}

// Parent
function Form() {
  const ref = useRef<HTMLInputElement>();

  useEffect(() => ref.current?.focus(), []);

  return <FancyInput inputRef={ref} placeholder="Type here…" />;
}
```

## Why refs don't cause re-renders

Refs are plain mutable objects stored in a hook slot. Rectify does not track reads or writes to `.current`. This is intentional — use `useState` if you want the UI to react to a value change.

```tsx
const countRef = useRef(0);

const increment = () => {
  countRef.current++; // ← does NOT trigger re-render
  console.log(countRef.current);
};
```
