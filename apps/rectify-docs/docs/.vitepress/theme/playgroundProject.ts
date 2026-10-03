/**
 * The project loaded into the embedded wcvm Studio: the same starter page that
 * `npm create vite` generates for React (logos, counter card, hint text), but running on Rectify.
 * It is a plain Vite app that installs `@rectify-dev/core` from the npm registry, using the same
 * automatic JSX runtime as `apps/rectify-example` (no Babel needed).
 */
export const DEFAULT_APP = `import { useState } from "@rectify-dev/core";
import rectifyLogo from "./assets/rectify.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://rectify-teams.github.io/rectify" target="_blank">
          <img src={rectifyLogo} className="logo rectify" alt="Rectify logo" />
        </a>
      </div>
      <h1>Vite + Rectify</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to see your changes
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and Rectify logos to learn more
      </p>
    </>
  );
}

export default App;
`;

const MAIN = `import { createRoot } from "@rectify-dev/core";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("app")).render(<App />);
`;

const APP_CSS = `#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.rectify:hover {
  filter: drop-shadow(0 0 2em #7c6af7aa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
`;

const INDEX_CSS = `:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`;

const RECTIFY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" stroke="#7c6af7" stroke-width="6" fill="none"/>
  <text x="50" y="62" text-anchor="middle" font-size="42" font-weight="bold" font-family="system-ui" fill="#a78bfa">R</text>
</svg>
`;

const VITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
      <stop stop-color="#41d1ff"/>
      <stop offset="1" stop-color="#bd34fe"/>
    </linearGradient>
  </defs>
  <polygon points="19,2 6,18 14,18 12,30 26,12 17.5,12" fill="url(#g)"/>
</svg>
`;

const VITE_CONFIG = `import { defineConfig } from "vite";

export default defineConfig({
  // jsxDev: false because @rectify-dev/core/jsx-dev-runtime has no jsxDEV export.
  esbuild: { jsx: "automatic", jsxImportSource: "@rectify-dev/core", jsxDev: false },
});
`;

// Without a tsconfig the editor's TypeScript service defaults to `react-jsx` and reports that
// `react/jsx-runtime` cannot be found; this points it at Rectify's own automatic runtime, matching
// the Vite config above.
const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      jsxImportSource: "@rectify-dev/core",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["src"],
  },
  null,
  2,
);

const PACKAGE_JSON = JSON.stringify(
  {
    name: "rectify-playground",
    private: true,
    type: "module",
    scripts: { dev: "vite --host" },
    dependencies: { "@rectify-dev/core": "^2.5.0" },
    // Native binaries cannot run in a browser: use the WebAssembly builds (see wcvm README).
    devDependencies: { vite: "7.3.6" },
    overrides: {
      esbuild: "npm:esbuild-wasm@0.28.2",
      rollup: "npm:@rollup/wasm-node@4.63.4",
    },
  },
  null,
  2,
);

/** Project files for the embedded wcvm Studio: paths relative to the project root. */
export const projectFiles = (app: string = DEFAULT_APP): Record<string, string> => ({
  "package.json": PACKAGE_JSON,
  "vite.config.js": VITE_CONFIG,
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Rectify</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  "public/vite.svg": VITE_SVG,
  "src/main.tsx": MAIN,
  "src/App.tsx": app,
  "src/App.css": APP_CSS,
  "src/index.css": INDEX_CSS,
  "src/assets/rectify.svg": RECTIFY_SVG,
});
