import { Link } from "@rectify-dev/router";

export function Home() {
  return (
    <div>
      <h1>🏠 Home</h1>
      <p>Welcome to the Rectify Router demo.</p>
      <Link to="/users" style={{ color: "#89b4fa" }}>
        Browse users →
      </Link>
    </div>
  );
}
