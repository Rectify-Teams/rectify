import { useContext } from "@rectify-dev/core";
import { RouteContext } from "./RectifyRouterContext";

/**
 * Renders the nested route element set by the parent `<Routes>`.
 * Place this inside a layout component.
 *
 * @example
 * function UserLayout() {
 *   return (
 *     <div>
 *       <nav>…</nav>
 *       <Outlet />
 *     </div>
 *   );
 * }
 */
export function Outlet(): any {
  const { outlet } = useContext(RouteContext);
  return outlet;
}
