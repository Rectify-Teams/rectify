import { NavLink, Link } from "@rectify-dev/router";

type NavItem = { label: string; to: string };
type NavGroup = { heading: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    heading: "Getting Started",
    items: [
      { label: "Introduction",        to: "/learn/introduction" },
      { label: "Installation",        to: "/learn/installation" },
    ],
  },
  {
    heading: "Guides",
    items: [
      { label: "Components",          to: "/learn/components" },
      { label: "Hooks",               to: "/learn/hooks" },
      { label: "Routing",             to: "/learn/routing" },
    ],
  },
  {
    heading: "API Reference",
    items: [
      { label: "Core",                to: "/api/core" },
      { label: "Router",              to: "/api/router" },
    ],
  },
];

type LayoutProps = { children?: any };

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 h-14 z-50 flex items-center px-6 gap-8 bg-[#08080f]/80 backdrop-blur-md border-b border-white/[0.06]">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-white no-underline hover:no-underline"
        >
          <span className="text-violet-400 text-xl">⬡</span>
          <span className="tracking-tight text-[1.05rem]">Rectify</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/learn/introduction"
            end={false}
            className="text-sm text-slate-400 font-medium hover:text-white transition-colors no-underline"
            activeClassName="header-active"
          >
            Learn
          </NavLink>
          <NavLink
            to="/api/core"
            end={false}
            className="text-sm text-slate-400 font-medium hover:text-white transition-colors no-underline"
            activeClassName="header-active"
          >
            API
          </NavLink>
        </nav>

        <div className="ml-auto">
          <a
            href="https://github.com/rectify-teams/rectify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-slate-200 transition-colors no-underline"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex pt-14 min-h-screen">
        {/* Sidebar */}
        <aside className="fixed top-14 bottom-0 left-0 w-56 overflow-y-auto py-6 bg-[#0a0a12] border-r border-white/[0.06]">
          {NAV.map((group) => (
            <div key={group.heading} className="mb-7">
              <p className="px-5 mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-600">
                {group.heading}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="block px-5 py-1.5 text-[0.875rem] text-slate-400 hover:text-slate-200 transition-colors no-underline"
                  activeClassName="sidebar-active"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="ml-56 flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-10 py-12 prose">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
