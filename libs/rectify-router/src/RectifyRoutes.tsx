import { useContext } from "@rectify-dev/core";
import type { RectifyNode } from "@rectify-dev/core";
import { RouterContext, RouteContext } from "./RectifyRouterContext";
import { matchPath, stripBasename } from "./RectifyRouterUtils";
import type { RouteProps } from "./RectifyRouterTypes";

// ---------------------------------------------------------------------------
// Route — data-only carrier
// ---------------------------------------------------------------------------

/**
 * Declares a single route inside a {@link Routes} tree.
 * Never rendered directly — `Routes` reads its props as data.
 *
 * @example
 * <Routes>
 *   <Route index element={<Home />} />
 *   <Route path="about" element={<About />} />
 *   <Route path="users/:id" element={<User />} />
 *   <Route path="*" element={<NotFound />} />
 * </Routes>
 *
 * @example Nested routes (child renders via <Outlet>)
 * <Routes>
 *   <Route path="users" element={<UserLayout />}>
 *     <Route index element={<UserList />} />
 *     <Route path=":id" element={<UserDetail />} />
 *   </Route>
 * </Routes>
 */
export const Route = (_props: RouteProps): null => null;

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

type RouteConfig = {
  path?: string;
  index?: boolean;
  element?: RectifyNode;
  children?: RectifyNode;
};

function collectRoutes(children: RectifyNode): RouteConfig[] {
  if (children == null || children === false) return [];
  const arr: any[] = Array.isArray(children) ? children : [children];
  return arr
    .filter(
      (child): child is { props: RouteConfig } =>
        child != null && typeof child === "object" && "props" in child,
    )
    .map((child) => child.props as RouteConfig);
}

/**
 * Renders the first `<Route>` child whose `path` matches the current URL.
 *
 * @example
 * <BrowserRouter>
 *   <Routes>
 *     <Route index element={<Home />} />
 *     <Route path="users" element={<UserLayout />}>
 *       <Route index element={<UserList />} />
 *       <Route path=":id" element={<UserDetail />} />
 *     </Route>
 *     <Route path="*" element={<NotFound />} />
 *   </Routes>
 * </BrowserRouter>
 */
export function Routes({ children }: { children?: RectifyNode }) {
  const routerCtx = useContext(RouterContext);
  if (!routerCtx) {
    throw new Error("<Routes> must be inside a <BrowserRouter> or <HashRouter>.");
  }

  const parentRoute = useContext(RouteContext);
  const { location, basename } = routerCtx;

  const effectiveBase =
    parentRoute.pathnameBase === "/" ? basename : parentRoute.pathnameBase;

  const remainingPathname = stripBasename(location.pathname, effectiveBase);
  const routes = collectRoutes(children);

  for (const route of routes) {
    // Index route
    if (route.index) {
      if (remainingPathname === "/" || remainingPathname === "") {
        return (
          <RouteContext
            value={{
              params: { ...parentRoute.params },
              pathnameBase: effectiveBase,
              outlet: null,
            }}
          >
            {route.element}
          </RouteContext>
        );
      }
      continue;
    }

    if (!route.path) continue;

    // Prefix-match when the route has nested children
    const hasChildren = !!route.children;
    const pattern = hasChildren
      ? route.path.endsWith("/*") ? route.path : route.path + "/*"
      : route.path;

    const match = matchPath(pattern, remainingPathname);
    if (!match) continue;

    const params = { ...parentRoute.params, ...match.params };
    const newPathnameBase =
      effectiveBase === "/"
        ? match.pathnameBase
        : match.pathnameBase === "/"
          ? effectiveBase
          : effectiveBase + match.pathnameBase;

    const outlet: RectifyNode = route.children
      ? (<Routes>{route.children}</Routes> as unknown as RectifyNode)
      : null;

    return (
      <RouteContext value={{ params, pathnameBase: newPathnameBase, outlet }}>
        {route.element}
      </RouteContext>
    );
  }

  return null;
}
