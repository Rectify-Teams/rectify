import { useContext } from "@rectify-dev/core";
import { RouterContext } from "./RectifyRouterContext";
import { matchPath } from "./RectifyRouterUtils";
import type { LinkProps, NavLinkProps } from "./RectifyRouterTypes";

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

/**
 * Client-side navigation link. Renders a standard `<a>` but intercepts
 * clicks to call `navigate()` — no full-page reload.
 *
 * Modified clicks (Ctrl / Cmd / Shift / Alt) and middle-button clicks
 * are passed through to the browser so "open in new tab" still works.
 *
 * @example
 * <Link to="/about">About</Link>
 * <Link to="/users/42" replace state={{ from: "home" }}>User 42</Link>
 */
export function Link({
  to,
  replace: shouldReplace = false,
  state,
  children,
  onClick,
  ...rest
}: LinkProps) {
  const routerCtx = useContext(RouterContext);
  if (!routerCtx) {
    throw new Error("<Link> must be inside a <BrowserRouter> or <HashRouter>.");
  }

  const { navigate, createHref } = routerCtx;

  const handleClick = (e: any) => {
    // Rectify wraps native events — access the raw event for browser APIs
    const native: MouseEvent = e.nativeEvent ?? e;
    if (native.ctrlKey || native.metaKey || native.altKey || native.shiftKey || native.button !== 0) {
      return;
    }
    native.preventDefault();
    navigate(to, { replace: shouldReplace, state });
    if (typeof onClick === "function") onClick(e);
  };

  return (
    <a href={createHref(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// NavLink
// ---------------------------------------------------------------------------

/**
 * Like {@link Link} but adds `activeClassName` when the path matches.
 *
 * `end = true` (default) — exact match only.
 * `end = false` — active on any prefix match.
 *
 * @example
 * <NavLink to="/users" end={false}>Users</NavLink>
 * <NavLink to="/settings" activeClassName="selected">Settings</NavLink>
 */
export function NavLink({
  to,
  activeClassName = "active",
  end = true,
  className,
  ...rest
}: NavLinkProps) {
  const routerCtx = useContext(RouterContext);
  if (!routerCtx) {
    throw new Error("<NavLink> must be inside a <BrowserRouter> or <HashRouter>.");
  }
  const { location } = routerCtx;

  const isActive = end
    ? matchPath(to, location.pathname) !== null
    : matchPath(to + "/*", location.pathname) !== null ||
      matchPath(to, location.pathname) !== null;

  const computedClass = isActive
    ? [className, activeClassName].filter(Boolean).join(" ")
    : className;

  return <Link to={to} className={computedClass} {...rest} />;
}

// ---------------------------------------------------------------------------
// useHref
// ---------------------------------------------------------------------------

/**
 * Returns the `href` value a `<Link to={to}>` would produce.
 * Handles the `#` prefix for `<HashRouter>`.
 */
export function useHref(to: string): string {
  const routerCtx = useContext(RouterContext);
  if (!routerCtx) {
    throw new Error("useHref must be used inside a <BrowserRouter> or <HashRouter>.");
  }
  return routerCtx.createHref(to);
}
