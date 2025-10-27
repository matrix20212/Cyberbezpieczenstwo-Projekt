import { useEffect, useState } from "react";

export default function SettingsPanel({ reload }: { reload?: () => void }) {
  const [minLength, setMinLength] = useState(6);
  const [requireDigit, setRequireDigit] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(false);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(false);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(15);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);

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
        setMaxLoginAttempts(s.maxLoginAttempts ?? 5);
        setLockoutDurationMinutes(s.lockoutDurationMinutes ?? 15);
        setSessionTimeoutMinutes(s.sessionTimeoutMinutes ?? 30);
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
        maxLoginAttempts,
        lockoutDurationMinutes,
        sessionTimeoutMinutes,
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

      <hr className="my-3" />
      <h5>Bezpieczeństwo logowania</h5>

      <div className="mb-2">
        <label className="form-label">Maksymalna liczba prób logowania</label>
        <input
          type="number"
          className="form-control"
          value={maxLoginAttempts}
          onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
          min="3"
          max="10"
        />
        <small className="form-text text-muted">Zalecane: 3-5 prób</small>
      </div>

      <div className="mb-2">
        <label className="form-label">Czas blokady konta (minuty)</label>
        <input
          type="number"
          className="form-control"
          value={lockoutDurationMinutes}
          onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
          min="5"
          max="60"
        />
        <small className="form-text text-muted">Zalecane: 15-30 minut</small>
      </div>

      <div className="mb-2">
        <label className="form-label">
          Automatyczne wylogowanie po bezczynności (minuty)
        </label>
        <input
          type="number"
          className="form-control"
          value={sessionTimeoutMinutes}
          onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
          min="5"
          max="120"
        />
        <small className="form-text text-muted">
          Zalecane: 15-30 minut dla aplikacji standardowych, 2-5 minut dla
          wrażliwych danych
        </small>
      </div>

      <button className="btn btn-primary" onClick={save}>
        Zapisz ustawienia
      </button>
    </div>
  );
}
