import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { paquetesAPI } from "../api/paquetes";

function PaqueteCard({ paquete, onClick }) {
  const precioFormato = parseFloat(paquete.precio).toLocaleString("es-CO");
  const precioPorClase = Math.round(
    parseFloat(paquete.precio) / parseInt(paquete.num_clases),
  ).toLocaleString("es-CO");

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--color-bg-primary)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 4,
          }}
        >
          {paquete.nombre}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {paquete.num_clases} clases
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
            ·
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {paquete.vigencia_dias} días
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
            ·
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            ${precioPorClase}/clase
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          ${precioFormato}
        </div>
      </div>
    </div>
  );
}

export default function Paquetes() {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paquetesAPI
      .listar()
      .then(setPaquetes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0 16px",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Paquetes</h1>
        <button
          onClick={() => navigate("/paquetes/nuevo")}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "var(--color-bg-primary)",
            border: "0.5px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          Cargando...
        </p>
      ) : paquetes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              marginBottom: 16,
            }}
          >
            No hay paquetes creados aún.
          </p>
          <button
            onClick={() => navigate("/paquetes/nuevo")}
            style={{
              padding: "10px 20px",
              background: "var(--color-text-primary)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Crear primer paquete
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              marginBottom: 12,
            }}
          >
            {paquetes.length} paquete{paquetes.length !== 1 ? "s" : ""} activo
            {paquetes.length !== 1 ? "s" : ""}
          </div>
          {paquetes.map((p) => (
            <PaqueteCard
              key={p.paquete_id}
              paquete={p}
              onClick={() => navigate(`/paquetes/${p.paquete_id}/editar`)}
            />
          ))}
        </>
      )}
    </PageLayout>
  );
}
