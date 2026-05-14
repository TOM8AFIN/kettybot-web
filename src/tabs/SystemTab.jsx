import React, { useState } from "react";

export default function SystemTab() {
  const [statusLine, setStatusLine] = useState(
    "Presiona actualizar para consultar el estado del robot."
  );

  const [loading, setLoading] = useState(false);

  function formatTimeAgo(seconds) {
    if (seconds < 60) {
      return `${seconds} segundos`;
    }

    const mins = Math.floor(seconds / 60);

    if (mins < 60) {
      return `${mins} minuto${mins > 1 ? "s" : ""}`;
    }

    const hours = Math.floor(mins / 60);

    return `${hours} hora${hours > 1 ? "s" : ""}`;
  }

  async function refreshStatus() {
    setLoading(true);

    try {
      const res = await fetch("/api/status");
      const json = await res.json();

      const d = json?.data?.data || {};

      const runState = d.run_state || "UNKNOWN";

      const ts = Number(d.timestamp);

      let freshness = "";
      let ago = "";

      if (ts) {
        const now = Math.floor(Date.now() / 1000);

        const diff = Math.max(0, now - ts);

        ago = formatTimeAgo(diff);

        if (diff < 120) {
          freshness = "🟢 En vivo";
        } else {
          freshness = "📦 Cache";
        }
      }

      let stateText = "Robot disponible";

      if (runState === "BUSY") {
        stateText = "🤖 Robot ocupado";
      }

      if (runState === "OFFLINE") {
        stateText = "🔴 Robot sin conexión";
      }

      if (runState === "DISABLE") {
        stateText = "🟠 Robot no disponible";
      }

      setStatusLine(
        `${freshness} · ${stateText} · Actualizado hace ${ago}`
      );
    } catch {
      setStatusLine(
        "❌ No fue posible consultar el estado del robot"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="subcard">
        <button
          className="btn orange"
          onClick={refreshStatus}
          disabled={loading}
        >
          {loading
            ? "Consultando..."
            : "Actualizar Estado"}
        </button>

        <div style={{ height: 18 }} />

        <div className="statusLine">
          {statusLine}
        </div>
      </div>
    </div>
  );
}