import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { alumnos } from "../api/index";

const FILTROS = ["Todos", "Activos", "Por vencer"];

export default function Alumnos() {
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    alumnos.listar()
      .then(data => setLista(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtrados = lista.filter(a => {
    const matchBusqueda = a.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    if (!matchBusqueda) return false;
    if (filtro === "Activos") return a.clases_restantes > 3;
    if (filtro === "Por vencer") return a.clases_restantes <= 3 && a.clases_restantes > 0;
    return true;
  });

  const porVencer = lista.filter(a => a.clases_restantes <= 3 && a.clases_restantes > 0);
  const activos = lista.filter(a => a.clases_restantes > 3);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 500 }}>Alumnos</h1>
          <button onClick={() => navigate("/alumnos/nuevo")} style={{ background: "var(--coral)", color: "#fff", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <PlusIcon /> Nuevo
          </button>
        </div>

        {/* Buscador */}
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <SearchIcon />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar alumno..." style={{ border: "none", background: "transparent", flex: 1, fontSize: 14, outline: "none", color: "#fff" }} />
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 8 }}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer", background: filtro === f ? "#fff" : "rgba(255,255,255,0.15)", color: filtro === f ? "var(--navy-dark)" : "rgba(255,255,255,0.7)" }}>
              {f}{f === "Todos" ? ` (${lista.length})` : f === "Activos" ? ` (${activos.length})` : ` (${porVencer.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)", fontSize: 13 }}>Sin alumnos</div>
        ) : (
          <>
            {filtro === "Todos" && porVencer.length > 0 && (
              <>
                <p className="section-label">Por vencer</p>
                {filtrados.filter(a => a.clases_restantes <= 3 && a.clases_restantes > 0).map(a => <AlumnoCard key={a.id} alumno={a} onClick={() => navigate(`/alumnos/${a.id}`)} />)}
                {filtrados.filter(a => a.clases_restantes > 3).length > 0 && <p className="section-label" style={{ marginTop: 4 }}>Activos</p>}
                {filtrados.filter(a => a.clases_restantes > 3).map(a => <AlumnoCard key={a.id} alumno={a} onClick={() => navigate(`/alumnos/${a.id}`)} />)}
              </>
            )}
            {filtro !== "Todos" && filtrados.map(a => <AlumnoCard key={a.id} alumno={a} onClick={() => navigate(`/alumnos/${a.id}`)} />)}
          </>
        )}
      </div>

      <NavBar />
    </div>
  );
}

function AlumnoCard({ alumno, onClick }) {
  const vence = alumno.clases_restantes <= 3 && alumno.clases_restantes > 0;
  const sinClases = !alumno.clases_restantes || alumno.clases_restantes <= 0;
  return (
    <div onClick={onClick} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: vence ? "var(--coral-light)" : "var(--navy-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: vence ? "var(--coral)" : "var(--navy)", flexShrink: 0 }}>
        {iniciales(alumno.nombre)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{alumno.nombre}</div>
        <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2 }}>{alumno.paquete_nombre || "Sin paquete"}{alumno.vencimiento ? ` · vence ${alumno.vencimiento}` : ""}</div>
      </div>
      <div style={{ textAlign: "right", minWidth: 50 }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: vence || sinClases ? "var(--coral)" : "var(--navy)", lineHeight: 1 }}>{alumno.clases_restantes ?? 0}</div>
        <div style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 2 }}>restantes</div>
        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, fontWeight: 500, marginTop: 3, display: "inline-block", background: vence || sinClases ? "var(--coral-light)" : "var(--success-light)", color: vence || sinClases ? "#7a2e00" : "#166534" }}>
          {vence ? "Vence pronto" : sinClases ? "Sin clases" : "Activo"}
        </span>
      </div>
    </div>
  );
}

function iniciales(nombre = "") {
  return nombre.split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase();
}
function PlusIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function SearchIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
