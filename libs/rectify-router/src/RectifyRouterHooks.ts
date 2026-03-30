import { useContext } from "@rectify-dev/core";
import { RouterContext, RouteContext } from "./RectifyRouterContext";
import { matchPath } from "./RectifyRouterUtils";
import type { NavigateFunction, RouterLocation } from "./RectifyRouterTypes";
import type { PathMatch } from "./RectifyRouterUtils";

// ---------------------------------------------------------------------------
// useNavigate
// ---------------------------------------------------------------------------

/**
 * Returns the `navigate` function for the current router.
 *
 * - `navigate("/path")` — push onto the history stack.
 * - `navigate("/path", { replace: true })` — replace current entry.
 * - `navigate(-1)` — go back.
 *
 * @example
 * const navigate = useNavigate();
 * navigate("/login", { replace: true });
 */
export function useNavigate(): NavigateFunction {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useNavigate must be used inside a <BrowserRouter> or <HashRouter>.");
  }
  return ctx.navigate;
}

// ---------------------------------------------------------------------------
// useLocation
// ---------------------------------------------------------------------------

/**
 * Returns the current location object.
 * Re-renders whenever the location changes.
 *
 * @example
 * const location = useLocation();
 * console.log(location.pathname);
 */
export function useLocation(): RouterLocation {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useLocation must be used inside a <BrowserRouter> or <HashRouter>.");
  }
  return ctx.location;
}

// ---------------------------------------------------------------------------
// useParams
// ---------------------------------------------------------------------------

/**
 * Returns URL params extracted by the nearest matching `<Route>`.
 *
 * @example
 * // Route: <Route path="/users/:id" element={<User />} />
 * const { id } = useParams<{ id: string }>();
 */
export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  const ctx = useContext(RouteContext);
  return ctx.params as T;
}

// ---------------------------------------------------------------------------
// useMatch
// ---------------------------------------------------------------------------

/**
 * Matches `pattern` against the current pathname.
 * Returns a `PathMatch` on success, or `null`.
 *
 * @example
 * const match = useMatch("/users/:id");
 * if (match) console.log(match.params.id);
 */
export function useMatch(pattern: string): PathMatch | null {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useMatch must be used inside a <BrowserRouter> or <HashRouter>.");
  }
  return matchPath(pattern, ctx.location.pathname);
}

// ---------------------------------------------------------------------------
// useSearchParams
// ---------------------------------------------------------------------------

/**
 * Returns `[URLSearchParams, setter]`.
 * Calling the setter navigates to the same path with the new query string.
 *
 * @example
 * const [params, setParams] = useSearchParams();
 * setParams({ q: "hello" });
 */
export function useSearchParams(): [
  URLSearchParams,
  (next: Record<string, string> | URLSearchParams) => void,
] {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useSearchParams must be used inside a <BrowserRouter> or <HashRouter>.");
  }
  const { location, navigate } = ctx;
  const params = new URLSearchParams(location.search);

  const setSearchParams = (next: Record<string, string> | URLSearchParams) => {
    const sp =
      next instanceof URLSearchParams
        ? next
        : new URLSearchParams(next as Record<string, string>);
    const search = sp.toString();
    navigate(location.pathname + (search ? "?" + search : "") + location.hash);
  };

  return [params, setSearchParams];
}
