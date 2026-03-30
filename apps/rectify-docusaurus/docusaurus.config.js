// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Rectify",
  tagline: "Build user interfaces from scratch",
  favicon: "img/favicon.ico",

  url: "https://rectify-teams.github.io",
  baseUrl: "/rectify/",

  organizationName: "Rectify-Teams",
  projectName: "rectify",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          routeBasePath: "/",
          editUrl:
            "https://github.com/Rectify-Teams/rectify/tree/main/apps/rectify-docusaurus/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "dark",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Rectify",
        logo: {
          alt: "Rectify Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "learnSidebar",
            position: "left",
            label: "Learn",
          },
          {
            type: "docSidebar",
            sidebarId: "apiSidebar",
            position: "left",
            label: "API",
          },
          {
            type: "docSidebar",
            sidebarId: "routerSidebar",
            position: "left",
            label: "Router",
          },
          {
            href: "https://github.com/Rectify-Teams/rectify",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              { label: "Introduction", to: "/" },
              { label: "Hooks", to: "/api/hooks/use-state" },
              { label: "Router", to: "/router/browser-router" },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/Rectify-Teams/rectify",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Rectify Teams. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ["bash", "diff", "json"],
      },
    }),
};

export default config;
