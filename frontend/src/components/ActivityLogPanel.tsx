import { useEffect, useState } from "react";

export default function ActivityLogPanel() {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/admin/logs", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setLogs);
  }, []);

  return (
    <div className="card p-3">
      <h5>Logi aktywności</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Użytkownik</th>
            <th>Akcja</th>
            <th>Status</th>
            <th>Opis</th>
            <th>Czas</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td>{l.username}</td>
              <td>{l.action}</td>
              <td>{l.success ? "✔️" : "❌"}</td>
              <td>{l.message}</td>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
