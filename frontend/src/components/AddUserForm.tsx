import { useState } from "react";

interface Props {
  reload: () => void;
}

export default function AddUserForm({ reload }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | "MANAGER">("USER");
  const [fullName, setFullName] = useState("");

  function generateOneTimePassword() {
    const a = username.length || 1;
    const x = Math.random();
    const result = Math.round(a / x).toString();
    const password = btoa(result.toString()).slice(0, 8);
    setPassword(password);

    alert("Wygenerowane hasło: "+ password)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
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
        alert(data.message || "Błąd podczas dodawania użytkownika");
        return;
      }

      alert("Użytkownik został dodany pomyślnie!");

      setUsername("");
      setPassword("");
      setFullName("");

      reload();
    } catch (err) {
      console.error("Błąd połączenia z serwerem:", err);
      alert("Nie udało się połączyć z serwerem.");
    }
  }

  return (
    <div className="card p-4 mt-4 shadow-sm">
      <h5>Dodaj użytkownika</h5>
      <form onSubmit={handleSubmit} className="row g-3 align-items-center">
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

        <div className="col-md-3 d-flex">
          <input
            type="password"
            className="form-control me-2"
            placeholder="Hasło (opcjonalne)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={generateOneTimePassword}
            title="Wygeneruj hasło jednorazowe"
          >
            Genetuj
          </button>
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value as "USER" | "ADMIN" | "MANAGER")}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
          </select>
        </div>

        <div className="col-md-1">
          <button className="btn btn-success w-100">Dodaj</button>
        </div>
      </form>
    </div>
  );
}
