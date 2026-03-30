import { Callout } from "../../components/Callout";
import { CodeBlock } from "../../components/CodeBlock";
import { Link } from "@rectify-dev/router";

export function LearnRouting() {
  return (
    <>
      <h1>Routing</h1>
      <p>
        <code>@rectify-dev/router</code> provides client-side routing for Rectify apps.
        The API is modelled after React Router v6.
      </p>

      <h2>1. Install</h2>
      <CodeBlock lang="bash" code="pnpm add @rectify-dev/router" />

      <h2>2. Wrap your app in BrowserRouter</h2>
      <CodeBlock
        lang="tsx"
        filename="main.tsx"
        code={`import { createRoot } from "@rectify-dev/core";
import { BrowserRouter } from "@rectify-dev/router";
import App from "./App";

createRoot(document.getElementById("app")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);`}
      />

      <Callout type="note">
        Use <code>HashRouter</code> instead of <code>BrowserRouter</code> if you're
        deploying to static hosting that doesn't support URL rewriting.
      </Callout>

      <h2>3. Define routes</h2>
      <CodeBlock
        lang="tsx"
        filename="App.tsx"
        code={`import { Routes, Route } from "@rectify-dev/router";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}`}
      />

      <h2>4. Navigate with Link and NavLink</h2>
      <CodeBlock
        lang="tsx"
        code={`import { Link, NavLink } from "@rectify-dev/router";

function Nav() {
  return (
    <nav>
      {/* Regular link */}
      <Link to="/about">About</Link>

      {/* NavLink adds activeClassName when path matches */}
      <NavLink to="/" end activeClassName="active">Home</NavLink>
      <NavLink to="/about" activeClassName="active">About</NavLink>
    </nav>
  );
}`}
      />

      <h2>5. URL parameters</h2>
      <CodeBlock
        lang="tsx"
        code={`import { useParams } from "@rectify-dev/router";

// Route: <Route path="users/:id" element={<UserDetail />} />

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  return <h1>User #{id}</h1>;
}`}
      />

      <h2>6. Programmatic navigation</h2>
      <CodeBlock
        lang="tsx"
        code={`import { useNavigate } from "@rectify-dev/router";

function LogoutButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/login", { replace: true })}>
      Log out
    </button>
  );
}

// Go back
navigate(-1);`}
      />

      <h2>7. Nested routes with Outlet</h2>
      <CodeBlock
        lang="tsx"
        code={`import { Outlet } from "@rectify-dev/router";

// Layout wraps child routes
function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <main>
        <Outlet /> {/* child route renders here */}
      </main>
    </div>
  );
}

// Route tree
<Routes>
  <Route path="dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>`}
      />

      <div className="mt-10 flex gap-4">
        <Link
          to="/learn/hooks"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/[0.08] no-underline hover:no-underline"
        >
          ← Hooks
        </Link>
        <Link
          to="/api/core"
          className="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline hover:no-underline"
        >
          Next: API Reference →
        </Link>
      </div>
    </>
  );
}
