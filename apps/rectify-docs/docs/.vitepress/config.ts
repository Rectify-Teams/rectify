import { defineConfig } from "vitepress";

const repo = "https://github.com/Rectify-Teams/rectify";

const learnSidebar = [
  {
    text: "Getting Started",
    items: [
      { text: "Introduction", link: "/" },
      { text: "Installation", link: "/learn/installation" },
      { text: "Quick Start", link: "/learn/quick-start" },
    ],
  },
  {
    text: "Components",
    items: [
      { text: "Function Components", link: "/learn/function-components" },
      { text: "Class Components", link: "/learn/class-components" },
      { text: "memo", link: "/learn/memo" },
      { text: "Fragments", link: "/learn/fragments" },
    ],
  },
  {
    text: "Hooks",
    items: [
      { text: "Hooks Overview", link: "/learn/hooks-overview" },
      { text: "useState", link: "/learn/use-state" },
      { text: "useEffect", link: "/learn/use-effect" },
      { text: "useLayoutEffect", link: "/learn/use-layout-effect" },
      { text: "useRef", link: "/learn/use-ref" },
      { text: "useMemo", link: "/learn/use-memo" },
      { text: "useCallback", link: "/learn/use-callback" },
      { text: "useReducer", link: "/learn/use-reducer" },
      { text: "useContext", link: "/learn/use-context" },
      { text: "useId", link: "/learn/use-id" },
    ],
  },
  {
    text: "Advanced",
    items: [
      { text: "Lazy & Suspense", link: "/learn/lazy-suspense" },
      { text: "Context", link: "/learn/context" },
      { text: "Refs and the DOM", link: "/learn/refs-and-dom" },
      { text: "Portals", link: "/learn/portals" },
      { text: "Bailout", link: "/learn/bailout" },
      { text: "Benchmark", link: "/learn/benchmark" },
    ],
  },
];

const apiSidebar = [
  {
    text: "Core API",
    items: [
      { text: "createRoot", link: "/api/create-root" },
      { text: "createPortal", link: "/api/create-portal" },
      { text: "JSX", link: "/api/jsx" },
      { text: "Fragment", link: "/api/fragment" },
    ],
  },
  {
    text: "Hooks",
    items: [
      { text: "useState", link: "/api/hooks/use-state" },
      { text: "useReducer", link: "/api/hooks/use-reducer" },
      { text: "useEffect", link: "/api/hooks/use-effect" },
      { text: "useLayoutEffect", link: "/api/hooks/use-layout-effect" },
      { text: "useRef", link: "/api/hooks/use-ref" },
      { text: "useMemo", link: "/api/hooks/use-memo" },
      { text: "useCallback", link: "/api/hooks/use-callback" },
      { text: "useContext", link: "/api/hooks/use-context" },
      { text: "useId", link: "/api/hooks/use-id" },
    ],
  },
  {
    text: "Components",
    items: [
      { text: "Component", link: "/api/component" },
      { text: "memo", link: "/api/memo" },
      { text: "lazy", link: "/api/lazy" },
      { text: "Suspense", link: "/api/suspense" },
      { text: "createContext", link: "/api/create-context" },
    ],
  },
];

const routerSidebar = [
  {
    text: "Router",
    items: [
      { text: "Installation", link: "/router/installation" },
      { text: "BrowserRouter", link: "/router/browser-router" },
      { text: "HashRouter", link: "/router/hash-router" },
      { text: "Routes & Route", link: "/router/routes-and-route" },
      { text: "Link", link: "/router/link" },
      { text: "NavLink", link: "/router/nav-link" },
      { text: "Navigate", link: "/router/navigate" },
      { text: "Outlet", link: "/router/outlet" },
    ],
  },
  {
    text: "Router Hooks",
    items: [
      { text: "useNavigate", link: "/router/use-navigate" },
      { text: "useLocation", link: "/router/use-location" },
      { text: "useParams", link: "/router/use-params" },
      { text: "useMatch", link: "/router/use-match" },
      { text: "useSearchParams", link: "/router/use-search-params" },
      { text: "useHref", link: "/router/use-href" },
    ],
  },
];

// The embedded wcvm Studio (@wcvm/sdk) needs SharedArrayBuffer, which a cross-origin iframe only
// gets when the host page is cross-origin isolated too.
const isolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

// `server.headers` does not reach VitePress's own HTML route, so set them in middleware.
const isolationPlugin = {
  name: "rectify-docs:cross-origin-isolation",
  configureServer(server: any) {
    server.middlewares.use((_req: any, res: any, next: () => void) => {
      for (const [k, v] of Object.entries(isolationHeaders)) res.setHeader(k, v);
      next();
    });
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((_req: any, res: any, next: () => void) => {
      for (const [k, v] of Object.entries(isolationHeaders)) res.setHeader(k, v);
      next();
    });
  },
};

export default defineConfig({
  title: "Rectify",
  description: "Build user interfaces from scratch",
  base: "/rectify/",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  appearance: "dark",

  head: [["link", { rel: "icon", href: "/rectify/img/logo.svg" }]],

  // The benchmark app is copied into public/ at deploy time, so its URL is
  // not resolvable while VitePress checks links.
  ignoreDeadLinks: [/^\/rectify\/perf-benchmark/],

  vite: {
    plugins: [isolationPlugin],
  },

  themeConfig: {
    logo: "/img/logo.svg",
    siteTitle: "Rectify",

    nav: [
      { text: "Learn", link: "/", activeMatch: "^/(learn/|$)" },
      { text: "API", link: "/api/create-root", activeMatch: "^/api/" },
      { text: "Router", link: "/router/installation", activeMatch: "^/router/" },
      { text: "Playground", link: "/playground" },
      { text: "Benchmark", link: "/learn/benchmark" },
      { text: "Blog", link: "/blog/", activeMatch: "^/blog/" },
    ],

    sidebar: {
      "/api/": apiSidebar,
      "/router/": routerSidebar,
      "/blog/": [],
      "/": learnSidebar,
    },

    socialLinks: [{ icon: "github", link: repo }],

    search: { provider: "local" },

    editLink: {
      pattern: `${repo}/edit/main/apps/rectify-docs/docs/:path`,
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © ${new Date().getFullYear()} Rectify Teams. Built with VitePress.`,
    },
  },
});
