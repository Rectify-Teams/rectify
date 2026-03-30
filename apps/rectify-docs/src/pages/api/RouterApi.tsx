import { ApiDoc } from "../../components/ApiDoc";
import { CodeBlock } from "../../components/CodeBlock";
import { Link } from "@rectify-dev/router";

export function RouterApi() {
  return (
    <>
      <h1>Router API</h1>
      <p>
        All exports below come from <code>@rectify-dev/router</code>.
        Install with <code>pnpm add @rectify-dev/router</code>.
      </p>

      <CodeBlock lang="ts" code={`import {
  BrowserRouter, HashRouter,
  Routes, Route, Outlet,
  Link, NavLink, Navigate,
  useNavigate, useLocation, useParams,
  useMatch, useSearchParams,
} from "@rectify-dev/router";`} />

      <hr style={{ borderColor: "rgba(255,255,255,0.07)", margin: "2.5rem 0" }} />

      <h2>BrowserRouter</h2>
      <ApiDoc
        name="BrowserRouter"
        signature={`<BrowserRouter basename?="">{children}</BrowserRouter>`}
        description="Provides routing context using the HTML5 History API (pushState). Wrap your entire app with this component."
        params={[
          { name: "basename", type: "string", description: "Optional URL prefix stripped before matching routes." },
          { name: "children", type: "RectifyNode", description: "Child component tree." },
        ]}
        returns="JSX.Element"
        example={`createRoot(document.getElementById("app")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);`}
      />

      <h2>HashRouter</h2>
      <ApiDoc
        name="HashRouter"
        signature={`<HashRouter basename?="">{children}</HashRouter>`}
        description="Like BrowserRouter but stores the URL in the hash fragment (#/path). Good for static hosting."
        params={[
          { name: "basename", type: "string", description: "Optional URL prefix." },
          { name: "children", type: "RectifyNode", description: "Child component tree." },
        ]}
        returns="JSX.Element"
        example={`<HashRouter><App /></HashRouter>`}
      />

      <h2>Routes</h2>
      <ApiDoc
        name="Routes"
        signature={`<Routes>{children}</Routes>`}
        description="Renders the first child Route that matches the current URL. Must be used inside a router."
        params={[
          { name: "children", type: "RectifyNode", description: "Route elements." },
        ]}
        returns="JSX.Element | null"
        example={`<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Routes>`}
      />

      <h2>Route</h2>
      <ApiDoc
        name="Route"
        signature={`<Route path? index? element children? />`}
        description="Declares a route entry. Used inside Routes. Route itself renders nothing — Routes reads its props to build the route tree."
        params={[
          { name: "path", type: "string", description: 'Path pattern (e.g. "users/:id", "*", "products/*").' },
          { name: "index", type: "boolean", description: "Marks this as the default child route (renders when no other child matches)." },
          { name: "element", type: "RectifyNode", description: "JSX to render when this route matches." },
          { name: "children", type: "RectifyNode", description: "Nested Route elements for sub-routes." },
        ]}
        returns="null"
        example={`<Route path="dashboard" element={<DashboardLayout />}>
  <Route index element={<Overview />} />
  <Route path="settings" element={<Settings />} />
  <Route path="users/:id" element={<UserDetail />} />
</Route>`}
      />

      <h2>Outlet</h2>
      <ApiDoc
        name="Outlet"
        signature={`<Outlet />`}
        description="Renders the matched child route inside a layout component. Place it wherever child content should appear."
        params={[]}
        returns="JSX.Element | null"
        example={`function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}`}
      />

      <h2>Link</h2>
      <ApiDoc
        name="Link"
        signature={`<Link to className? children />`}
        description="Renders an anchor element that navigates client-side when clicked. Does not cause a full page reload."
        params={[
          { name: "to", type: "string", description: "Target path." },
          { name: "className", type: "string", description: "CSS class(es) applied to the anchor." },
          { name: "children", type: "RectifyNode", description: "Link label." },
        ]}
        returns="JSX.Element"
        example={`<Link to="/about">About us</Link>
<Link to="/users/42" className="card-link">View profile</Link>`}
      />

      <h2>NavLink</h2>
      <ApiDoc
        name="NavLink"
        signature={`<NavLink to activeClassName? end? className? children />`}
        description='Like Link, but adds activeClassName when the current URL matches to. Useful for navigation menus.'
        params={[
          { name: "to", type: "string", description: "Target path." },
          { name: "activeClassName", type: "string", description: "Extra class applied when route is active." },
          { name: "end", type: "boolean", description: 'If true, only match when the path is exactly to (default false — prefix match).' },
          { name: "className", type: "string", description: "Base CSS class." },
        ]}
        returns="JSX.Element"
        example={`<NavLink to="/dashboard" activeClassName="active" end>
  Dashboard
</NavLink>`}
      />

      <h2>Navigate</h2>
      <ApiDoc
        name="Navigate"
        signature={`<Navigate to replace? />`}
        description="Imperatively navigates to a route when rendered. Equivalent to calling navigate() inside useEffect."
        params={[
          { name: "to", type: "string", description: "Target path." },
          { name: "replace", type: "boolean", description: "Replace current history entry instead of pushing." },
        ]}
        returns="null"
        example={`function ProtectedRoute({ children }: { children: any }) {
  const isLoggedIn = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}`}
      />

      <hr style={{ borderColor: "rgba(255,255,255,0.07)", margin: "2.5rem 0" }} />
      <h2>Hooks</h2>

      <ApiDoc
        name="useNavigate"
        signature={`useNavigate(): NavigateFunction`}
        description="Returns a stable navigate function to programmatically change the URL."
        params={[]}
        returns="navigate(to: string | number, options?: { replace?: boolean; state?: unknown })"
        example={`const navigate = useNavigate();

// Push
navigate("/dashboard");

// Replace
navigate("/login", { replace: true });

// Go back
navigate(-1);`}
      />

      <ApiDoc
        name="useLocation"
        signature={`useLocation(): RouterLocation`}
        description="Returns the current location object, re-rendering the component whenever the URL changes."
        params={[]}
        returns="{ pathname, search, hash, state, key }"
        example={`const location = useLocation();
console.log(location.pathname); // "/users/42"
console.log(location.search);   // "?tab=profile"
console.log(location.state);    // any value passed via navigate(to, { state })`}
      />

      <ApiDoc
        name="useParams"
        signature={`useParams<T extends Record<string, string>>(): Partial<T>`}
        description="Returns the dynamic URL parameters from the current Route."
        params={[
          { name: "T", type: "type parameter", description: "Optional shape of the params object." },
        ]}
        returns="Partial<T> — key/value map of URL segments."
        example={`// Route: <Route path="posts/:postId/comments/:commentId" ... />
const { postId, commentId } = useParams<{
  postId: string;
  commentId: string;
}>();`}
      />

      <ApiDoc
        name="useSearchParams"
        signature={`useSearchParams(): [URLSearchParams, (params: Record<string, string>) => void]`}
        description="Returns the current URL query string as a URLSearchParams object, and a setter to navigate with new params."
        params={[]}
        returns="[URLSearchParams, setSearchParams]"
        example={`const [params, setParams] = useSearchParams();
const page = params.get("page") ?? "1";

<button onClick={() => setParams({ page: String(Number(page) + 1) })}>
  Next page
</button>`}
      />

      <ApiDoc
        name="useMatch"
        signature={`useMatch(pattern: string): PathMatch | null`}
        description="Tests the current location against a pattern and returns match info, or null if no match."
        params={[
          { name: "pattern", type: "string", description: "Route pattern to test (same syntax as Route path)." },
        ]}
        returns="{ params, pathnameBase } or null."
        example={`const match = useMatch("/users/:id");
if (match) {
  console.log("Viewing user", match.params.id);
}`}
      />

      <div className="mt-10 flex gap-4">
        <Link
          to="/api/core"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/[0.08] no-underline hover:no-underline"
        >
          ← Core API
        </Link>
      </div>
    </>
  );
}
