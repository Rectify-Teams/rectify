// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Row = { id: number; label: string };

export type BenchState = { rows: Row[]; selected: number | null };

export type BenchOp =
  | "create1000"
  | "create10000"
  | "replace"
  | "update"
  | "select"
  | "swap"
  | "append1000"
  | "remove"
  | "clear";

export type BenchHandle = {
  run: (op: BenchOp) => Promise<number>;
};

export type BenchResult = {
  op: BenchOp;
  label: string;
  rectifyMs: number;
  reactMs: number;
};

// ---------------------------------------------------------------------------
// Operation metadata
// ---------------------------------------------------------------------------

export const BENCHMARK_OPS: BenchOp[] = [
  "create1000",
  "create10000",
  "replace",
  "update",
  "select",
  "swap",
  "append1000",
  "remove",
  "clear",
];

export const OP_LABELS: Record<BenchOp, string> = {
  create1000: "Create 1,000 rows",
  create10000: "Create 10,000 rows",
  replace: "Replace all rows",
  update: "Update every 10th row",
  select: "Select a row",
  swap: "Swap rows",
  append1000: "Append 1,000 rows",
  remove: "Remove a row",
  clear: "Clear all rows",
};

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

let _id = 1;

const adjectives = [
  "pretty", "large", "big", "small", "tall", "short", "long", "handsome",
  "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful",
  "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy",
];

const colours = [
  "red", "yellow", "blue", "green", "pink", "brown", "purple",
  "white", "black", "orange",
];

const nouns = [
  "table", "chair", "house", "bbq", "desk", "car", "pony", "cookie",
  "sandwich", "burger", "pizza", "mouse", "keyboard",
];

const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const buildRows = (n: number): Row[] =>
  Array.from({ length: n }, () => ({
    id: _id++,
    label: `${rand(adjectives)} ${rand(colours)} ${rand(nouns)}`,
  }));

// ---------------------------------------------------------------------------
// State reducer
// ---------------------------------------------------------------------------

export function applyOp(op: BenchOp, state: BenchState): BenchState {
  switch (op) {
    case "create1000":
      return { rows: buildRows(1000), selected: null };

    case "create10000":
      return { rows: buildRows(10000), selected: null };

    case "replace":
      return { rows: buildRows(1000), selected: null };

    case "update": {
      const rows = state.rows.map((r, i) =>
        i % 10 === 0 ? { ...r, label: r.label + " !!!" } : r
      );
      return { rows, selected: state.selected };
    }

    case "select":
      return { rows: state.rows, selected: state.rows[4]?.id ?? null };

    case "swap": {
      if (state.rows.length < 2) return state;
      const rows = [...state.rows];
      const tmp = rows[1];
      rows[1] = rows[rows.length - 1];
      rows[rows.length - 1] = tmp;
      return { rows, selected: state.selected };
    }

    case "append1000":
      return { rows: [...state.rows, ...buildRows(1000)], selected: state.selected };

    case "remove": {
      const idx = state.rows.length >= 5 ? 4 : 0;
      return { rows: state.rows.filter((_, i) => i !== idx), selected: state.selected };
    }

    case "clear":
      return { rows: [], selected: null };
  }
}
