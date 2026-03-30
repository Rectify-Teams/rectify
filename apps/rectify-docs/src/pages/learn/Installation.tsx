import { Callout } from "../../components/Callout";
import { CodeBlock } from "../../components/CodeBlock";
import { Link } from "@rectify-dev/router";

export function Installation() {
  return (
    <>
      <h1>Installation</h1>
      <p>
        Rectify is designed to work with <strong>Vite</strong>. The fastest way to get
        started is with the official Vite plugin which handles the JSX transform automatically.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>pnpm, npm, or yarn</li>
      </ul>

      <h2>1. Create a Vite project</h2>
      <CodeBlock lang="bash" code={`pnpm create vite my-app --template vanilla-ts
cd my-app`} />

      <h2>2. Install Rectify</h2>
      <CodeBlock lang="bash" code={`pnpm add @rectify-dev/core
pnpm add -D @rectify-dev/vite-plugin`} />

      <h2>3. Configure Vite</h2>
      <CodeBlock
        lang="ts"
        filename="vite.config.ts"
        code={`import { defineConfig } from "vite";
import rectify from "@rectify-dev/vite-plugin";

export default defineConfig({
  plugins: [rectify()],
  appType: "spa",
});`}
      />

      <h2>4. Configure TypeScript</h2>
      <p>
        Tell TypeScript to use Rectify's JSX runtime and enable strict mode:
      </p>
      <CodeBlock
        lang="json"
        filename="tsconfig.json"
        code={`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "jsxImportSource": "@rectify-dev/core",
    "strict": true,
    "noEmit": true
  }
}`}
      />

      <h2>5. Rename entry files to .tsx</h2>
      <p>
        Rename <code>src/main.ts</code> → <code>src/main.tsx</code> and
        update <code>index.html</code> to point to it.
      </p>

      <h2>6. Create your app</h2>
      <CodeBlock
        lang="tsx"
        filename="src/main.tsx"
        code={`import { createRoot } from "@rectify-dev/core";

function App() {
  return <h1>Hello Rectify! 🎉</h1>;
}

createRoot(document.getElementById("app")!).render(<App />);`}
      />

      <h2>7. Start the dev server</h2>
      <CodeBlock lang="bash" code="pnpm dev" />

      <Callout type="tip" title="Using the router?">
        Install <code>@rectify-dev/router</code> as well:{" "}
        <code>pnpm add @rectify-dev/router</code>
      </Callout>

      <div className="mt-10 flex gap-4">
        <Link
          to="/learn/introduction"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/[0.08] no-underline hover:no-underline"
        >
          ← Introduction
        </Link>
        <Link
          to="/learn/components"
          className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline hover:no-underline"
        >
          Next: Components →
        </Link>
      </div>
    </>
  );
}
