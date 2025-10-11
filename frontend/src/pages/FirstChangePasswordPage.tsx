import { useState } from "react";

export default function FirstChangePasswordPage() {
  const [oldPassword, setOld] = useState("");
  const [newPass, setNew] = useState("");
  const [newPass2, setNew2] = useState("");
  const token = localStorage.getItem("token");

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== newPass2) { alert("Hasła różnią się"); return; }

    const username = JSON.parse(atob((token || "").split(".")[1])).username; // quick parse

    const res = await fetch("http://localhost:3000/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, oldPassword, newPassword: newPass })
    });

    if (res.ok) {
      alert("Hasło zmienione. Zaloguj ponownie.");
      localStorage.removeItem("token");
      window.location.href = "/";
    } else {
      const data = await res.json();
      alert(data.error || "Błąd");
    }
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div style={{ width: 400 }}>
        <div className="card p-4">
          <h5>Zmiana hasła</h5>
          <form onSubmit={handle}>
            <div className="mb-3">
              <label>Stare hasło</label>
              <input type="password" className="form-control" value={oldPassword} onChange={e => setOld(e.target.value)} required/>
            </div>
            <div className="mb-3">
              <label>Nowe hasło</label>
              <input type="password" className="form-control" value={newPass} onChange={e => setNew(e.target.value)} required/>
            </div>
            <div className="mb-3">
              <label>Powtórz nowe hasło</label>
              <input type="password" className="form-control" value={newPass2} onChange={e => setNew2(e.target.value)} required/>
            </div>
            <button className="btn btn-primary w-100">Zmień hasło</button>
          </form>
        </div>
      </div>
    </div>
  );
}