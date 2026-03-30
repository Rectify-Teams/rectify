import { Link } from "@rectify-dev/router";
import { CodeBlock } from "../components/CodeBlock";

const HERO_CODE = `import { createRoot, useState } from "@rectify-dev/core";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Counter />);`;

const FEATURES = [
  {
    icon: "⚡",
    title: "Fiber Reconciler",
    desc: "Built from the ground up with a fiber-based reconciler for predictable, interruptible rendering.",
  },
  {
    icon: "🪝",
    title: "Full Hooks API",
    desc: "useState, useEffect, useRef, useMemo, useCallback, useContext — all the hooks you know.",
  },
  {
    icon: "🔷",
    title: "TypeScript First",
    desc: "Every API is fully typed. Enjoy autocomplete, type-safe props, and zero runtime surprises.",
  },
  {
    icon: "🧭",
    title: "Built-in Router",
    desc: "Client-side routing via @rectify-dev/router — BrowserRouter, nested routes, hooks and more.",
  },
  {
    icon: "💤",
    title: "Lazy & Suspense",
    desc: "Code-split components with lazy() and wrap them in <Suspense> for seamless loading states.",
  },
  {
    icon: "🏛️",
    title: "Class Components",
    desc: "Extend Component<P, S> for class-based components with lifecycle methods like React.",
  },
];

export function Home() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-6 text-center">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400 border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Open Source · MIT License
          </span>

          <h1 className="animate-slide-up text-5xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-slate-200 to-slate-400 max-w-3xl mx-auto leading-tight mb-5">
            Build user interfaces<br />from scratch
          </h1>

          <p className="animate-stagger-1 text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Rectify is a UI library with a fiber reconciler, React-compatible hooks,
            class components, lazy loading, and a first-class router.
          </p>

          <div className="animate-stagger-2 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/learn/introduction"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg no-underline hover:no-underline"
            >
              Get started →
            </Link>
            <Link
              to="/api/core"
              className="inline-flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.11] text-slate-200 font-semibold px-6 py-3 rounded-xl border border-white/[0.09] transition-colors no-underline hover:no-underline"
            >
              API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* ── Code preview ── */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <CodeBlock code={HERO_CODE} lang="tsx" filename="App.tsx" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 pb-28">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-slate-200 mb-2">
            Everything you need
          </h2>
          <p className="text-center text-slate-500 mb-12">
            A complete toolkit for building modern web UIs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all group"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-200 mb-1.5 group-hover:text-white transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center bg-linear-to-br from-violet-600/20 to-blue-600/10 border border-violet-500/20 rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to dive in?</h2>
          <p className="text-slate-400 mb-8">
            Follow the guide to set up your first Rectify app in minutes.
          </p>
          <Link
            to="/learn/installation"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg no-underline hover:no-underline"
          >
            Start building →
          </Link>
        </div>
      </section>
    </div>
  );
}
