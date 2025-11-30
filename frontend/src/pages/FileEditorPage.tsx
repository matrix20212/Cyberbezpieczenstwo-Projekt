import { useEffect, useState } from "react";

export default function FileEditorPage() {
  const [licensed, setLicensed] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [fileText, setFileText] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/license/status")
      .then(res => res.json())
      .then(data => setLicensed(data.licensed));
  }, []);

  async function verifyLicense() {
    const res = await fetch("http://localhost:3000/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: licenseKey })
    });

    if (res.ok) setLicensed(true);
    else alert("Zły klucz licencyjny");
  }

  if (!licensed) {
    return (
      <div className="container mt-4">
        <h3>Licencja wymagana</h3>
        <p>Limit trial wykorzystany. Wprowadź klucz licencyjny:</p>
        <input className="form-control" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
        <button className="btn btn-primary mt-2" onClick={verifyLicense}>Aktywuj</button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Edytor plików tekstowych</h3>
      <textarea
        className="form-control"
        rows={12}
        value={fileText}
        onChange={(e) => setFileText(e.target.value)}
      />
      <button className="btn btn-success mt-2">Zapisz plik</button>
    </div>
  );
}
