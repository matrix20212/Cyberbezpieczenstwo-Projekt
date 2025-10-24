import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_TIMEOUT_SECONDS = 1 * 60; //5 minut

export default function SessionHandler({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_TIMEOUT_SECONDS);
  const navigate = useNavigate();

  useEffect(() => {
    const resetTimer = () => setTimeLeft(SESSION_TIMEOUT_SECONDS);

    // reset timer przy aktywności użytkownika
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    // odliczanie co sekundę
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          localStorage.removeItem("token");
          alert("Twoja sesja wygasła z powodu bezczynności");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate]);

  return <>{children}</>;
}
