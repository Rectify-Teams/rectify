---
id: class-components
title: Class Components
sidebar_position: 5
slug: /learn/class-components
---

# Class Components

Rectify supports class-based components via the `Component<P, S>` base class. Class components offer explicit lifecycle methods and are a good fit for code that manages complex state machines or needs `shouldComponentUpdate` for fine-tuned performance control.

## Basic structure

```tsx
import { Component } from "@rectify-dev/core";

type Props = { initialCount: number };
type State = { count: number };

class Counter extends Component<Props, State> {
  state: State = { count: this.props.initialCount };

  increment = () => {
    this.setState((prev) => ({ count: prev.count + 1 }));
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

## State

Use `this.state` and `this.setState()` for component-level state.

```tsx
class Toggle extends Component<{}, { on: boolean }> {
  state = { on: false };

  toggle = () => this.setState((s) => ({ on: !s.on }));

  render() {
    return (
      <button onClick={this.toggle}>
        {this.state.on ? "ON" : "OFF"}
      </button>
    );
  }
}
```

### `setState` signatures

```ts
// Partial state object
this.setState({ count: 5 });

// Updater function — safe when new state depends on previous state
this.setState((prevState, prevProps) => ({
  count: prevState.count + prevProps.step,
}));
```

:::caution
`setState` is asynchronous. The new state is not available immediately after the call. Read from `this.state` inside `componentDidUpdate` for the latest values.
:::

## Lifecycle methods

### `componentDidMount`

Called once after the component is first inserted into the DOM. Ideal for data fetching and subscriptions.

```tsx
class DataFetcher extends Component<{ url: string }, { data: any }> {
  state = { data: null };

  async componentDidMount() {
    const res = await fetch(this.props.url);
    const data = await res.json();
    this.setState({ data });
  }

  render() {
    if (!this.state.data) return <p>Loading…</p>;
    return <pre>{JSON.stringify(this.state.data, null, 2)}</pre>;
  }
}
```

### `componentDidUpdate`

Called after every re-render, receiving the **previous** props and state.

```tsx
componentDidUpdate(prevProps: Props, prevState: State) {
  if (prevProps.userId !== this.props.userId) {
    // User changed — re-fetch data
    this.fetchUser(this.props.userId);
  }
}
```

### `componentWillUnmount`

Called immediately before the component is removed from the DOM. Clean up subscriptions, timers, etc.

```tsx
class Tracker extends Component {
  private timerId: number | null = null;

  componentDidMount() {
    this.timerId = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    if (this.timerId !== null) clearInterval(this.timerId);
  }

  tick = () => { /* ... */ };

  render() { return <div />; }
}
```

### `shouldComponentUpdate`

Return `false` to prevent a re-render. Defaults to `true`. Use this for performance optimization when you can guarantee the output won't differ.

```tsx
shouldComponentUpdate(nextProps: Props, nextState: State) {
  return (
    nextProps.value !== this.props.value ||
    nextState.expanded !== this.state.expanded
  );
}
```

:::tip
For function components, the equivalent of `shouldComponentUpdate` is [`memo()`](/learn/memo) with a custom comparator.
:::

## Full lifecycle example

```tsx
import { Component } from "@rectify-dev/core";

type Props = { topic: string };
type State = { posts: string[]; loading: boolean };

class PostList extends Component<Props, State> {
  state: State = { posts: [], loading: true };

  async componentDidMount() {
    await this.fetchPosts(this.props.topic);
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.topic !== this.props.topic) {
      this.setState({ loading: true });
      await this.fetchPosts(this.props.topic);
    }
  }

  componentWillUnmount() {
    // Cancel any in-flight requests here
  }

  async fetchPosts(topic: string) {
    const res = await fetch(`/api/posts?topic=${topic}`);
    const posts = await res.json();
    this.setState({ posts, loading: false });
  }

  render() {
    const { loading, posts } = this.state;
    if (loading) return <p>Loading posts…</p>;
    return (
      <ul>
        {posts.map((p) => <li key={p}>{p}</li>)}
      </ul>
    );
  }
}
```

## When to use class vs function components

| Situation | Recommendation |
|-----------|----------------|
| New code | Function component + hooks |
| Complex lifecycle orchestration | Class component |
| `shouldComponentUpdate` for perf | Class component or `memo()` on function |
| Integrating legacy code | Class component |
