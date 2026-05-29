import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { dashboard, clases } from "../api/index";

export default function Dashboard() {
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [clasesHoy, setClasesHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboard.metricas(),
      dashboard.alertas(),
      clases.hoy(),
    ]).then(([m, a, c]) => {
      setMetricas(m);
      setAlertas(a || []);
      setClasesHoy(c || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 500 }}>Raquetboard</h1>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 500 }}>
            TG
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 14 }}>{todayCap}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <StatCard label="Alumnos activos" value={loading ? "—" : metricas?.alumnos_activos ?? 0} sub="este mes" accent />
          <StatCard label="Clases del mes" value={loading ? "—" : metricas?.clases_mes ?? 0} sub="registradas" />
          <StatCard label="Cobrado" value={loading ? "—" : formatPesos(metricas?.cobrado_mes)} sub="este mes" />
          <StatCard label="Clases hoy" value={loading ? "—" : clasesHoy.length} sub={clasesHoy.length > 0 ? `próx. ${clasesHoy[0]?.hora_inicio?.slice(0,5)}` : "sin clases"} />
        </div>
      </div>

      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Acciones rápidas */}
        <p className="section-label">Acciones rápidas</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {[
            { label: "Registrar clase", type: "book",     to: "/registrar" },
            { label: "Ver agenda",      type: "calendar", to: "/agenda" },
            { label: "Alumnos",         type: "users",    to: "/alumnos" },
            { label: "Paquetes",        type: "package",  to: "/paquetes" },
          ].map(({ label, type, to }) => (
            <button key={to} onClick={() => navigate(to)} style={{ background: "#fff", border: "0.5px solid var(--gray-200)", borderRadius: 14, padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <ActionIcon type={type} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-900)" }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <>
            <p className="section-label" style={{ marginTop: 2 }}>Alertas</p>
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 13, fontWeight: 500 }}>Paquetes por vencer</span>
                <span className="badge badge-coral">{alertas.length} {alertas.length === 1 ? "alumno" : "alumnos"}</span>
              </div>
              {alertas.map((a, i) => (
                <div key={i} onClick={() => navigate(`/alumnos/${a.alumno_id}`)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < alertas.length - 1 ? "0.5px solid var(--gray-200)" : "none", cursor: "pointer" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dias_restantes <= 7 ? "var(--coral)" : "var(--warning)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.alumno_nombre}</div>
                    <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 1 }}>
                      {a.clases_restantes} {a.clases_restantes === 1 ? "clase restante" : "clases restantes"} · vence en {a.dias_restantes} días
                    </div>
                  </div>
                  <ChevronRight />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Clases de hoy */}
        <p className="section-label" style={{ marginTop: 2 }}>Clases de hoy</p>
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 13, fontWeight: 500 }}>{todayCap}</span>
            <span className="badge badge-navy">{clasesHoy.length} {clasesHoy.length === 1 ? "clase" : "clases"}</span>
          </div>
          {clasesHoy.length === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>Sin clases hoy</div>
          ) : (
            clasesHoy.map((c, i) => (
              <div key={c.id} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < clasesHoy.length - 1 ? "0.5px solid var(--gray-200)" : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-700)", minWidth: 42 }}>{c.hora_inicio?.slice(0,5)}</span>
                <div style={{ width: 3, height: 34, borderRadius: 2, background: c.tipo === "grupal" ? "var(--coral)" : "var(--navy)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.alumno_nombre}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2 }}>{c.cancha_nombre} · {c.tipo === "grupal" ? "Grupal" : "Individual"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: accent ? "var(--coral)" : "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: accent ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.5)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function formatPesos(val) {
  if (!val) return "$0";
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${Math.round(val / 1000)}k`;
  return `$${val}`;
}

function ChevronRight() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function ActionIcon({ type }) {
  const s = { width: 22, height: 22 };
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "var(--navy)", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "book")     return <svg style={s} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
  if (type === "calendar") return <svg style={s} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (type === "users")    return <svg style={s} {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (type === "package")  return <svg style={s} {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  return null;
}
