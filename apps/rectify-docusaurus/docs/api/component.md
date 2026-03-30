---
id: component
title: Component
sidebar_position: 4
slug: /api/component
---

# `Component<P, S>`

```ts
class Component<P = {}, S = {}> {
  props: P;
  state: S;

  setState(partialState: Partial<S> | ((prev: S, prevProps: P) => Partial<S>)): void;
  render(): RectifyNode;

  // Optional lifecycle methods
  componentDidMount?(): void;
  componentDidUpdate?(prevProps: P, prevState: S): void;
  componentWillUnmount?(): void;
  shouldComponentUpdate?(nextProps: P, nextState: S): boolean;

  static readonly _isClassComponent: true;
}
```

Base class for class components. See [Class Components](/learn/class-components) for the full guide.

## `setState`

| Signature | Description |
|-----------|-------------|
| `setState(partialState: Partial<S>)` | Merges partial state. The rest of the state is preserved. |
| `setState((prev, prevProps) => Partial<S>)` | Updater function. Safe when new state depends on previous state. |

## Lifecycle order

```
constructor / field initializers
  ↓
render()
  ↓
componentDidMount()     ← after first DOM commit
  ↓
[state/props change]
  ↓
shouldComponentUpdate() ← return false to bail
  ↓
render()
  ↓
componentDidUpdate(prevProps, prevState)
  ↓
[unmount]
  ↓
componentWillUnmount()
```

## TypeScript example

```tsx
import { Component } from "@rectify-dev/core";

type Props = { title: string };
type State = { open: boolean };

class Accordion extends Component<Props, State> {
  state: State = { open: false };

  toggle = () => this.setState((s) => ({ open: !s.open }));

  render() {
    return (
      <div>
        <button onClick={this.toggle}>{this.props.title}</button>
        {this.state.open && <div>Content</div>}
      </div>
    );
  }
}
```
