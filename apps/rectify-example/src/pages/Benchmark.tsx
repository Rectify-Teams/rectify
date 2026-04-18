import { useState } from "@rectify-dev/core";

type Row = { id: number; label: string };

type AppState = {
  rows: Row[];
  selected: number | null;
};

let _id = 1;
const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const buildRows = (count: number): Row[] =>
  Array.from({ length: count }, () => ({
    id: _id++,
    label: `${rand(adjectives)} ${rand(colours)} ${rand(nouns)}`,
  }));

const containerStyle = {
  maxWidth: 600,
  margin: "0 auto",
};

const toolbarStyle = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  flexWrap: "wrap" as const,
};

const btnStyle = {
  padding: "0.45rem 1rem",
  fontSize: "0.875rem",
  cursor: "pointer",
  borderRadius: 4,
  border: "1px solid #45475a",
  background: "#313244",
  color: "#cdd6f4",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "0.875rem",
};

const tdStyle = {
  padding: "0.35rem 0.5rem",
  borderBottom: "1px solid #313244",
};

export function Benchmark() {
  const [state, setState] = useState<AppState>({ rows: [], selected: null });

  const select = (id: number) => setState({ ...state, selected: id });

  const swapRows = () => {
    if (state.rows.length < 2) return;
    const rows = [...state.rows];
    const tmp = rows[1];
    rows[1] = rows[rows.length - 1];
    rows[rows.length - 1] = tmp;
    setState({ ...state, rows });
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "0.75rem" }}>Benchmark</h2>
      <div style={toolbarStyle}>
        <button style={btnStyle} onClick={() => setState({ rows: buildRows(100), selected: null })}>
          Create 100 rows
        </button>
        <button style={btnStyle} onClick={() => setState({ rows: buildRows(1000), selected: null })}>
          Create 1,000 rows
        </button>
        <button style={btnStyle} onClick={() => setState({ rows: [...state.rows, ...buildRows(100)], selected: null })}>
          Append 100 rows
        </button>
        <button style={btnStyle} onClick={swapRows}>
          Swap rows
        </button>
        <button style={btnStyle} onClick={() => setState({ rows: [], selected: null })}>
          Clear
        </button>
      </div>
      <table style={tableStyle}>
        <tbody>
          {state.rows.map((row: Row) => (
            <tr
              key={row.id}
              style={{ background: state.selected === row.id ? "#45475a" : "transparent" }}
            >
              <td style={{ ...tdStyle, width: 60, color: "#6c7086" }}>{row.id}</td>
              <td style={tdStyle}>{row.label}</td>
              <td style={{ ...tdStyle, width: 40, textAlign: "center" }}>
                <button
                  style={{ ...btnStyle, padding: "0.2rem 0.5rem" }}
                  onClick={() => select(row.id)}
                >
                  ★
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {state.rows.length === 0 && (
        <p style={{ color: "#6c7086", marginTop: "1rem" }}>No rows. Click a button above to add some.</p>
      )}
    </div>
  );
}
