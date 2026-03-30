import { useParams, useNavigate } from "@rectify-dev/router";

const USERS: Record<string, { name: string; role: string }> = {
  "1": { name: "Alice", role: "Admin" },
  "2": { name: "Bob", role: "Editor" },
  "3": { name: "Charlie", role: "Viewer" },
};

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = id ? USERS[id] : null;

  if (!user) {
    return (
      <div>
        <p>
          User <strong>{id}</strong> not found.
        </p>
        <button onClick={() => navigate("/users")}>← Back to users</button>
      </div>
    );
  }

  return (
    <div>
      <h2>🙍 {user.name}</h2>
      <p>
        Role: <strong>{user.role}</strong>
      </p>
      <p>
        ID: <code>{id}</code>
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{ marginTop: "1rem", cursor: "pointer" }}
      >
        ← Back
      </button>
    </div>
  );
}
