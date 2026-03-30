---
id: function-components
title: Function Components
sidebar_position: 4
slug: /learn/function-components
---

# Function Components

Function components are the primary way to build UI in Rectify. A function component is a plain JavaScript function that accepts a `props` object and returns JSX.

## Basic example

```tsx
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="Rectify" />
```

## Props

Props are passed as named attributes in JSX and received as an object parameter:

```tsx
type CardProps = {
  title: string;
  description: string;
  variant?: "default" | "highlight";
};

function Card({ title, description, variant = "default" }: CardProps) {
  return (
    <div className={`card card--${variant}`}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
```

## Children

Children are passed via the `children` prop. Rectify accepts any `RectifyNode` (string, number, element, array, `null`, `undefined`, `boolean`):

```tsx
function Panel({ children, title }: { children: any; title: string }) {
  return (
    <section>
      <header><h3>{title}</h3></header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

// Usage
<Panel title="My Panel">
  <p>Any content goes here.</p>
</Panel>
```

## Returning null

Return `null` to render nothing:

```tsx
function ConditionalBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="banner">Important notice!</div>;
}
```

## Arrow functions

Arrow function syntax works equally well:

```tsx
const Badge = ({ label, color }: { label: string; color: string }) => (
  <span style={{ background: color }} className="badge">
    {label}
  </span>
);
```

## Multiple return formats

```tsx
function List({ items }: { items: string[] }) {
  // Return an array (each item needs a key)
  return items.map((item, i) => <li key={i}>{item}</li>);
}
```

:::tip
Function components are re-executed every time their state or props change. Keep them pure — avoid side effects directly in the body. Use [`useEffect`](/learn/use-effect) for side effects.
:::
