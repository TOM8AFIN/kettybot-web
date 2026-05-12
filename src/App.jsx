import React, { useMemo, useState } from "react";
import CallTab from "./tabs/CallTab.jsx";
import SystemTab from "./tabs/SystemTab.jsx";

export default function App() {
  const [tab, setTab] = useState("call");
  const build = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Industrial Robot Console</div>
          <div className="brand">KettyBot Control</div>
        </div>
        <div className="badge">Build: {build}</div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={`tabBtn ${tab === "call" ? "active" : ""}`}
            onClick={() => setTab("call")}
          >
            Llamar
          </button>
          <button
            className={`tabBtn ${tab === "system" ? "active" : ""}`}
            onClick={() => setTab("system")}
          >
            Sistema
          </button>
        </div>

        {tab === "call" ? <CallTab /> : <SystemTab />}
      </div>

      <div style={{ marginTop: 12 }} className="small">
        Nota: La firma HMAC y secretos viven en Netlify Functions. El navegador solo llama a <b>/api/*</b>.
      </div>
    </div>
  );
}