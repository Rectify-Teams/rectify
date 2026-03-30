import { Callout } from "../../components/Callout";
import { CodeBlock } from "../../components/CodeBlock";
import { Link } from "@rectify-dev/router";

export function LearnComponents() {
  return (
    <>
      <h1>Components</h1>
      <p>
        Components are the building blocks of a Rectify app. A component is a function
        (or class) that accepts <strong>props</strong> and returns <strong>JSX</strong>.
      </p>

      <h2>Function components</h2>
      <p>
        The simplest way to write a component. Any function that returns JSX is a valid component:
      </p>
      <CodeBlock
        lang="tsx"
        code={`function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="Alice" />`}
      />

      <h2>Props</h2>
      <p>Props are read-only inputs passed to a component. Define their shape with a TypeScript type:</p>
      <CodeBlock
        lang="tsx"
        code={`type ButtonProps = {
  label: string;
  variant?: "primary" | "ghost";
  onClick: () => void;
};

function Button({ label, variant = "primary", onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  );
}`}
      />

      <h2>Children</h2>
      <CodeBlock
        lang="tsx"
        code={`import type { RectifyNode } from "@rectify-dev/core";

type CardProps = { children: RectifyNode };

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <p>Content goes here</p>
</Card>`}
      />

      <h2>Class components</h2>
      <p>
        For components that need lifecycle methods, extend <code>Component&lt;Props, State&gt;</code>:
      </p>
      <CodeBlock
        lang="tsx"
        code={`import { Component } from "@rectify-dev/core";

type State = { count: number };

class Counter extends Component<{}, State> {
  state = { count: 0 };

  componentDidMount() {
    console.log("mounted");
  }

  componentWillUnmount() {
    console.log("unmounted");
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        Clicked {this.state.count} times
      </button>
    );
  }
}`}
      />

      <h2>Conditional rendering</h2>
      <CodeBlock
        lang="tsx"
        code={`function Status({ isOnline }: { isOnline: boolean }) {
  return (
    <span>
      {isOnline ? "🟢 Online" : "🔴 Offline"}
    </span>
  );
}`}
      />

      <h2>Rendering lists</h2>
      <CodeBlock
        lang="tsx"
        code={`const fruits = ["Apple", "Banana", "Cherry"];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}`}
      />

      <Callout type="warning" title="Always provide a key">
        When rendering lists, each item must have a unique stable <code>key</code> prop
        so the reconciler can track elements across re-renders.
      </Callout>

      <h2>Fragments</h2>
      <p>Return multiple elements without a wrapper node using <code>Fragment</code>:</p>
      <CodeBlock
        lang="tsx"
        code={`import { Fragment } from "@rectify-dev/core";

function Meta() {
  return (
    <Fragment>
      <title>My Page</title>
      <meta name="description" content="My page description" />
    </Fragment>
  );
}

// Short syntax
function Meta2() {
  return (
    <>
      <title>My Page</title>
      <meta name="description" content="My page description" />
    </>
  );
}`}
      />

      <div className="mt-10 flex gap-4">
        <Link
          to="/learn/installation"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/[0.08] no-underline hover:no-underline"
        >
          ← Installation
        </Link>
        <Link
          to="/learn/hooks"
          className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline hover:no-underline"
        >
          Next: Hooks →
        </Link>
      </div>
    </>
  );
}
