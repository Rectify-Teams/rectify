// Router providers
export { BrowserRouter } from "./RectifyBrowserRouter";
export type { BrowserRouterProps } from "./RectifyBrowserRouter";
export { HashRouter } from "./RectifyHashRouter";
export type { HashRouterProps } from "./RectifyHashRouter";

// Route matching
export { Routes, Route } from "./RectifyRoutes";
export { Outlet } from "./RectifyOutlet";

// Navigation components
export { Link, NavLink, useHref } from "./RectifyLink";
export { Navigate } from "./RectifyNavigate";

// Hooks
export {
  useNavigate,
  useLocation,
  useParams,
  useMatch,
  useSearchParams,
} from "./RectifyRouterHooks";

// Types
export type {
  RouterLocation,
  NavigateFunction,
  NavigateOptions,
  RouterContextValue,
  RouteContextValue,
  RouteProps,
  LinkProps,
  NavLinkProps,
  NavigateProps,
} from "./RectifyRouterTypes";
export type { PathMatch } from "./RectifyRouterUtils";
