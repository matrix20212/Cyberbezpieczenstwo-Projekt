import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SessionHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch session timeout from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const settings = await response.json();
          const timeoutSeconds = (settings.sessionTimeoutMinutes || 30) * 60;
          setSessionTimeout(timeoutSeconds);
          setTimeLeft(timeoutSeconds);
        } else {
          // Fallback to default if fetch fails
          const defaultTimeout = 30 * 60; // 30 minutes
          setSessionTimeout(defaultTimeout);
          setTimeLeft(defaultTimeout);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // Fallback to default
        const defaultTimeout = 30 * 60;
        setSessionTimeout(defaultTimeout);
        setTimeLeft(defaultTimeout);
      }
    };

    fetchSettings();
  }, [token]);

  useEffect(() => {
    if (sessionTimeout === null || timeLeft === null) return;

    const resetTimer = () => setTimeLeft(sessionTimeout);

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;

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
  }, [navigate, sessionTimeout, timeLeft]);

  if (sessionTimeout === null) {
    return <div>Ładowanie...</div>;
  }

  return <>{children}</>;
}
