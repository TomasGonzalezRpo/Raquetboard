import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alumnos } from "../api/index";

export default function NuevoAlumno() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", notas: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!form.nombre.trim()) { setError("El nombre es requerido"); return; }
    setSubmitting(true);
    setError("");
    try {
      await alumnos.crear({ nombre: form.nombre.trim(), notas: form.notas.trim() || undefined });
      navigate("/alumnos");
    } catch (e) {
      setError(e.message || "Error al crear el alumno");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(-1)} style={{ color: "rgba(255,255,255,0.7)", padding: 4 }}><ChevLeft /></button>
          <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 500, flex: 1 }}>Nuevo alumno</h1>
        </div>
      </div>

      <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card">
          <Campo label="Nombre">
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre completo"
              autoFocus
              style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 500, outline: "none", color: "var(--gray-900)", textAlign: "right", flex: 1 }}
            />
          </Campo>
          <Campo label="Notas" last>
            <input
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              placeholder="Opcional..."
              style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", color: "var(--gray-900)", textAlign: "right", flex: 1 }}
            />
          </Campo>
        </div>

        {error && (
          <div style={{ background: "var(--coral-light)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#7a2e00" }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Guardando..." : "Crear alumno"}
        </button>
      </div>
    </div>
  );
}

function Campo({ label, children, last }) {
  return (
    <div style={{ padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: last ? "none" : "0.5px solid var(--gray-200)" }}>
      <span style={{ fontSize: 12, color: "var(--gray-500)", flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function ChevLeft() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
