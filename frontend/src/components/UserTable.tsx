interface Props {
  users: any[];
  reload: () => void;
}

export default function UserTable({ users, reload }: Props) {
  const token = localStorage.getItem("token");

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

  return (
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
          users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{u.blocked ? "✅" : "❌"}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleBlock(u.username)}>Zablokuj</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.username)}>Usuń</button>
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
  );
}
