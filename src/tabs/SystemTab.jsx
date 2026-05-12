import React, { useState } from "react";

export default function SystemTab() {
  const [sn, setSn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function callApi(url, opts = {}) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(url, opts);
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setResult({ ok: false, message: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="subcard">
        <div className="label">SN (opcional para status)</div>
        <input
          className="input"
          value={sn}
          onChange={(e) => setSn(e.target.value)}
          placeholder="Deja vacío para usar PUDU_SN"
        />

        <div style={{ height: 14 }} />

        <div className="row" style={{ alignItems: "stretch" }}>
          <button
            className="btn primary"
            onClick={() => callApi("/api/healthCheck", { method: "POST" })}
            disabled={loading}
          >
            {loading ? "Consultando..." : "HealthCheck"}
          </button>

          <button
            className="btn"
            onClick={() => callApi("/api/mapCurrent")}
            disabled={loading}
          >
            Get Map Current
          </button>

          <button
            className="btn"
            onClick={() => callApi(`/api/status${sn ? `?sn=${encodeURIComponent(sn)}` : ""}`)}
            disabled={loading}
          >
            Status
          </button>
        </div>

        <div style={{ marginTop: 12 }} className="small">
          Tip: si ves <b>CLOUD_OPEN_TIMEOUT</b>, consulta Status: puede que esté en <b>BUSY</b>.
        </div>
      </div>

      <div className="subcard">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="badge">Respuesta</div>
          <div className="small">
            {loading ? "Consultando..." : result?.ok ? "✅ OK" : result ? "❌ Error" : "—"}
          </div>
        </div>

        <div style={{ height: 10 }} />

        <pre>{result ? JSON.stringify(result, null, 2) : "Presiona un botón para ver la respuesta aquí."}</pre>
      </div>
    </div>
  );
}