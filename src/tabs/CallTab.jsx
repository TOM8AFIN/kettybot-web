import React, { useMemo, useState } from "react";

const DEFAULT_POINTS = [
  { name: "Ascensores", type: "table" },
  { name: "Baños", type: "table" },
  { name: "Andromeda", type: "table" },
  { name: "Bienvenido", type: "table" },
  { name: "Pausa Angie", type: "table" },
  { name: "Salud", type: "usher" },
  { name: "Felicidad Recepcion", type: "usher" },
  { name: "1", type: "dining_outlet" },
];

export default function CallTab() {
  const [mapName, setMapName] = useState("0#0#LobbyGrupoAfin");
  const [deviceName, setDeviceName] = useState("Terminal-GrupoAfin");
  const [point, setPoint] = useState(DEFAULT_POINTS[0].name);
  const [pointType, setPointType] = useState(DEFAULT_POINTS[0].type);

  const [priority, setPriority] = useState(1);
  const [doNotQueue, setDoNotQueue] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pointsByName = useMemo(() => {
    const m = new Map();
    for (const p of DEFAULT_POINTS) m.set(p.name, p.type);
    return m;
  }, []);

  function onPointChange(v) {
    setPoint(v);
    setPointType(pointsByName.get(v) || "table");
  }

  async function sendCall() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/customCall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          map_name: mapName,
          point,
          point_type: pointType,
          call_device_name: deviceName,
          call_mode: "CALL",
          do_not_queue: doNotQueue,
          priority,
        }),
      });

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
        <div className="label">Mapa</div>
        <input
          className="input"
          value={mapName}
          onChange={(e) => setMapName(e.target.value)}
          placeholder="0#0#LobbyGrupoAfin"
        />

        <div style={{ height: 12 }} />

        <div className="label">Punto</div>
        <select className="select" value={point} onChange={(e) => onPointChange(e.target.value)}>
          {DEFAULT_POINTS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <div style={{ height: 12 }} />

        <div className="label">Tipo de punto</div>
        <input className="input" value={pointType} readOnly />

        <div style={{ height: 12 }} />

        <div className="label">Nombre del dispositivo</div>
        <input
          className="input"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="Terminal-GrupoAfin"
        />

        <div style={{ height: 12 }} />

        <div className="row">
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="label">Prioridad</div>
            <input
              className="input"
              type="number"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="label">No encolar</div>
            <select
              className="select"
              value={doNotQueue ? "true" : "false"}
              onChange={(e) => setDoNotQueue(e.target.value === "true")}
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <button className="btn primary" onClick={sendCall} disabled={loading}>
          {loading ? "Enviando..." : "Enviar Llamada"}
        </button>

        <div style={{ marginTop: 10 }} className="small">
          Nota: para KettyBot, <b>call_mode = CALL</b>.
        </div>
      </div>

      <div className="subcard">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="badge">Respuesta</div>
          <div className="small">
            {loading ? "Enviando..." : result?.ok ? "✅ OK" : result ? "❌ Error / Warning" : "—"}
          </div>
        </div>

        <div style={{ height: 10 }} />

        <pre>{result ? JSON.stringify(result, null, 2) : "Haz una llamada para ver la respuesta aquí."}</pre>
      </div>
    </div>
  );
}