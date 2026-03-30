import { useState, useEffect, useCallback } from "@rectify-dev/core";
import { RouterContext } from "./RectifyRouterContext";
import type { RouterLocation, NavigateFunction, NavigateOptions } from "./RectifyRouterTypes";

function readBrowserLocation(): RouterLocation {
  const hist = (window.history.state ?? {}) as Record<string, unknown>;
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: hist["usr"] ?? null,
    key: (hist["key"] as string) ?? "default",
  };
}

export type BrowserRouterProps = {
  children?: any;
  basename?: string;
};

/**
 * Provides routing backed by the HTML5 History API (`pushState` / `popstate`).
 *
 * @example
 * createRoot(document.getElementById("root")!).render(
 *   <BrowserRouter>
 *     <App />
 *   </BrowserRouter>
 * );
 */
export function BrowserRouter({ children, basename = "/" }: BrowserRouterProps) {
  const [location, setLocation] = useState<RouterLocation>(readBrowserLocation);

  useEffect(() => {
    const onPop = () => setLocation(readBrowserLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    const histState = {
      usr: options?.state ?? null,
      key: Math.random().toString(36).slice(2),
    };
    if (options?.replace) {
      window.history.replaceState(histState, "", to);
    } else {
      window.history.pushState(histState, "", to);
    }
    setLocation(readBrowserLocation());
  }, []);

  return (
    <RouterContext
      value={{
        location,
        navigate: navigate as NavigateFunction,
        basename,
        createHref: (to) => to,
      }}
    >
      {children}
    </RouterContext>
  );
}
