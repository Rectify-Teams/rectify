import { createContext } from "@rectify-dev/core";
import type { RouterContextValue, RouteContextValue } from "./RectifyRouterTypes";

export const RouterContext = createContext<RouterContextValue | null>(null);

export const RouteContext = createContext<RouteContextValue>({
  params: {},
  pathnameBase: "/",
  outlet: null,
});
