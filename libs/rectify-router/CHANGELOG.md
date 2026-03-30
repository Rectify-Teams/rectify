# @rectify-dev/router

## 2.3.0

### Minor Changes

- **Initial public release** — client-side router for Rectify, aligned with the `2.3.0` unified release.

  **Providers**
  - `BrowserRouter` — HTML5 History API (`pushState` / `popstate`), optional `basename`
  - `HashRouter` — hash-based routing for static hosting

  **Route matching**
  - `Routes` — renders the first matching `Route`; supports nested layouts
  - `Route` — data carrier for path, index, element, and nested children
  - `Outlet` — renders matched child route inside a layout component
  - URL params (`:id`), wildcard (`*`), and index routes

  **Navigation components**
  - `Link` — client-side anchor; passes modified clicks to the browser
  - `NavLink` — `Link` + `activeClassName` on active path; supports `end` prop
  - `Navigate` — declarative redirect-on-render

  **Hooks**
  - `useNavigate` — programmatic navigation with push / replace / delta
  - `useLocation` — current `RouterLocation` (`pathname`, `search`, `hash`, `state`, `key`)
  - `useParams` — typed URL params from nearest matching `Route`
  - `useMatch` — match any pattern against the current pathname
  - `useSearchParams` — `[URLSearchParams, setter]` with push navigation
  - `useHref` — resolve a path to a full href string
