import { Link } from "@rectify-dev/router";

const USERS = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

export function UserList() {
  return (
    <div>
      <h2>👥 Users</h2>
      <ul style={{ lineHeight: 2 }}>
        {USERS.map((u) => (
          <li key={u.id}>
            <Link to={`/users/${u.id}`} style={{ color: "#89b4fa" }}>
              {u.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
