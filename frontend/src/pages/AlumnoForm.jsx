import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alumnosAPI } from "../api/alumnos";

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

export default function AlumnoForm({ alumno = null }) {
  const navigate = useNavigate();
  const esEdicion = !!alumno;

  const [form, setForm] = useState({
    nombre: alumno?.nombre || "",
    telefono: alumno?.telefono || "",
    email: alumno?.email || "",
    notas: alumno?.notas || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!form.telefono.trim()) {
      setError("El teléfono es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (esEdicion) {
        await alumnosAPI.actualizar(alumno.alumno_id, form);
        navigate(`/alumnos/${alumno.alumno_id}`, { replace: true });
      } else {
        const nuevo = await alumnosAPI.crear(form);
        navigate(`/alumnos/${nuevo.alumno_id}`, { replace: true });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleArchivar = async () => {
    if (!confirm("¿Archivar este alumno? Podrás reactivarlo después.")) return;
    setLoading(true);
    try {
      await alumnosAPI.actualizar(alumno.alumno_id, { activo: false });
      navigate("/alumnos", { replace: true });
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 0 20px",
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
          {esEdicion ? "Editar alumno" : "Nuevo alumno"}
        </h1>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Field label="Nombre completo *">
          <input
            value={form.nombre}
            onChange={set("nombre")}
            placeholder="Ej. Carlos Pérez"
            style={INPUT_STYLE}
          />
        </Field>

        <Field label="Teléfono *">
          <input
            value={form.telefono}
            onChange={set("telefono")}
            placeholder="+57 310 000 0000"
            style={INPUT_STYLE}
          />
        </Field>

        <Field label="Email">
          <input
            value={form.email}
            onChange={set("email")}
            placeholder="carlos@email.com"
            type="email"
            style={INPUT_STYLE}
          />
        </Field>

        <Field label="Observaciones">
          <textarea
            value={form.notas}
            onChange={set("notas")}
            placeholder="Notas generales sobre el alumno..."
            rows={3}
            style={{ ...INPUT_STYLE, resize: "vertical", lineHeight: 1.5 }}
          />
        </Field>

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
            padding: "12px",
            background: loading
              ? "var(--color-text-tertiary)"
              : "var(--color-text-primary)",
            color: "var(--color-bg-primary)",
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
              : "Crear alumno"}
        </button>

        {esEdicion && (
          <button
            onClick={handleArchivar}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "none",
              color: "var(--color-danger)",
              border: "0.5px solid var(--color-danger)",
              borderRadius: 12,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Archivar alumno
          </button>
        )}
      </div>
    </div>
  );
}
