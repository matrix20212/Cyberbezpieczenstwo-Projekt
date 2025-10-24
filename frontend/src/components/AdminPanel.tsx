import { useEffect, useState } from "react";
import UserTable from "./UserTable";
import AddUserForm from "./AddUserForm";
import SettingsPanel from "./SettingsPanel";
import ActivityLogPanel from "./ActivityLogPanel";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>⚙️ Panel administratora</h2>
        <button className="btn btn-outline-danger" onClick={logout}>
          Wyloguj
        </button>
      </div>

      <AddUserForm reload={loadUsers} />
        <div className="row">
          <div className="col-md-8">
              <UserTable users={users} reload={loadUsers} />
          </div>
          <div className="col-md-4">
              <SettingsPanel reload={() => {}} />
          </div>
          <div className="mt-4">
            <ActivityLogPanel />
          </div>
        </div>
    </>
  );
}
