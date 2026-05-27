import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { alumnosAPI } from "../api/alumnos";
import { api } from "../api/client";
import { formatFecha, formatDiasHasta, diasHasta } from "../utils/dates";

const COLORS = [
  ["var(--color-primary-light)", "var(--color-primary)"],
  ["var(--color-success-light)", "var(--color-success)"],
  ["#FAEEDA", "#854F0B"],
  ["#FBEAF0", "#993556"],
  ["#EEEDFE", "#3C3489"],
];

function Avatar({ nombre, size = 44 }) {
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

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: "var(--color-bg-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border)",
          padding: "0 14px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "0.5px solid var(--color-border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

export default function AlumnoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [pagos, setPagos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    monto: "",
    metodo: "transferencia",
    notas: "",
  });
  const [savingPago, setSavingPago] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [a, h] = await Promise.all([
        alumnosAPI.obtener(id),
        alumnosAPI.historial(id),
      ]);
      setAlumno(a);
      setHistorial(h);
      if (a.inscripcion_activa) {
        const r = await api.get(`/pagos/alumno/${id}/resumen`);
        setPagos(r);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  const registrarPago = async () => {
    if (!pagoForm.monto || isNaN(pagoForm.monto)) return;
    setSavingPago(true);
    try {
      await api.post("/pagos/", {
        inscripcion_id: alumno.inscripcion_activa.inscripcion_id,
        alumno_id: id,
        fecha: new Date().toISOString().split("T")[0],
        monto: parseFloat(pagoForm.monto),
        metodo: pagoForm.metodo,
        notas: pagoForm.notas,
      });
      setPagoForm({ monto: "", metodo: "transferencia", notas: "" });
      setShowPagoForm(false);
      cargar();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPago(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
          Cargando...
        </span>
      </div>
    );

  if (!alumno)
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Alumno no encontrado.
        </p>
      </div>
    );

  const ins = alumno.inscripcion_activa;
  const usadas = ins ? parseInt(ins.clases_usadas) : 0;
  const total = ins ? parseInt(ins.clases_total) : 0;
  const porcentaje = total > 0 ? (usadas / total) * 100 : 0;
  const diasVence = ins ? diasHasta(ins.fecha_vencimiento) : null;
  const porVencer = diasVence !== null && diasVence <= 5;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-secondary)",
        paddingBottom: 32,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--color-bg-primary)",
          borderBottom: "0.5px solid var(--color-border)",
          padding: "20px 16px 16px",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => navigate("/alumnos")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                color: "var(--color-text-secondary)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Alumnos
            </button>
            <button
              onClick={() => navigate(`/alumnos/${id}/editar`)}
              style={{
                background: "none",
                border: "0.5px solid var(--color-border)",
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Avatar nombre={alumno.nombre} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>
                {alumno.nombre}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginTop: 2,
                }}
              >
                Desde {formatFecha(alumno.fecha_ingreso)}
              </div>
            </div>
          </div>

          {ins ? (
            <div
              style={{
                background: porVencer
                  ? "var(--color-warning-light)"
                  : "var(--color-bg-secondary)",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                >
                  {ins.paquete_nombre}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {usadas} / {total} clases
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "var(--color-border)",
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${porcentaje}%`,
                    background: porVencer
                      ? "var(--color-warning)"
                      : "var(--color-success)",
                    borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: porVencer
                    ? "var(--color-warning)"
                    : "var(--color-text-tertiary)",
                }}
              >
                {formatDiasHasta(ins.fecha_vencimiento)} · {total - usadas}{" "}
                clase{total - usadas !== 1 ? "s" : ""} restante
                {total - usadas !== 1 ? "s" : ""}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "var(--color-bg-secondary)",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <span
                style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
              >
                Sin paquete activo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "var(--color-bg-primary)",
          borderBottom: "0.5px solid var(--color-border)",
          padding: "0 16px",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex" }}>
          {[
            ["info", "Información"],
            ["historial", "Historial"],
            ["pagos", "Pagos"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: "12px 0",
                background: "none",
                border: "none",
                borderBottom:
                  tab === key
                    ? "2px solid var(--color-primary)"
                    : "2px solid transparent",
                fontSize: 13,
                fontWeight: tab === key ? 500 : 400,
                color:
                  tab === key
                    ? "var(--color-primary)"
                    : "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        {/* TAB INFO */}
        {tab === "info" && (
          <>
            <Section title="Contacto">
              <InfoRow label="Teléfono" value={alumno.telefono} />
              <InfoRow label="Email" value={alumno.email} />
            </Section>
            {alumno.notas && (
              <Section title="Observaciones">
                <div
                  style={{ padding: "10px 0", fontSize: 13, lineHeight: 1.6 }}
                >
                  {alumno.notas}
                </div>
              </Section>
            )}
            <button
              onClick={() =>
                navigate("/registrar-clase", {
                  state: { alumno_id: id, nombre: alumno.nombre },
                })
              }
              style={{
                width: "100%",
                padding: 12,
                background: "var(--color-text-primary)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Registrar clase
            </button>
          </>
        )}

        {/* TAB HISTORIAL */}
        {tab === "historial" && (
          <Section title={`${historial.length} clases`}>
            {historial.length === 0 ? (
              <div
                style={{
                  padding: "14px 0",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                Sin clases registradas.
              </div>
            ) : (
              historial.map((clase, i) => (
                <div
                  key={clase.clase_id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom:
                      i < historial.length - 1
                        ? "0.5px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      marginTop: 4,
                      background:
                        clase.estado === "dada"
                          ? "var(--color-success)"
                          : "var(--color-text-tertiary)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {formatFecha(clase.fecha)}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 7px",
                          borderRadius: 99,
                          background:
                            clase.estado === "dada"
                              ? "var(--color-success-light)"
                              : "var(--color-bg-secondary)",
                          color:
                            clase.estado === "dada"
                              ? "var(--color-success)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {clase.estado}
                      </span>
                    </div>
                    {clase.apuntes && (
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                        {clase.apuntes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </Section>
        )}

        {/* TAB PAGOS */}
        {tab === "pagos" && (
          <>
            {pagos ? (
              <>
                <div
                  style={{
                    background: pagos.pagado_completo
                      ? "var(--color-success-light)"
                      : "var(--color-warning-light)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Precio paquete
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      ${pagos.precio_paquete.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Total pagado
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--color-success)",
                      }}
                    >
                      ${pagos.total_pagado.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      Saldo pendiente
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: pagos.pagado_completo
                          ? "var(--color-success)"
                          : "var(--color-warning)",
                      }}
                    >
                      {pagos.pagado_completo
                        ? "✓ Pagado"
                        : `$${pagos.saldo_pendiente.toLocaleString("es-CO")}`}
                    </span>
                  </div>
                </div>

                <Section title="Pagos registrados">
                  {pagos.pagos.length === 0 ? (
                    <div
                      style={{
                        padding: "14px 0",
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Sin pagos registrados.
                    </div>
                  ) : (
                    pagos.pagos.map((pago, i) => (
                      <div
                        key={pago.pago_id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 0",
                          borderBottom:
                            i < pagos.pagos.length - 1
                              ? "0.5px solid var(--color-border)"
                              : "none",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            ${parseFloat(pago.monto).toLocaleString("es-CO")}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-secondary)",
                              marginTop: 2,
                            }}
                          >
                            {formatFecha(pago.fecha)} · {pago.metodo}
                            {pago.notas ? ` · ${pago.notas}` : ""}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </Section>

                {showPagoForm ? (
                  <div
                    style={{
                      background: "var(--color-bg-primary)",
                      borderRadius: 12,
                      border: "0.5px solid var(--color-border)",
                      padding: 14,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        marginBottom: 12,
                      }}
                    >
                      Registrar pago
                    </div>
                    <input
                      type="number"
                      placeholder="Monto"
                      value={pagoForm.monto}
                      onChange={(e) =>
                        setPagoForm({ ...pagoForm, monto: e.target.value })
                      }
                      style={{
                        width: "100%",
                        border: "0.5px solid var(--color-border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 13,
                        marginBottom: 8,
                        outline: "none",
                      }}
                    />
                    <select
                      value={pagoForm.metodo}
                      onChange={(e) =>
                        setPagoForm({ ...pagoForm, metodo: e.target.value })
                      }
                      style={{
                        width: "100%",
                        border: "0.5px solid var(--color-border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 13,
                        marginBottom: 8,
                        outline: "none",
                        background: "white",
                      }}
                    >
                      <option value="transferencia">Transferencia</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="otro">Otro</option>
                    </select>
                    <input
                      placeholder="Notas (opcional)"
                      value={pagoForm.notas}
                      onChange={(e) =>
                        setPagoForm({ ...pagoForm, notas: e.target.value })
                      }
                      style={{
                        width: "100%",
                        border: "0.5px solid var(--color-border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 13,
                        marginBottom: 12,
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setShowPagoForm(false)}
                        style={{
                          flex: 1,
                          padding: 9,
                          background: "none",
                          border: "0.5px solid var(--color-border)",
                          borderRadius: 8,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={registrarPago}
                        disabled={savingPago}
                        style={{
                          flex: 1,
                          padding: 9,
                          background: "var(--color-text-primary)",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        {savingPago ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPagoForm(true)}
                    style={{
                      width: "100%",
                      padding: 12,
                      marginTop: 12,
                      background: "var(--color-text-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    + Registrar pago
                  </button>
                )}
              </>
            ) : (
              <div
                style={{
                  padding: "14px 0",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                Sin inscripción activa.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
