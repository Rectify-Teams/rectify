import type { RectifyNode } from "@rectify-dev/core";

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export type RouterLocation = {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

export type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
};

// ---------------------------------------------------------------------------
// Router context
// ---------------------------------------------------------------------------

export type RouterContextValue = {
  location: RouterLocation;
  navigate: NavigateFunction;
  basename: string;
  createHref: (to: string) => string;
};

// ---------------------------------------------------------------------------
// Route context
// ---------------------------------------------------------------------------

export type RouteContextValue = {
  params: Record<string, string>;
  pathnameBase: string;
  outlet: RectifyNode;
};

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export type RouteProps = {
  path?: string;
  index?: boolean;
  element?: RectifyNode;
  children?: RectifyNode;
};

export type LinkProps = {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: RectifyNode;
  className?: string;
  id?: string;
  style?: any;
  onClick?: (e: any) => void;
  [key: string]: any;
};

export type NavLinkProps = LinkProps & {
  activeClassName?: string;
  end?: boolean;
};

export type NavigateProps = {
  to: string;
  replace?: boolean;
  state?: unknown;
};
