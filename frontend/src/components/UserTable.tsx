import { useState } from "react";

interface Props {
  users: any[];
  reload: () => void;
}

export default function UserTable({ users, reload }: Props) {
  const token = localStorage.getItem("token");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    role: "USER",
    blocked: false,
    newPassword: "",
  });

  function handleEditClick(u: any) {
    setEditingUser(u);
    setFormData({
      username: u.username,
      role: u.role,
      blocked: u.blocked,
      newPassword: "",
    });
  }

  async function handleDelete(username: string) {
    await fetch(`http://localhost:3000/admin/users/${username}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    reload();
  }

  async function handleBlock(username: string) {
    await fetch(`http://localhost:3000/admin/block/${username}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    reload();
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    const body: any = {
      username: formData.username,
      fullName: formData,
      blocked: formData.blocked,
    };

    if (formData.newPassword.trim() !== "") {
      body.newPassword = formData.newPassword;
      body.mustChangePassword = true;
    }

    const res = await fetch(`http://localhost:3000/admin/users/${editingUser.username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingUser(null);
      reload();
    } else {
      const err = await res.json();
      alert(err.message || "Błąd podczas zapisu");
    }
  }

  return (
    <div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Użytkownik</th>
            <th>Rola</th>
            <th>Blokada</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{u.blocked ? "✅" : "❌"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary me-2"
                    onClick={() => handleEditClick(u)}
                  >
                    Edytuj
                  </button>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleBlock(u.username)}
                  >
                    Zablokuj
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u.username)}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>Brak użytkowników</td>
            </tr>
          )}
        </tbody>
      </table>

      {editingUser && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Edytuj użytkownika: {editingUser.username}</h5>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
                  <label>Nazwa użytkownika</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Rola</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="blocked"
                    checked={formData.blocked}
                    onChange={(e) =>
                      setFormData({ ...formData, blocked: e.target.checked })
                    }
                  />
                  <label htmlFor="blocked" className="form-check-label">
                    Zablokowany
                  </label>
                </div>

                <div className="mb-3">
                  <label>Nowe hasło (pozostaw puste, aby nie zmieniać)</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => setEditingUser(null)}
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Zapisz
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
