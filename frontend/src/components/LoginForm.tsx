import { useState, useEffect } from "react";
import ImageCaptcha from "./ImageCaptcha";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

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

  const handleCaptchaVerify = (isVerified: boolean): void => {
    setCaptchaVerified(isVerified);
    if (!isVerified) {
      setError("Captcha verification failed. Please try again.");
    } else {
      setError("");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check if captcha is verified
    if (!captchaVerified) {
      setError("Please complete the captcha verification first.");
      return;
    }

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
        if (data.role === "MANAGER") window.location.href = "/user";
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
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Hasło</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <ImageCaptcha onVerify={handleCaptchaVerify} />
        </div>
        <button
          className="btn btn-primary w-100"
          type="submit"
          disabled={!!blockedUntil || !captchaVerified}
        >
          Zaloguj
        </button>
      </form>
      {error && (
        <p className="text-danger mt-3 text-center">
          {error} {countdown && ` - odblokowanie za ${countdown}`}
        </p>
      )}
      {!captchaVerified && (
        <p className="text-warning mt-2 text-center small">
          ⚠️ Complete captcha verification to enable login
        </p>
      )}
    </div>
  );
}
