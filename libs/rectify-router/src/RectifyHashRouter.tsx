import { useState, useEffect, useCallback } from "@rectify-dev/core";
import { RouterContext } from "./RectifyRouterContext";
import type { RouterLocation, NavigateFunction, NavigateOptions } from "./RectifyRouterTypes";

function readHashLocation(): RouterLocation {
  const raw = window.location.hash.slice(1) || "/";
  const qIdx = raw.indexOf("?");
  const hIdx = raw.indexOf("#", 1);
  const pathname =
    qIdx !== -1 ? raw.slice(0, qIdx) : hIdx !== -1 ? raw.slice(0, hIdx) : raw;
  const search = qIdx !== -1 ? raw.slice(qIdx, hIdx !== -1 ? hIdx : undefined) : "";
  const hash = hIdx !== -1 ? raw.slice(hIdx) : "";
  return { pathname: pathname || "/", search, hash, state: null, key: "default" };
}

export type HashRouterProps = {
  children?: any;
  basename?: string;
};

/**
 * Provides routing backed by the URL hash (`#/path`).
 * Useful for static hosting where server-side URL rewriting is not available.
 *
 * @example
 * createRoot(document.getElementById("root")!).render(
 *   <HashRouter>
 *     <App />
 *   </HashRouter>
 * );
 */
export function HashRouter({ children, basename = "/" }: HashRouterProps) {
  const [location, setLocation] = useState<RouterLocation>(readHashLocation);

  useEffect(() => {
    const onHash = () => setLocation(readHashLocation());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    if (options?.replace) {
      window.location.replace(
        window.location.pathname + window.location.search + "#" + to,
      );
    } else {
      window.location.hash = to;
    }
    setLocation(readHashLocation());
  }, []);

  return (
    <RouterContext
      value={{
        location,
        navigate: navigate as NavigateFunction,
        basename,
        createHref: (to) => "#" + to,
      }}
    >
      {children}
    </RouterContext>
  );
}
