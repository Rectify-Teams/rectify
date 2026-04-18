// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  learnSidebar: [
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "learn/introduction",
        "learn/installation",
        "learn/quick-start",
      ],
    },
    {
      type: "category",
      label: "Components",
      collapsed: false,
      items: [
        "learn/function-components",
        "learn/class-components",
        "learn/memo",
        "learn/fragments",
      ],
    },
    {
      type: "category",
      label: "Hooks",
      collapsed: false,
      items: [
        "learn/hooks-overview",
        "learn/use-state",
        "learn/use-effect",
        "learn/use-layout-effect",
        "learn/use-ref",
        "learn/use-memo",
        "learn/use-callback",
        "learn/use-reducer",
        "learn/use-context",
        "learn/use-id",
      ],
    },
    {
      type: "category",
      label: "Advanced",
      collapsed: false,
      items: [
        "learn/lazy-suspense",
        "learn/context",
        "learn/refs-and-dom",
        "learn/portals",
        "learn/bailout",
        "learn/benchmark",
      ],
    },
  ],

  apiSidebar: [
    {
      type: "category",
      label: "Core API",
      collapsed: false,
      items: [
        "api/create-root",
        "api/create-portal",
        "api/jsx",
        "api/fragment",
      ],
    },
    {
      type: "category",
      label: "Hooks",
      collapsed: false,
      items: [
        "api/hooks/use-state",
        "api/hooks/use-reducer",
        "api/hooks/use-effect",
        "api/hooks/use-layout-effect",
        "api/hooks/use-ref",
        "api/hooks/use-memo",
        "api/hooks/use-callback",
        "api/hooks/use-context",
        "api/hooks/use-id",
      ],
    },
    {
      type: "category",
      label: "Components",
      collapsed: false,
      items: [
        "api/component",
        "api/memo",
        "api/lazy",
        "api/suspense",
        "api/create-context",
      ],
    },
  ],

  routerSidebar: [
    {
      type: "category",
      label: "Router",
      collapsed: false,
      items: [
        "router/router-installation",
        "router/browser-router",
        "router/hash-router",
        "router/routes-and-route",
        "router/link",
        "router/nav-link",
        "router/navigate",
        "router/outlet",
      ],
    },
    {
      type: "category",
      label: "Router Hooks",
      collapsed: false,
      items: [
        "router/use-navigate",
        "router/use-location",
        "router/use-params",
        "router/use-match",
        "router/use-search-params",
        "router/use-href",
      ],
    },
  ],
};

export default sidebars;
