import { useState } from "react";

interface Props {
  reload: () => void;
}

export default function AddUserForm({ reload }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [fullName, setFullName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password, role, fullName }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(JSON.stringify(data, null, 2));
      return;
    }

    setUsername("");
    setPassword("");
    setFullName("");
    reload();
  }

  return (
    <div className="card p-4 mt-4 shadow-sm">
      <h5>Dodaj użytkownika</h5>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Pełna nazwa"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="password"
            className="form-control"
            placeholder="Hasło (min 14 znaków)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={14}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="col-md-1">
          <button className="btn btn-success w-100">Dodaj</button>
        </div>
      </form>
    </div>
  );
}
