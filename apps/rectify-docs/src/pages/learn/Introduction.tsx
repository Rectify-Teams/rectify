import { Callout } from "../../components/Callout";
import { CodeBlock } from "../../components/CodeBlock";
import { Link } from "@rectify-dev/router";

export function Introduction() {
  return (
    <>
      <h1>Introduction</h1>
      <p>
        <strong style={{ color: "#a78bfa" }}>Rectify</strong> is a UI library built from scratch
        with a fiber-based reconciler, a full hooks system, class components, lazy loading,
        Suspense, and a first-class router — all with zero dependencies on React.
      </p>

      <Callout type="tip" title="Familiar API">
        If you already know React, you already know Rectify. The component model,
        hooks, and JSX transform are intentionally compatible.
      </Callout>

      <h2>What is a fiber reconciler?</h2>
      <p>
        When your state changes, Rectify doesn't re-render the entire DOM. Instead it builds a
        <strong> work-in-progress fiber tree</strong>, diffs it against the current tree, and only
        commits the minimal set of DOM mutations needed.
      </p>
      <p>
        This means updates are fast, predictable, and interruptible — the same architecture
        used by React internally.
      </p>

      <h2>Key features</h2>
      <ul>
        <li><strong>Function components</strong> — plain functions that return JSX.</li>
        <li><strong>Class components</strong> — extend <code>Component&lt;P, S&gt;</code> for full lifecycle control.</li>
        <li><strong>Hooks</strong> — useState, useEffect, useRef, useMemo, useCallback, useContext, useId.</li>
        <li><strong>Context</strong> — <code>createContext</code> + <code>useContext</code> for cross-tree state.</li>
        <li><strong>Lazy + Suspense</strong> — code-split components with graceful loading states.</li>
        <li><strong>Memo</strong> — skip re-renders with <code>memo()</code>.</li>
        <li><strong>Router</strong> — <code>@rectify-dev/router</code> for client-side navigation.</li>
        <li><strong>TypeScript</strong> — every API is fully typed.</li>
      </ul>

      <h2>Philosophy</h2>
      <p>
        Rectify exists to demystify how UI libraries work. Every file in the codebase
        is readable, documented, and purpose-built. There are no magic plugins,
        no hidden abstractions.
      </p>

      <Callout type="note">
        Rectify is <strong>not</strong> a drop-in replacement for React. While the API
        is intentionally similar, some edge-cases and ecosystem libraries may behave differently.
      </Callout>

      <h2>A quick taste</h2>
      <CodeBlock
        lang="tsx"
        filename="App.tsx"
        code={`import { useState } from "@rectify-dev/core";

function App() {
  const [name, setName] = useState("world");

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <input
        value={name}
        onInput={(e) => setName(e.target.value)}
      />
    </div>
  );
}`}
      />

      <div className="mt-10 flex gap-4">
        <Link
          to="/learn/installation"
          className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline hover:no-underline"
        >
          Next: Installation →
        </Link>
      </div>
    </>
  );
}
