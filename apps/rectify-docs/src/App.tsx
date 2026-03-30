import { BrowserRouter, Routes, Route } from "@rectify-dev/router";
import { lazy, Suspense } from "@rectify-dev/core";
import { Layout } from "./components/Layout";

// Pages — lazy-loaded for code splitting
const Home         = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Introduction = lazy(() => import("./pages/learn/Introduction").then(m => ({ default: m.Introduction })));
const Installation = lazy(() => import("./pages/learn/Installation").then(m => ({ default: m.Installation })));
const Components   = lazy(() => import("./pages/learn/Components").then(m => ({ default: m.LearnComponents })));
const Hooks        = lazy(() => import("./pages/learn/Hooks").then(m => ({ default: m.LearnHooks })));
const Routing      = lazy(() => import("./pages/learn/Routing").then(m => ({ default: m.LearnRouting })));
const CoreApi      = lazy(() => import("./pages/api/CoreApi").then(m => ({ default: m.CoreApi })));
const RouterApi    = lazy(() => import("./pages/api/RouterApi").then(m => ({ default: m.RouterApi })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32 text-slate-500 text-sm">
      Loading…
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <p className="text-6xl">404</p>
      <p className="text-slate-400">Page not found.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home — full-width, no sidebar layout */}
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Home />
            </Suspense>
          }
        />

        {/* Docs layout wraps all learn + api pages */}
        <Route path="/" element={<Layout />}>
          <Route
            path="learn/introduction"
            element={<Suspense fallback={<PageFallback />}><Introduction /></Suspense>}
          />
          <Route
            path="learn/installation"
            element={<Suspense fallback={<PageFallback />}><Installation /></Suspense>}
          />
          <Route
            path="learn/components"
            element={<Suspense fallback={<PageFallback />}><Components /></Suspense>}
          />
          <Route
            path="learn/hooks"
            element={<Suspense fallback={<PageFallback />}><Hooks /></Suspense>}
          />
          <Route
            path="learn/routing"
            element={<Suspense fallback={<PageFallback />}><Routing /></Suspense>}
          />
          <Route
            path="api/core"
            element={<Suspense fallback={<PageFallback />}><CoreApi /></Suspense>}
          />
          <Route
            path="api/router"
            element={<Suspense fallback={<PageFallback />}><RouterApi /></Suspense>}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
