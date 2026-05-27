import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { paquetesAPI } from "../api/paquetes";

const INPUT_STYLE = {
  width: "100%",
  background: "var(--color-bg-primary)",
  border: "0.5px solid var(--color-border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--color-text-primary)",
  outline: "none",
};

const LABEL_STYLE = {
  fontSize: 12,
  color: "var(--color-text-secondary)",
  marginBottom: 5,
  display: "block",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

export default function PaqueteForm({ paquete = null }) {
  const navigate = useNavigate();
  const esEdicion = !!paquete;

  const [form, setForm] = useState({
    nombre: paquete?.nombre || "",
    num_clases: paquete?.num_clases || "",
    precio: paquete?.precio || "",
    vigencia_dias: paquete?.vigencia_dias || "30",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!form.num_clases || isNaN(form.num_clases)) {
      setError("El número de clases es obligatorio");
      return;
    }
    if (!form.precio || isNaN(form.precio)) {
      setError("El precio es obligatorio");
      return;
    }
    if (!form.vigencia_dias || isNaN(form.vigencia_dias)) {
      setError("La vigencia es obligatoria");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = {
        nombre: form.nombre,
        num_clases: parseInt(form.num_clases),
        precio: parseFloat(form.precio),
        vigencia_dias: parseInt(form.vigencia_dias),
      };
      if (esEdicion) {
        await paquetesAPI.actualizar(paquete.paquete_id, data);
      } else {
        await paquetesAPI.crear(data);
      }
      navigate("/paquetes", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivar = async () => {
    if (
      !confirm(
        "¿Desactivar este paquete? No se podrá asignar a nuevos alumnos.",
      )
    )
      return;
    setLoading(true);
    try {
      await paquetesAPI.actualizar(paquete.paquete_id, { activo: false });
      navigate("/paquetes", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-secondary)",
        padding: "0 16px 32px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 0",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>
          {esEdicion ? "Editar paquete" : "Nuevo paquete"}
        </h1>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Field label="Nombre del paquete *">
          <input
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Ej. Plan mensual x8"
            style={INPUT_STYLE}
          />
        </Field>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field label="Número de clases *">
            <input
              value={form.num_clases}
              onChange={set("num_clases")}
              placeholder="8"
              type="number"
              min="1"
              style={INPUT_STYLE}
            />
          </Field>
          <Field label="Vigencia (días) *">
            <input
              value={form.vigencia_dias}
              onChange={set("vigencia_dias")}
              placeholder="30"
              type="number"
              min="1"
              style={INPUT_STYLE}
            />
          </Field>
        </div>

        <Field label="Precio *">
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: "var(--color-text-secondary)",
              }}
            >
              $
            </span>
            <input
              value={form.precio}
              onChange={set("precio")}
              placeholder="320000"
              type="number"
              min="0"
              style={{ ...INPUT_STYLE, paddingLeft: 24 }}
            />
          </div>
        </Field>

        {/* Preview */}
        {form.nombre && form.num_clases && form.precio && (
          <div
            style={{
              background: "var(--color-primary-light)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--color-primary)",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Vista previa
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {form.nombre}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginTop: 2,
              }}
            >
              {form.num_clases} clases · {form.vigencia_dias} días · $
              {parseFloat(form.precio || 0).toLocaleString("es-CO")}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "var(--color-danger-light)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--color-danger)",
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: loading
              ? "var(--color-text-tertiary)"
              : "var(--color-text-primary)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 12,
          }}
        >
          {loading
            ? "Guardando..."
            : esEdicion
              ? "Guardar cambios"
              : "Crear paquete"}
        </button>

        {esEdicion && (
          <button
            onClick={handleDesactivar}
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: "none",
              color: "var(--color-danger)",
              border: "0.5px solid var(--color-danger)",
              borderRadius: 12,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Desactivar paquete
          </button>
        )}
      </div>
    </div>
  );
}
