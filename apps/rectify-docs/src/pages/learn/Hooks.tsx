import { Callout } from "../../components/Callout";
import { CodeBlock } from "../../components/CodeBlock";
import { Link } from "@rectify-dev/router";

export function LearnHooks() {
  return (
    <>
      <h1>Hooks</h1>
      <p>
        Hooks let you use state and other features inside function components.
        All hooks are imported from <code>@rectify-dev/core</code>.
      </p>

      <Callout type="pitfall" title="Rules of Hooks">
        Only call hooks at the <strong>top level</strong> of a component — never
        inside loops, conditions, or nested functions.
      </Callout>

      <h2>useState</h2>
      <p>Adds reactive state to a function component:</p>
      <CodeBlock
        lang="tsx"
        code={`import { useState } from "@rectify-dev/core";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Functional update — safe when new state depends on old
const increment = () => setCount((prev) => prev + 1);`}
      />

      <h2>useEffect</h2>
      <p>Run side-effects after the component renders (subscriptions, data fetching, timers):</p>
      <CodeBlock
        lang="tsx"
        code={`import { useState, useEffect } from "@rectify-dev/core";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id); // cleanup on unmount
  }, []); // empty deps = run once on mount

  return <p>Elapsed: {seconds}s</p>;
}`}
      />

      <h2>useRef</h2>
      <p>
        Returns a mutable object whose <code>.current</code> persists across renders
        without causing re-renders. Useful for DOM references and storing values:
      </p>
      <CodeBlock
        lang="tsx"
        code={`import { useRef, useEffect } from "@rectify-dev/core";

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="I'm focused!" />;
}`}
      />

      <h2>useMemo</h2>
      <p>Memoize an expensive computation so it only re-runs when dependencies change:</p>
      <CodeBlock
        lang="tsx"
        code={`import { useState, useMemo } from "@rectify-dev/core";

function SortedList({ items }: { items: number[] }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a - b),
    [items], // recompute only when items changes
  );

  return <ul>{sorted.map((n) => <li key={n}>{n}</li>)}</ul>;
}`}
      />

      <h2>useCallback</h2>
      <p>Memoize a callback function to keep its reference stable across renders:</p>
      <CodeBlock
        lang="tsx"
        code={`import { useCallback, useState } from "@rectify-dev/core";

function Parent() {
  const [count, setCount] = useState(0);

  // This function reference is stable — Child won't re-render unnecessarily
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return <Child onClick={handleClick} />;
}`}
      />

      <h2>createContext + useContext</h2>
      <p>Share values across the component tree without prop drilling:</p>
      <CodeBlock
        lang="tsx"
        code={`import { createContext, useContext, useState } from "@rectify-dev/core";

type Theme = "light" | "dark";
const ThemeCtx = createContext<Theme>("light");

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  return (
    <ThemeCtx value={theme}>
      <Page />
      <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
        Toggle theme
      </button>
    </ThemeCtx>
  );
}

function Page() {
  const theme = useContext(ThemeCtx);
  return <div className={theme}>Current theme: {theme}</div>;
}`}
      />

      <div className="mt-10 flex gap-4">
        <Link
          to="/learn/components"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/[0.08] no-underline hover:no-underline"
        >
          ← Components
        </Link>
        <Link
          to="/learn/routing"
          className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline hover:no-underline"
        >
          Next: Routing →
        </Link>
      </div>
    </>
  );
}
