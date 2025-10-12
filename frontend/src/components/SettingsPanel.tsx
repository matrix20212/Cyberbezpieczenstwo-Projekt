import { useEffect, useState } from "react";

export default function SettingsPanel({ reload }: { reload?: () => void }) {
  const [minLength, setMinLength] = useState(6);
  const [requireDigit, setRequireDigit] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(false);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(false);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);

  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      const r = await fetch("http://localhost:3000/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const s = await r.json();
        setMinLength(s.minLength ?? 6);
        setRequireDigit(!!s.requireDigit);
        setRequireUppercase(!!s.requireUppercase);
        setRequireLowercase(!!s.requireLowercase);
        setRequireSpecial(!!s.requireSpecial);
        setPasswordExpiryDays(s.passwordExpiryDays ?? 90);
      }
    })();
  }, []);

  async function save() {
    const r = await fetch("http://localhost:3000/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        minLength,
        requireDigit,
        requireUppercase,
        requireLowercase,
        requireSpecial,
        passwordExpiryDays,
      }),
    });
    if (r.ok) {
      alert("Ustawienia zapisane");
      if (reload) reload();
    } else {
      alert("Błąd zapisu ustawień");
    }
  }

  return (
    <div className="card p-3 shadow-sm">
      <h5>Polityka haseł</h5>

      <div className="mb-2 form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={requireDigit}
          onChange={(e) => setRequireDigit(e.target.checked)}
          id="digit"
        />
        <label className="form-check-label" htmlFor="digit">
          Wymagaj co najmniej jednej cyfry
        </label>
      </div>

      <div className="mb-2 form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={requireUppercase}
          onChange={(e) => setRequireUppercase(e.target.checked)}
          id="upper"
        />
        <label className="form-check-label" htmlFor="upper">
          Wymagaj wielkiej litery
        </label>
      </div>

      <div className="mb-2 form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={requireLowercase}
          onChange={(e) => setRequireLowercase(e.target.checked)}
          id="lower"
        />
        <label className="form-check-label" htmlFor="lower">
          Wymagaj małej litery
        </label>
      </div>

      <div className="mb-2 form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={requireSpecial}
          onChange={(e) => setRequireSpecial(e.target.checked)}
          id="spec"
        />
        <label className="form-check-label" htmlFor="spec">
          Wymagaj znaku specjalnego
        </label>
      </div>

      <div className="mb-2">
        <label className="form-label">Minimalna długość</label>
        <input
          type="number"
          className="form-control"
          value={minLength}
          onChange={(e) => setMinLength(Number(e.target.value))}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Ważność hasła (dni)</label>
        <input
          type="number"
          className="form-control"
          value={passwordExpiryDays}
          onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
        />
      </div>

      <button className="btn btn-primary" onClick={save}>
        Zapisz ustawienia
      </button>
    </div>
  );
}
