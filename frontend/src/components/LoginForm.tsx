import { useState, useEffect } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!blockedUntil) return;
    const interval = setInterval(() => {
      const msLeft = blockedUntil.getTime() - Date.now();
      if (msLeft <= 0) {
        setBlockedUntil(null);
        setCountdown("");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(msLeft / 60000);
        const seconds = Math.floor((msLeft % 60000) / 1000);
        setCountdown(`${minutes} min ${seconds} sek`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

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
      if (data.mustChangePassword) {
        window.location.href = "/first-change-password";
      } else {
        if (data.role === "ADMIN") window.location.href = "/admin";
        if (data.role === "USER") window.location.href = "/user";
      }
    } else {
      if (data.blockedUntil) {
        setError("Konto zablokowane");
        setBlockedUntil(new Date(data.blockedUntil));
      } else {
        setError(data.error || "Błąd logowania");
      }
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
        <button className="btn btn-primary w-100" type="submit" disabled={!!blockedUntil}>
          Zaloguj
        </button>
      </form>
      {error && (
        <p className="text-danger mt-3 text-center">
          {error} {countdown && ` - odblokowanie za ${countdown}`}
        </p>
      )}
    </div>
  );
}
