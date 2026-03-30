// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PathMatch = {
  params: Record<string, string>;
  pathnameBase: string;
};

// ---------------------------------------------------------------------------
// matchPath
// ---------------------------------------------------------------------------

/**
 * Matches `pattern` against `pathname`.
 *
 * Supported syntax:
 *  - Static segment  : `/about`
 *  - Named parameter : `/users/:id`
 *  - Catch-all       : `/files/*`
 *  - Star-only       : `*`
 */
export function matchPath(
  pattern: string,
  pathname: string,
  exact = true,
): PathMatch | null {
  const hasWildcard = pattern === "*" || pattern.endsWith("/*");
  const normalizedPattern =
    pattern === "*" ? "" : hasWildcard ? pattern.slice(0, -2) : pattern;

  const patternSegs = segmentize(normalizedPattern);
  const pathSegs = segmentize(pathname);
  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegs.length; i++) {
    const pSeg = patternSegs[i];
    const pathSeg = pathSegs[i];
    if (pathSeg === undefined) return null;
    if (pSeg.startsWith(":")) {
      params[pSeg.slice(1)] = decodeURIComponent(pathSeg);
    } else if (pSeg !== pathSeg) {
      return null;
    }
  }

  if (hasWildcard) {
    params["*"] = pathSegs
      .slice(patternSegs.length)
      .map(decodeURIComponent)
      .join("/");
  } else if (exact && pathSegs.length !== patternSegs.length) {
    return null;
  }

  const matchedSegs = pathSegs.slice(0, patternSegs.length);
  return {
    params,
    pathnameBase: matchedSegs.length > 0 ? "/" + matchedSegs.join("/") : "/",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function segmentize(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function stripBasename(pathname: string, basename: string): string {
  if (basename === "/") return pathname;
  const lcPath = pathname.toLowerCase();
  const lcBase = basename.toLowerCase().replace(/\/$/, "");
  if (!lcPath.startsWith(lcBase)) return pathname;
  const rest = pathname.slice(lcBase.length);
  return rest.startsWith("/") ? rest : "/" + rest;
}

export function resolvePath(to: string, fromPathname: string): string {
  if (to.startsWith("/")) return to;
  const base = fromPathname.endsWith("/")
    ? fromPathname
    : fromPathname.slice(0, fromPathname.lastIndexOf("/") + 1);
  const parts = (base + to).split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const seg of parts) {
    if (seg === "..") resolved.pop();
    else if (seg !== ".") resolved.push(seg);
  }
  return "/" + resolved.join("/");
}
