import { useEffect, useContext } from "@rectify-dev/core";
import { RouterContext } from "./RectifyRouterContext";
import type { NavigateProps } from "./RectifyRouterTypes";

/**
 * Imperatively navigates to `to` when rendered (inside a `useEffect`).
 * Renders nothing itself.
 *
 * @example
 * function ProtectedPage({ isAuthed }: { isAuthed: boolean }) {
 *   if (!isAuthed) return <Navigate to="/login" replace />;
 *   return <SecretContent />;
 * }
 */
export function Navigate({ to, replace = false, state }: NavigateProps) {
  const routerCtx = useContext(RouterContext);
  if (!routerCtx) {
    throw new Error("<Navigate> must be inside a <BrowserRouter> or <HashRouter>.");
  }

  const { navigate } = routerCtx;

  useEffect(() => {
    navigate(to, { replace, state });
  }, []);

  return null;
}
