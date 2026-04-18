import { useState, useRef, useCallback } from "@rectify-dev/core";
import type { CSSProperties } from "@rectify-dev/core";
import { RectifyBench } from "./bench/RectifyBench";
import { mountReact } from "./bench/ReactBench.react";
import type { BenchHandle, BenchOp, BenchResult } from "./bench/shared";
import { BENCHMARK_OPS, OP_LABELS } from "./bench/shared";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const rootStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  padding: "0.75rem 1.25rem",
  background: "#181825",
  borderBottom: "1px solid #313244",
  flexShrink: 0,
};

const h1Style: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#cdd6f4",
  letterSpacing: "0.02em",
};

const subtitleStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#6c7086",
  marginTop: "0.2rem",
};

const controlsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  padding: "0.75rem 1.25rem",
  background: "#1e1e2e",
  borderBottom: "1px solid #313244",
  flexShrink: 0,
};

const btnBase: CSSProperties = {
  padding: "0.4rem 0.85rem",
  fontSize: "0.8rem",
  cursor: "pointer",
  borderRadius: 5,
  border: "1px solid #45475a",
  background: "#313244",
  color: "#cdd6f4",
  fontFamily: "inherit",
};

const btnRunAllStyle: CSSProperties = {
  ...btnBase,
  background: "#89b4fa",
  color: "#1e1e2e",
  fontWeight: 700,
  border: "none",
};

const btnDisabledStyle: CSSProperties = {
  ...btnBase,
  opacity: 0.45,
  cursor: "not-allowed",
};

const mainStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const resultsWrapStyle: CSSProperties = {
  padding: "0.75rem 1.25rem",
  background: "#181825",
  borderBottom: "1px solid #313244",
  flexShrink: 0,
  maxHeight: "40vh",
  overflowY: "auto",
};

const resultsTitleStyle: CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#6c7086",
  marginBottom: "0.5rem",
};

const resultsTableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.8rem",
};

const rthStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.35rem 0.6rem",
  fontWeight: 600,
  borderBottom: "1px solid #313244",
  color: "#a6adc8",
};

const rtdStyle: CSSProperties = {
  padding: "0.35rem 0.6rem",
  borderBottom: "1px solid #2a2a3e",
};

const rtdFasterStyle: CSSProperties = {
  ...rtdStyle,
  color: "#a6e3a1",
  fontWeight: 700,
};

const panelsStyle: CSSProperties = {
  flex: 1,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 0,
  overflow: "hidden",
};

const panelWrapStyle: CSSProperties = {
  overflow: "hidden",
  borderRight: "1px solid #313244",
};

// ---------------------------------------------------------------------------
// Winner helper
// ---------------------------------------------------------------------------

function getWinner(r: BenchResult): string {
  const diff = r.rectifyMs - r.reactMs;
  const ratio = Math.max(r.rectifyMs, r.reactMs) / Math.min(r.rectifyMs, r.reactMs);
  const pct = ((Math.abs(diff) / Math.max(r.reactMs, r.rectifyMs)) * 100).toFixed(0);
  if (Math.abs(diff) < 2) return "tie";
  return diff < 0
    ? `Rectify (${ratio.toFixed(1)}x, ${pct}% faster)`
    : `React (${ratio.toFixed(1)}x, ${pct}% faster)`;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const [results, setResults] = useState<BenchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);

  const rectifyHandle = useRef<BenchHandle | null>(null);
  const reactHandle = useRef<BenchHandle | null>(null);

  const checkReady = useCallback(() => {
    if (rectifyHandle.current && reactHandle.current) {
      setReady(true);
    }
  }, []);

  const handleRectifyMount = useCallback(
    (h: BenchHandle) => {
      rectifyHandle.current = h;
      checkReady();
    },
    [checkReady]
  );

  // Callback ref: called synchronously by Rectify's commit phase once the
  // container div is in the DOM — no useEffect timing issues.
  const setReactContainer = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      mountReact(el, (h) => {
        reactHandle.current = h;
        checkReady();
      });
    },
    [checkReady]
  );

  const upsertResult = useCallback((entry: BenchResult) => {
    setResults((prev) => {
      const idx = prev.findIndex((r) => r.op === entry.op);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const runOne = useCallback(
    async (op: BenchOp) => {
      if (!rectifyHandle.current || !reactHandle.current) return;
      setRunning(true);
      const rectifyMs = await rectifyHandle.current.run(op);
      // Brief pause so the browser can settle between the two renders
      await new Promise<void>((r) => setTimeout(r, 150));
      const reactMs = await reactHandle.current.run(op);
      upsertResult({ op, label: OP_LABELS[op], rectifyMs, reactMs });
      setRunning(false);
    },
    [upsertResult]
  );

  const runAll = useCallback(async () => {
    if (!rectifyHandle.current || !reactHandle.current) return;
    setRunning(true);
    for (const op of BENCHMARK_OPS) {
      const rectifyMs = await rectifyHandle.current.run(op);
      await new Promise<void>((r) => setTimeout(r, 150));
      const reactMs = await reactHandle.current.run(op);
      upsertResult({ op, label: OP_LABELS[op], rectifyMs, reactMs });
      await new Promise<void>((r) => setTimeout(r, 50));
    }
    setRunning(false);
  }, [upsertResult]);

  const isDisabled = running || !ready;

  return (
    <div style={rootStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={h1Style}>Rectify vs React — Performance Benchmark</div>
        <div style={subtitleStyle}>
          {ready ? "Ready — click an operation to measure render time" : "Initialising…"}
        </div>
      </header>

      {/* Controls */}
      <div style={controlsStyle}>
        {BENCHMARK_OPS.map((op) => (
          <button
            key={op}
            style={isDisabled ? btnDisabledStyle : btnBase}
            disabled={isDisabled}
            onClick={() => runOne(op)}
          >
            {OP_LABELS[op]}
          </button>
        ))}
        <button
          style={isDisabled ? { ...btnRunAllStyle, opacity: 0.45, cursor: "not-allowed" } : btnRunAllStyle}
          disabled={isDisabled}
          onClick={runAll}
        >
          {running ? "Running…" : "Run All"}
        </button>
      </div>

      <div style={mainStyle}>
        {/* Results table */}
        {results.length > 0 && (
          <div style={resultsWrapStyle}>
            <div style={resultsTitleStyle}>Results (ms — lower is better)</div>
            <table style={resultsTableStyle}>
              <thead>
                <tr>
                  <th style={rthStyle}>Operation</th>
                  <th style={{ ...rthStyle, color: "#89b4fa" }}>Rectify</th>
                  <th style={{ ...rthStyle, color: "#cba6f7" }}>React</th>
                  <th style={rthStyle}>Winner</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const rectifyFaster = r.rectifyMs < r.reactMs;
                  const reactFaster = r.reactMs < r.rectifyMs;
                  const isTie = Math.abs(r.rectifyMs - r.reactMs) < 2;
                  return (
                    <tr key={r.op}>
                      <td style={rtdStyle}>{r.label}</td>
                      <td style={!isTie && rectifyFaster ? rtdFasterStyle : rtdStyle}>
                        {r.rectifyMs.toFixed(1)} ms
                      </td>
                      <td style={!isTie && reactFaster ? rtdFasterStyle : rtdStyle}>
                        {r.reactMs.toFixed(1)} ms
                      </td>
                      <td style={{ ...rtdStyle, color: "#a6adc8", fontSize: "0.75rem" }}>
                        {getWinner(r)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Side-by-side render panels */}
        <div style={panelsStyle}>
          <div style={panelWrapStyle}>
            <RectifyBench onMount={handleRectifyMount} />
          </div>
          <div style={{ overflow: "hidden", height: "100%" }} ref={setReactContainer} />
        </div>
      </div>
    </div>
  );
}
