import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/admin";
    } else {
      setError(data.error || "Błąd logowania");
    }
  }

  return (
    <div className="card p-4 shadow">
      <h4 className="text-center mb-3">🔐 Logowanie</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Użytkownik</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Hasło</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">Zaloguj</button>
      </form>
      {error && <p className="text-danger mt-3 text-center">{error}</p>}
    </div>
  );
}
