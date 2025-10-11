import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface UserData {
  username: string;
  role: string;
  mustChangePassword: boolean;
}

export default function UserPage() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({
      username: payload.username,
      role: payload.role,
      mustChangePassword: payload.mustChangePassword,
    });
    setLoading(false);
  }, [token]);

  if (!token) return <Navigate to="/" />;
  if (loading) return <div>Ładowanie...</div>;
  if (!user) return <div>Błąd użytkownika</div>;

  return (
    <div className="container mt-5">
      <h2>Panel użytkownika</h2>
      <p>Witaj, {user.username}</p>
    </div>
  );
}
