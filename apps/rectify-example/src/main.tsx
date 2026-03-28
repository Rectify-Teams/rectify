import { createRoot, useReducer, useRef } from "@rectify-dev/core";
import styles from "./styles.module.css";

// ─── useReducer demo ──────────────────────────────────────────────────────────

type CounterAction = { type: "increment" } | { type: "decrement" } | { type: "reset" };

const counterReducer = (state: number, action: CounterAction): number => {
  switch (action.type) {
    case "increment": return state + 1;
    case "decrement": return state - 1;
    case "reset":     return 0;
  }
};

const Counter = () => {
  const [count, dispatch] = useReducer(counterReducer, 0);
  return (
    <div>
      <h2>useReducer counter: {count}</h2>
      <button onClick={() => dispatch({ type: "decrement" })}>−</button>
      <button onClick={() => dispatch({ type: "reset" })}>reset</button>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
    </div>
  );
};

// ─── useRef (object ref) demo ─────────────────────────────────────────────────

const FocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h2>useRef (object ref)</h2>
      <input ref={inputRef} placeholder="type something…" />
      <button onClick={() => (inputRef.current as HTMLInputElement | null)?.focus()}>
        focus input
      </button>
    </div>
  );
};

// ─── ref callback demo ────────────────────────────────────────────────────────

const MeasureBox = () => {
  const [size, dispatch] = useReducer(
    (_: string, next: string) => next,
    "—",
  );
  return (
    <div>
      <h2>ref callback + cleanup</h2>
      <div
        className={styles.box}
        ref={(node) => {
          if (node) {
            const el = node as HTMLDivElement;
            const { width, height } = el.getBoundingClientRect();
            dispatch(`${Math.round(width)} × ${Math.round(height)} px`);
          }
          return () => dispatch("—");
        }}
      >
        measured box
      </div>
      <p>Size: {size}</p>
    </div>
  );
};

// ─── root ─────────────────────────────────────────────────────────────────────

const App = () => (
  <div className={styles.app}>
    <h1 className={styles.red}>Rectify examples</h1>
    <Counter />
    <hr />
    <FocusInput />
    <hr />
    <MeasureBox />
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
