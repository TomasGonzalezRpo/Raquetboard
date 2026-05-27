import { useState, useEffect } from "react";
import { reservasAPI } from "../api/reservas";
import { alumnosAPI } from "../api/alumnos";
import { canchasAPI } from "../api/canchas";

const INPUT_STYLE = {
  width: "100%",
  background: "var(--color-bg-secondary)",
  border: "0.5px solid var(--color-border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--color-text-primary)",
  outline: "none",
};

export default function ReservaForm({
  reserva = null,
  fechaInicial = null,
  onClose,
  onSaved,
}) {
  const esEdicion = !!reserva;

  const [alumnos, setAlumnos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [form, setForm] = useState({
    alumno_id: reserva?.alumno_id || "",
    cancha_id: reserva?.cancha_id || "",
    fecha:
      reserva?.fecha || fechaInicial || new Date().toISOString().split("T")[0],
    hora_inicio: reserva?.hora_inicio || "08:00",
    hora_fin: reserva?.hora_fin || "09:00",
    notas: reserva?.notas || "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([alumnosAPI.listar(), canchasAPI.listar()])
      .then(([a, c]) => {
        setAlumnos(a);
        setCanchas(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.alumno_id) {
      setError("Selecciona un alumno");
      return;
    }
    if (!form.cancha_id) {
      setError("Selecciona una cancha");
      return;
    }
    if (!form.fecha) {
      setError("La fecha es obligatoria");
      return;
    }
    if (form.hora_inicio >= form.hora_fin) {
      setError("La hora de fin debe ser mayor a la de inicio");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (esEdicion) {
        await reservasAPI.actualizar(reserva.reserva_id, form);
      } else {
        await reservasAPI.crear(form);
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setSaving(true);
    try {
      await reservasAPI.actualizar(reserva.reserva_id, { estado: "cancelada" });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConvertir = async () => {
    if (!confirm("¿Registrar esta reserva como clase dada?")) return;
    setSaving(true);
    try {
      await reservasAPI.convertirClase(reserva.reserva_id);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-bg-primary)",
          borderRadius: "20px 20px 0 0",
          padding: "12px 16px 32px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 32,
            height: 3,
            background: "var(--color-border)",
            borderRadius: 2,
            margin: "0 auto 16px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 500 }}>
            {esEdicion ? "Editar reserva" : "Nueva reserva"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              padding: "20px 0",
            }}
          >
            Cargando...
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Alumno *
              </label>
              <select
                value={form.alumno_id}
                onChange={set("alumno_id")}
                style={INPUT_STYLE}
              >
                <option value="">Seleccionar alumno...</option>
                {alumnos.map((a) => (
                  <option key={a.alumno_id} value={a.alumno_id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Cancha *
              </label>
              <select
                value={form.cancha_id}
                onChange={set("cancha_id")}
                style={INPUT_STYLE}
              >
                <option value="">Seleccionar cancha...</option>
                {canchas.map((c) => (
                  <option key={c.cancha_id} value={c.cancha_id}>
                    {c.nombre} — {c.ubicacion}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Fecha *
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={set("fecha")}
                style={INPUT_STYLE}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    marginBottom: 5,
                    display: "block",
                  }}
                >
                  Hora inicio *
                </label>
                <input
                  type="time"
                  value={form.hora_inicio}
                  onChange={set("hora_inicio")}
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    marginBottom: 5,
                    display: "block",
                  }}
                >
                  Hora fin *
                </label>
                <input
                  type="time"
                  value={form.hora_fin}
                  onChange={set("hora_fin")}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Notas
              </label>
              <input
                value={form.notas}
                onChange={set("notas")}
                placeholder="Ej. Llevar pelotas..."
                style={INPUT_STYLE}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "var(--color-danger-light)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--color-danger)",
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                width: "100%",
                padding: 12,
                background: saving
                  ? "var(--color-text-tertiary)"
                  : "var(--color-text-primary)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: saving ? "not-allowed" : "pointer",
                marginBottom: 10,
              }}
            >
              {saving
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear reserva"}
            </button>

            {esEdicion && reserva.estado !== "cancelada" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <button
                  onClick={handleConvertir}
                  disabled={saving}
                  style={{
                    padding: "10px",
                    background: "var(--color-success-light)",
                    color: "var(--color-success)",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  ✓ Marcar dada
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={saving}
                  style={{
                    padding: "10px",
                    background: "none",
                    color: "var(--color-danger)",
                    border: "0.5px solid var(--color-danger)",
                    borderRadius: 10,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
