import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import ChangePasswordPage from "./pages/FirstChangePasswordPage";

interface TokenPayload {
  username: string;
  role: "ADMIN" | "USER";
  mustChangePassword?: boolean;
}

export default function App() {
  const token = localStorage.getItem("token");
  let payload: TokenPayload | null = null;

  if (token) {
    try {
      payload = jwtDecode<TokenPayload>(token);
    } catch {
      localStorage.removeItem("token");
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route
          path="/first-change-password"
          element={payload?.mustChangePassword ? <ChangePasswordPage /> : <Navigate to="/" />}
        />

        <Route
          path="/change-password"
          element={<ChangePasswordPage />}
        />

        <Route
          path="/admin"
          element={payload?.role === "ADMIN" ? <AdminPage /> : <Navigate to="/" />}
        />

        <Route
          path="/user"
          element={payload?.role === "USER" ? <UserPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}
