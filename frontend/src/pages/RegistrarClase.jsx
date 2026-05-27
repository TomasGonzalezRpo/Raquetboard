import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { alumnosAPI } from "../api/alumnos";
import { clasesAPI } from "../api/clases";
import { inscripcionesAPI } from "../api/inscripciones";
import { formatDiasHasta, diasHasta } from "../utils/dates";

const COLORS = [
  ["var(--color-primary-light)", "var(--color-primary)"],
  ["var(--color-success-light)", "var(--color-success)"],
  ["#FAEEDA", "#854F0B"],
  ["#FBEAF0", "#993556"],
  ["#EEEDFE", "#3C3489"],
];

function Avatar({ nombre, size = 32 }) {
  const initials =
    nombre
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const [bg, color] = COLORS[nombre?.charCodeAt(0) % COLORS.length || 0];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 500,
      }}
    >
      {initials}
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div
      style={{
        height: 3,
        background: "var(--color-border)",
        borderRadius: 2,
        marginBottom: 24,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 2,
          background: "var(--color-text-primary)",
          width: `${(step / total) * 100}%`,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

export default function RegistrarClase() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedId = location.state?.alumno_id || null;

  const [step, setStep] = useState(1);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  // Selecciones
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [estado, setEstado] = useState("dada");
  const [apuntes, setApuntes] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    alumnosAPI
      .listar()
      .then((data) => {
        setAlumnos(data);
        // Si viene preseleccionado desde AlumnoDetalle
        if (preselectedId) {
          const alumno = data.find((a) => a.alumno_id === preselectedId);
          if (alumno) {
            setAlumnoSeleccionado(alumno);
            setInscripcion(alumno.inscripcion_activa || null);
            setStep(2);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const seleccionarAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setInscripcion(alumno.inscripcion_activa || null);
    setStep(2);
  };

  const guardarClase = async () => {
    if (!inscripcion) {
      setError("Este alumno no tiene inscripción activa.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const clase = await clasesAPI.registrar({
        inscripcion_id: inscripcion.inscripcion_id,
        alumno_id: alumnoSeleccionado.alumno_id,
        fecha,
        estado,
        apuntes,
      });
      // Refrescar inscripcion para mostrar resumen actualizado
      const resumen = await inscripcionesAPI.resumen(
        inscripcion.inscripcion_id,
      );
      setResultado({ clase, resumen });
      setStep(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const ins = inscripcion;
  const usadas = ins ? parseInt(ins.clases_usadas) : 0;
  const total = ins ? parseInt(ins.clases_total) : 0;
  const restantes = total - usadas;
  const esUltimaClase = estado === "dada" && restantes === 1;
  const porVencer = ins && diasHasta(ins.fecha_vencimiento) <= 5;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-secondary)",
        paddingBottom: 32,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 0" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
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
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {step === 3 ? "Listo" : `Paso ${step} de 2`}
          </span>
        </div>

        {step < 3 && <ProgressBar step={step} total={2} />}

        {/* ── PASO 1: Seleccionar alumno ── */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
              ¿Quién es la clase?
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                marginBottom: 20,
              }}
            >
              Selecciona el alumno
            </p>

            {loading ? (
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Cargando...
              </p>
            ) : alumnos.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                No hay alumnos activos.
              </p>
            ) : (
              alumnos.map((alumno) => {
                const ins = alumno.inscripcion_activa;
                const restantes = ins
                  ? parseInt(ins.clases_total) - parseInt(ins.clases_usadas)
                  : null;
                const warn = ins && diasHasta(ins.fecha_vencimiento) <= 5;

                return (
                  <div
                    key={alumno.alumno_id}
                    onClick={() => seleccionarAlumno(alumno)}
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "0.5px solid var(--color-border)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <Avatar nombre={alumno.nombre} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {alumno.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-secondary)",
                          marginTop: 1,
                        }}
                      >
                        {ins
                          ? `${ins.paquete_nombre} · ${formatDiasHasta(ins.fecha_vencimiento)}`
                          : "Sin paquete activo"}
                      </div>
                    </div>
                    {restantes !== null && (
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        {warn ? (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: "var(--color-warning-light)",
                              color: "var(--color-warning)",
                              fontWeight: 500,
                            }}
                          >
                            {restantes} clase{restantes !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                              {restantes}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-tertiary)",
                              }}
                            >
                              restantes
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── PASO 2: Estado y apuntes ── */}
        {step === 2 && alumnoSeleccionado && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <Avatar nombre={alumnoSeleccionado.nombre} size={40} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>
                  {alumnoSeleccionado.nombre}
                </div>
                {ins && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      marginTop: 1,
                    }}
                  >
                    {usadas} / {total} clases ·{" "}
                    {formatDiasHasta(ins.fecha_vencimiento)}
                  </div>
                )}
              </div>
            </div>

            {/* Fecha */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--color-bg-primary)",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {/* Estado */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Estado de la clase
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    value: "dada",
                    label: "Dada",
                    color: "var(--color-success)",
                    bg: "var(--color-success-light)",
                  },
                  {
                    value: "faltante",
                    label: "Faltó",
                    color: "var(--color-text-secondary)",
                    bg: "var(--color-bg-secondary)",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEstado(opt.value)}
                    style={{
                      padding: "14px 10px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border:
                        estado === opt.value
                          ? `1.5px solid ${opt.color}`
                          : "0.5px solid var(--color-border)",
                      background:
                        estado === opt.value
                          ? opt.bg
                          : "var(--color-bg-primary)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background:
                          estado === opt.value
                            ? opt.color
                            : "var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {opt.value === "dada" ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color:
                          estado === opt.value
                            ? opt.color
                            : "var(--color-text-secondary)",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Apuntes */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                  display: "block",
                }}
              >
                Apuntes de la sesión
              </label>
              <textarea
                value={apuntes}
                onChange={(e) => setApuntes(e.target.value)}
                placeholder="Notas sobre el progreso, ejercicios, próximos objetivos..."
                rows={3}
                style={{
                  width: "100%",
                  background: "var(--color-bg-primary)",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 13,
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Alerta última clase */}
            {esUltimaClase && (
              <div
                style={{
                  background: "var(--color-warning-light)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 14,
                  fontSize: 13,
                  color: "var(--color-warning)",
                }}
              >
                ⚠️ Esta será la última clase del paquete actual.
              </div>
            )}

            {/* Sin inscripción */}
            {!inscripcion && (
              <div
                style={{
                  background: "var(--color-danger-light)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 14,
                  fontSize: 13,
                  color: "var(--color-danger)",
                }}
              >
                Este alumno no tiene inscripción activa. Asígnale un paquete
                primero.
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
              onClick={guardarClase}
              disabled={saving || !inscripcion}
              style={{
                width: "100%",
                padding: 12,
                background:
                  saving || !inscripcion
                    ? "var(--color-text-tertiary)"
                    : "var(--color-text-primary)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: saving || !inscripcion ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Guardar clase"}
            </button>
          </>
        )}

        {/* ── PASO 3: Confirmación ── */}
        {step === 3 && resultado && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background:
                  estado === "dada"
                    ? "var(--color-success-light)"
                    : "var(--color-bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {estado === "dada" ? (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              {estado === "dada" ? "Clase registrada" : "Falta registrada"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {alumnoSeleccionado.nombre} · {fecha}
            </p>

            {/* Resumen paquete */}
            <div
              style={{
                background: "var(--color-bg-primary)",
                border: "0.5px solid var(--color-border)",
                borderRadius: 12,
                padding: "12px 16px",
                width: "100%",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "0.5px solid var(--color-border)",
                }}
              >
                <span
                  style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                >
                  Clases usadas
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {resultado.resumen.clases_usadas} /{" "}
                  {resultado.resumen.clases_total}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "0.5px solid var(--color-border)",
                }}
              >
                <span
                  style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                >
                  Clases restantes
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {resultado.resumen.clases_restantes}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                }}
              >
                <span
                  style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                >
                  Vencimiento
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                      resultado.resumen.dias_hasta_vencimiento <= 5
                        ? "var(--color-warning)"
                        : "var(--color-text-primary)",
                  }}
                >
                  {formatDiasHasta(resultado.resumen.fecha_vencimiento)}
                </span>
              </div>
            </div>

            {/* Acción si se agotó el paquete */}
            {resultado.resumen.clases_restantes === 0 && (
              <div
                style={{
                  background: "var(--color-warning-light)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  width: "100%",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "var(--color-warning)",
                  textAlign: "center",
                }}
              >
                Paquete completado — recuerda renovarlo
              </div>
            )}

            <button
              onClick={() =>
                navigate(`/alumnos/${alumnoSeleccionado.alumno_id}`)
              }
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 10,
                background: "var(--color-text-primary)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Ver ficha del alumno
            </button>

            <button
              onClick={() => {
                setStep(1);
                setAlumnoSeleccionado(null);
                setInscripcion(null);
                setEstado("dada");
                setApuntes("");
                setResultado(null);
              }}
              style={{
                width: "100%",
                padding: 12,
                background: "none",
                color: "var(--color-text-primary)",
                border: "0.5px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Registrar otra clase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
