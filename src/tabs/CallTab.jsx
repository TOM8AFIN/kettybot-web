import React, { useState } from "react";

const POINTS = [
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
  const [loadingPoint, setLoadingPoint] = useState(null);
  const [toast, setToast] = useState("");

  async function callRobot(point, point_type) {
    setLoadingPoint(point);

    try {
      await fetch("/api/customCall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          point,
          point_type,
          call_mode: "CALL",
        }),
      });

      setToast(`✅ Robot en camino a ${point}`);
    } catch {
      setToast("❌ No fue posible enviar la llamada");
    } finally {
      setLoadingPoint(null);

      setTimeout(() => {
        setToast("");
      }, 3500);
    }
  }

  return (
    <div className="pointGrid">
      {POINTS.map((p) => (
        <button
          key={p.name}
          className="pointBtn"
          onClick={() => callRobot(p.name, p.type)}
          disabled={loadingPoint !== null}
        >
          {loadingPoint === p.name
            ? "Enviando..."
            : p.name}

          <div className="pointType">
            {p.type}
          </div>
        </button>
      ))}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}