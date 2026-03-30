import { CodeBlock } from "../../components/CodeBlock";
import { ApiDoc } from "../../components/ApiDoc";
import { Link } from "@rectify-dev/router";

export function CoreApi() {
  return (
    <>
      <h1>Core API</h1>
      <p>
        Everything below is exported from <code>@rectify-dev/core</code>.
        Import only what you need — the package is fully tree-shakeable.
      </p>

      <CodeBlock lang="ts" code={`import {
  createRoot,
  Component,
  useState, useEffect, useRef,
  useMemo, useCallback, useContext,
  useId, createContext,
  memo, lazy, Suspense, Fragment,
} from "@rectify-dev/core";`} />

      <hr style={{ borderColor: "rgba(255,255,255,0.07)", margin: "2.5rem 0" }} />

      <h2>createRoot</h2>
      <ApiDoc
        name="createRoot"
        signature={`createRoot(container: Element | null): RootHandle`}
        description="Creates a Rectify root attached to a DOM container. Call .render() to mount your component tree."
        params={[
          { name: "container", type: "Element | null", description: "The DOM node to mount into." },
        ]}
        returns="A RootHandle with render() and unmount() methods."
        example={`const root = createRoot(document.getElementById("app")!);
root.render(<App />);

// Cleanup
root.unmount();`}
      />

      <h2>Component</h2>
      <ApiDoc
        name="Component"
        signature={`class Component<P = {}, S = {}>`}
        description="Base class for class components. Override render() to return JSX. Use this.state and this.setState() for state management."
        params={[
          { name: "P", type: "type parameter", description: "Props type." },
          { name: "S", type: "type parameter", description: "State type." },
        ]}
        returns="A class component base."
        example={`class Clock extends Component<{}, { time: string }> {
  private timer: number | undefined;

  state = { time: new Date().toLocaleTimeString() };

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ time: new Date().toLocaleTimeString() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return <p>Time: {this.state.time}</p>;
  }
}`}
      />

      <h2>useState</h2>
      <ApiDoc
        name="useState"
        signature={`useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]`}
        description="Returns a stateful value and a function to update it. Triggers a re-render when called."
        params={[
          { name: "initialState", type: "S | () => S", description: "Initial value or an initializer function (runs only once on mount)." },
        ]}
        returns="A tuple [state, setState]."
        example={`const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// Functional update
setCount(prev => prev + 1);`}
      />

      <h2>useEffect</h2>
      <ApiDoc
        name="useEffect"
        signature={`useEffect(effect: () => void | (() => void), deps?: unknown[]): void`}
        description="Runs a side-effect after render. Returns an optional cleanup function called before the next effect or on unmount."
        params={[
          { name: "effect", type: "() => void | (() => void)", description: "The effect to run. Return a cleanup function to run on teardown." },
          { name: "deps", type: "unknown[]", description: "Optional dependency array. The effect re-runs only when dependencies change. Omit to run after every render." },
        ]}
        returns="void"
        example={`useEffect(() => {
  const ac = new AbortController();
  fetch("/api/data", { signal: ac.signal })
    .then(r => r.json())
    .then(setData);
  return () => ac.abort();
}, []);`}
      />

      <h2>useRef</h2>
      <ApiDoc
        name="useRef"
        signature={`useRef<T>(initialValue?: T): RefObject<T>`}
        description="Returns a mutable ref object whose .current property is initialized to initialValue. Does not cause re-renders when changed."
        params={[
          { name: "initialValue", type: "T", description: "Initial value of ref.current." },
        ]}
        returns="RefObject<T> — { current: T | null }"
        example={`const inputRef = useRef<HTMLInputElement | null>(null);
const countRef  = useRef(0); // persists across renders without re-rendering

// Attach to DOM element
<input ref={inputRef} />
inputRef.current?.focus();`}
      />

      <h2>useMemo</h2>
      <ApiDoc
        name="useMemo"
        signature={`useMemo<T>(factory: () => T, deps: unknown[]): T`}
        description="Memoizes the result of factory(). Recomputes only when dependencies change."
        params={[
          { name: "factory", type: "() => T", description: "Function that computes the memoized value." },
          { name: "deps", type: "unknown[]", description: "Dependency array." },
        ]}
        returns="The memoized value T."
        example={`const filtered = useMemo(
  () => items.filter(i => i.active),
  [items],
);`}
      />

      <h2>useCallback</h2>
      <ApiDoc
        name="useCallback"
        signature={`useCallback<T extends (...args: any[]) => any>(fn: T, deps: unknown[]): T`}
        description="Returns a memoized version of fn. Useful for passing stable callbacks to child components."
        params={[
          { name: "fn", type: "T", description: "The function to memoize." },
          { name: "deps", type: "unknown[]", description: "Dependency array. Provide [] for a function that never changes." },
        ]}
        returns="Memoized version of fn."
        example={`const handleSubmit = useCallback((e: Event) => {
  e.preventDefault();
  submit(formData);
}, [formData]);`}
      />

      <h2>createContext / useContext</h2>
      <ApiDoc
        name="createContext"
        signature={`createContext<T>(defaultValue: T): Context<T>`}
        description="Creates a context object. Use Context.value={v} to provide a value, and useContext(ctx) to consume it."
        params={[
          { name: "defaultValue", type: "T", description: "Value used when there is no matching provider above." },
        ]}
        returns="Context<T>"
        example={`const ThemeCtx = createContext<"light" | "dark">("light");

// Provider
<ThemeCtx value="dark"><App /></ThemeCtx>

// Consumer
const theme = useContext(ThemeCtx);`}
      />

      <h2>memo</h2>
      <ApiDoc
        name="memo"
        signature={`memo<P extends object>(component: FC<P>, propsAreEqual?: (prev: P, next: P) => boolean): FC<P>`}
        description="Wraps a component to skip re-renders when props are shallowly equal."
        params={[
          { name: "component", type: "FC<P>", description: "The function component to memoize." },
          { name: "propsAreEqual", type: "(prev, next) => boolean", description: "Optional custom comparison. Defaults to shallow equality." },
        ]}
        returns="A memoized component."
        example={`const Row = memo(function Row({ value }: { value: string }) {
  return <li>{value}</li>;
});`}
      />

      <h2>lazy + Suspense</h2>
      <ApiDoc
        name="lazy"
        signature={`lazy<T extends FC<any>>(loader: () => Promise<{ default: T }>): T`}
        description="Lazily loads a component. Pair with Suspense to show a fallback while loading."
        params={[
          { name: "loader", type: "() => Promise<{ default: T }>", description: "Dynamic import that resolves to a module with a default export." },
        ]}
        returns="A lazy component T."
        example={`const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <Suspense fallback={<p>Loading chart…</p>}>
      <HeavyChart />
    </Suspense>
  );
}`}
      />

      <div className="mt-10 flex gap-4">
        <Link
          to="/learn/routing"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/[0.08] no-underline hover:no-underline"
        >
          ← Routing Guide
        </Link>
        <Link
          to="/api/router"
          className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline hover:no-underline"
        >
          Next: Router API →
        </Link>
      </div>
    </>
  );
}
