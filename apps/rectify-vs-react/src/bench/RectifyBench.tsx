import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "@rectify-dev/core";
import type { CSSProperties } from "@rectify-dev/core";
import type { BenchHandle, BenchOp, Row } from "./shared";
import { applyOp } from "./shared";

type Props = {
  onMount: (handle: BenchHandle) => void;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const panelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

const headingStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.9rem",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#89b4fa",
  background: "#181825",
  borderBottom: "1px solid #313244",
  flexShrink: 0,
};

const tableWrapStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.78rem",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.35rem 0.6rem",
  background: "#313244",
  borderBottom: "2px solid #45475a",
  fontWeight: 600,
  position: "sticky",
  top: 0,
};

const tdBaseStyle: CSSProperties = {
  padding: "0.3rem 0.6rem",
  borderBottom: "1px solid #181825",
};

const tdSelectedStyle: CSSProperties = {
  ...tdBaseStyle,
  color: "#a6e3a1",
  fontWeight: 600,
};

const countStyle: CSSProperties = {
  padding: "0.35rem 0.6rem",
  fontSize: "0.72rem",
  color: "#6c7086",
  borderTop: "1px solid #313244",
  flexShrink: 0,
};

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function RowItem({ row, selected }: { row: Row; selected: boolean }) {
  const trStyle: CSSProperties = {
    background: selected ? "#2a2a3e" : "transparent",
  };
  return (
    <tr style={trStyle}>
      <td style={tdBaseStyle}>{row.id}</td>
      <td style={selected ? tdSelectedStyle : tdBaseStyle}>{row.label}</td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type State = { rows: Row[]; selected: number | null };

export function RectifyBench({ onMount }: Props) {
  const [state, setState] = useState<State>({ rows: [], selected: null });

  // Holds the in-flight measurement so useLayoutEffect can resolve it.
  const pendingRef = useRef<{ t0: number; resolve: (ms: number) => void } | null>(null);

  // Fires synchronously after every DOM commit.
  // If a benchmark run triggered this render, resolve the promise here.
  useLayoutEffect(() => {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    // One rAF so the browser has painted before we report the time.
    requestAnimationFrame(() => p.resolve(performance.now() - p.t0));
  });

  const run = useCallback(
    (op: BenchOp) =>
      new Promise<number>((resolve) => {
        pendingRef.current = { t0: performance.now(), resolve };
        setState((prev) => applyOp(op, prev));
      }),
    []
  );

  useEffect(() => {
    onMount({ run });
  }, [onMount, run]);

  return (
    <div style={panelStyle}>
      <div style={headingStyle}>Rectify</div>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Label</th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row) => (
              <RowItem
                key={row.id}
                row={row}
                selected={state.selected === row.id}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div style={countStyle}>{state.rows.length} rows</div>
    </div>
  );
}
