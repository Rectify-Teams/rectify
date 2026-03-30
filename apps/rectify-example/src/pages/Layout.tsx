import { NavLink, Outlet } from "@rectify-dev/router";

const navStyle = {
  display: "flex",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  background: "#1e1e2e",
  borderBottom: "1px solid #313244",
};

const linkStyle = {
  color: "#cdd6f4",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "0.95rem",
};

export function Layout() {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#1e1e2e", color: "#cdd6f4" }}>
      <nav style={navStyle}>
        <NavLink to="/" end style={linkStyle} activeClassName="nav-active">
          Home
        </NavLink>
        <NavLink to="/about" style={linkStyle} activeClassName="nav-active">
          About
        </NavLink>
        <NavLink to="/users" end={false} style={linkStyle} activeClassName="nav-active">
          Users
        </NavLink>
      </nav>
      <main style={{ padding: "2rem 1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
