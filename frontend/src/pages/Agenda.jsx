import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import ReservaForm from "./ReservaForm";
import { reservasAPI } from "../api/reservas";
import { alumnosAPI } from "../api/alumnos";
import { formatHora } from "../utils/dates";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const LINE_COLORS = [
  "#378ADD",
  "#1D9E75",
  "#EF9F27",
  "#993556",
  "#3C3489",
  "#854F0B",
];

function getDiasDelMes(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { offset, daysInMonth };
}

function hoyStr() {
  return new Date().toISOString().split("T")[0];
}

function fechaStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function Agenda() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoyStr());
  const [reservas, setReservas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const desde = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const hasta = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
      const [r, a] = await Promise.all([
        reservasAPI.listar(`?desde=${desde}&hasta=${hasta}`),
        alumnosAPI.listar(),
      ]);
      setReservas(r);
      setAlumnos(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [year, month]);

  const prevMes = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };

  const nextMes = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const { offset, daysInMonth } = getDiasDelMes(year, month);

  // Días que tienen reservas (no canceladas)
  const diasConReserva = new Set(
    reservas.filter((r) => r.estado !== "cancelada").map((r) => r.fecha),
  );

  // Reservas del día seleccionado
  const reservasDelDia = reservas
    .filter((r) => r.fecha === diaSeleccionado && r.estado !== "cancelada")
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const getNombreAlumno = (alumno_id) =>
    alumnos.find((a) => a.alumno_id === alumno_id)?.nombre || alumno_id;

  const todayStr = hoyStr();

  const handleSaved = () => {
    setShowForm(false);
    setReservaEditando(null);
    cargar();
  };

  return (
    <PageLayout>
      <div style={{ padding: "20px 0 0" }}>
        {/* Nav mes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <button
            onClick={prevMes}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
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
          <span style={{ fontSize: 15, fontWeight: 500 }}>
            {MESES[month]} {year}
          </span>
          <button
            onClick={nextMes}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Días de la semana */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            marginBottom: 4,
          }}
        >
          {DIAS.map((d) => (
            <div
              key={d}
              style={{
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                textAlign: "center",
                paddingBottom: 4,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grilla de días */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            marginBottom: 20,
          }}
        >
          {/* Celdas vacías antes del día 1 */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = fechaStr(year, month, day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === diaSeleccionado;
            const hasReserva = diasConReserva.has(dateStr);

            return (
              <button
                key={day}
                onClick={() => setDiaSeleccionado(dateStr)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  background:
                    isToday && isSelected
                      ? "var(--color-text-primary)"
                      : isSelected
                        ? "var(--color-primary-light)"
                        : isToday
                          ? "var(--color-bg-secondary)"
                          : "transparent",
                  fontWeight: isToday || isSelected ? 500 : 400,
                  color:
                    isToday && isSelected
                      ? "white"
                      : isSelected
                        ? "var(--color-primary)"
                        : isToday
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                  fontSize: 13,
                }}
              >
                {day}
                {hasReserva && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background:
                        isToday && isSelected
                          ? "white"
                          : isSelected
                            ? "var(--color-primary)"
                            : "var(--color-primary)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Reservas del día */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            {new Date(diaSeleccionado + "T00:00:00").toLocaleDateString(
              "es-CO",
              { weekday: "long", day: "numeric", month: "long" },
            )}
          </span>
          <button
            onClick={() => {
              setReservaEditando(null);
              setShowForm(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "var(--color-text-primary)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva reserva
          </button>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            Cargando...
          </p>
        ) : reservasDelDia.length === 0 ? (
          <div
            style={{
              background: "var(--color-bg-primary)",
              border: "0.5px solid var(--color-border)",
              borderRadius: 12,
              padding: "20px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              Sin reservas para este día.
            </p>
          </div>
        ) : (
          reservasDelDia.map((reserva, i) => (
            <div
              key={reserva.reserva_id}
              onClick={() => {
                setReservaEditando(reserva);
                setShowForm(true);
              }}
              style={{
                background: "var(--color-bg-primary)",
                border: "0.5px solid var(--color-border)",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 40,
                  borderRadius: 2,
                  background: LINE_COLORS[i % LINE_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {getNombreAlumno(reserva.alumno_id)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    marginTop: 2,
                  }}
                >
                  {formatHora(reserva.hora_inicio)} –{" "}
                  {formatHora(reserva.hora_fin)}
                  {reserva.notas ? ` · ${reserva.notas}` : ""}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 99,
                  flexShrink: 0,
                  background:
                    reserva.estado === "confirmada"
                      ? "var(--color-success-light)"
                      : "var(--color-warning-light)",
                  color:
                    reserva.estado === "confirmada"
                      ? "var(--color-success)"
                      : "var(--color-warning)",
                }}
              >
                {reserva.estado}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Modal ReservaForm */}
      {showForm && (
        <ReservaForm
          reserva={reservaEditando}
          fechaInicial={diaSeleccionado}
          onClose={() => {
            setShowForm(false);
            setReservaEditando(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </PageLayout>
  );
}
