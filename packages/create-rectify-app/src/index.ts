import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const gray = (s: string) => `\x1b[90m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const log = (msg = "") => process.stdout.write(msg + "\n");

// ─── Package manager detection ────────────────────────────────────────────────

function detectPm(): "pnpm" | "yarn" | "npm" {
  const agent = process.env["npm_config_user_agent"] ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  for (const pm of ["pnpm", "yarn"] as const) {
    try {
      execSync(`${pm} --version`, { stdio: "ignore" });
      return pm;
    } catch {
      // not available
    }
  }
  return "npm";
}

// ─── Templates ────────────────────────────────────────────────────────────────

function tplPackageJson(name: string): string {
  return (
    JSON.stringify(
      {
        name,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
        },
        devDependencies: {
          "@rectify-dev/core": "^2.4.2",
          "@rectify-dev/vite-plugin": "latest",
          typescript: "~5.9.3",
          vite: "latest",
        },
      },
      null,
      2,
    ) + "\n"
  );
}

const tplTsConfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* JSX — Rectify mode */
    "jsx": "react-jsx",
    "jsxImportSource": "@rectify-dev/core",

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
`;

const tplViteConfig = `import { defineConfig } from "vite";
import rectify from "@rectify-dev/vite-plugin";

export default defineConfig({
  plugins: [rectify()],
});
`;

function tplIndexHtml(name: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

const tplMainTsx = `import { createRoot } from "@rectify-dev/core";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("app")!).render(<App />);
`;

const tplAppTsx = `import { useState } from "@rectify-dev/core";
import styles from "./App.module.css";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Hello from Rectify!</h1>
      <p className={styles.hint}>
        Edit <code>src/App.tsx</code> to get started.
      </p>
      <button className={styles.counter} onClick={() => setCount((c) => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
`;

const tplAppModuleCss = `.app {
  font-family: sans-serif;
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.hint {
  color: #666;
  margin-bottom: 1.5rem;
}

.hint code {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 0.1em 0.4em;
  font-size: 0.9em;
}

.counter {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  border: 2px solid #333;
  border-radius: 6px;
  background: #fff;
  transition: background 0.2s;
}

.counter:hover {
  background: #f0f0f0;
}
`;

const tplIndexCss = `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  background: #fff;
  color: #111;
}
`;

const tplGitIgnore = `node_modules
dist
*.local
.DS_Store
`;

// ─── Prompt helper ────────────────────────────────────────────────────────────

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log();
  log(bold(cyan("create-rectify-app")) + "  —  scaffold a new Rectify project");
  log();

  // 1. Resolve project name
  let projectName = process.argv[2]?.trim() ?? "";
  if (!projectName) {
    projectName = await prompt("Project name: ");
  }
  if (!projectName) {
    log(red("✖  Project name is required."));
    process.exit(1);
  }

  const inPlace = projectName === ".";
  const targetDir = inPlace ? process.cwd() : resolve(process.cwd(), projectName);
  const safeName = inPlace
    ? (process.cwd().split(/[\\/]/).pop() ?? "rectify-app")
    : projectName;

  // 2. Guard against existing directory (unless in-place)
  if (!inPlace && existsSync(targetDir)) {
    log(red(`✖  Directory "${projectName}" already exists.`));
    process.exit(1);
  }

  log(gray(`  Scaffolding into ${bold(inPlace ? "." : projectName)}...`));
  log();

  // 3. Create directory tree
  mkdirSync(join(targetDir, "src"), { recursive: true });
  mkdirSync(join(targetDir, "public"), { recursive: true });

  const write = (file: string, content: string) =>
    writeFileSync(join(targetDir, file), content, "utf-8");

  // 4. Write template files
  const files: [string, string][] = [
    ["package.json", tplPackageJson(safeName)],
    ["tsconfig.json", tplTsConfig],
    ["vite.config.ts", tplViteConfig],
    ["index.html", tplIndexHtml(safeName)],
    [".gitignore", tplGitIgnore],
    ["src/main.tsx", tplMainTsx],
    ["src/index.css", tplIndexCss],
    ["src/App.tsx", tplAppTsx],
    ["src/App.module.css", tplAppModuleCss],
  ];

  for (const [file, content] of files) {
    write(file, content);
    log(`  ${green("✔")}  ${bold(file)}`);
  }

  log();

  // 5. Install dependencies
  const pm = detectPm();
  log(gray(`  Installing with ${bold(pm)}...`));
  log();

  try {
    execSync(`${pm} install`, { cwd: targetDir, stdio: "inherit" });
  } catch {
    log();
    log(red("  ✖  Install failed. Run the install command manually."));
  }

  // 6. Done
  log();
  log(`  ${bold(green("Done!"))} Your project is ready.`);
  log();
  if (!inPlace) {
    log(`  ${cyan(`cd ${projectName}`)}`);
  }
  log(`  ${cyan(`${pm} run dev`)}`);
  log();
}

main();
