import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { clases, reservas } from "../api/index";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIA_NAMES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

export default function Agenda() {
  const navigate = useNavigate();
  const hoy = new Date();
  const [año, setAño] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate());
  const [clasesMes, setClasesMes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const desde = `${año}-${String(mes+1).padStart(2,"0")}-01`;
    const hasta = `${año}-${String(mes+1).padStart(2,"0")}-${new Date(año, mes+1, 0).getDate()}`;
    clases.listar({ desde, hasta })
      .then(data => setClasesMes(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [año, mes]);

  function prevMes() {
    if (mes === 0) { setMes(11); setAño(a => a - 1); }
    else setMes(m => m - 1);
    setDiaSeleccionado(1);
  }
  function nextMes() {
    if (mes === 11) { setMes(0); setAño(a => a + 1); }
    else setMes(m => m + 1);
    setDiaSeleccionado(1);
  }

  const diasEnMes = new Date(año, mes+1, 0).getDate();
  const primerDia = new Date(año, mes, 1).getDay();
  const offset = primerDia === 0 ? 6 : primerDia - 1;
  const diasPrevMes = new Date(año, mes, 0).getDate();

  function clasesDia(d) {
    const fecha = `${año}-${String(mes+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return clasesMes.filter(c => c.fecha === fecha);
  }

  const clasesDiaSelec = clasesDia(diaSeleccionado);
  const fechaLabel = (() => {
    const d = new Date(año, mes, diaSeleccionado);
    const dn = DIA_NAMES[d.getDay()];
    return `${dn.charAt(0).toUpperCase()+dn.slice(1)} ${diaSeleccionado} de ${MESES[mes].toLowerCase()}`;
  })();
  const esHoy = año === hoy.getFullYear() && mes === hoy.getMonth() && diaSeleccionado === hoy.getDate();

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 500 }}>Agenda</h1>
          <button onClick={() => navigate("/registrar")} style={{ background: "var(--coral)", color: "#fff", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <PlusIcon /> Nueva clase
          </button>
        </div>

        {/* Navegación mes */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button onClick={prevMes} style={{ color: "rgba(255,255,255,0.7)", fontSize: 20, padding: 4 }}><ChevLeft /></button>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>{MESES[mes]} {año}</span>
          <button onClick={nextMes} style={{ color: "rgba(255,255,255,0.7)", fontSize: 20, padding: 4 }}><ChevRight /></button>
        </div>

        {/* Días de semana */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {DIAS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{d}</div>)}
        </div>

        {/* Grilla del calendario */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {/* Días mes anterior */}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`prev-${i}`} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{diasPrevMes - offset + 1 + i}</span>
            </div>
          ))}
          {/* Días del mes */}
          {Array.from({ length: diasEnMes }, (_, i) => {
            const d = i + 1;
            const esSelec = d === diaSeleccionado;
            const esHoyD = año === hoy.getFullYear() && mes === hoy.getMonth() && d === hoy.getDate();
            const clsD = clasesDia(d);
            return (
              <div key={d} onClick={() => setDiaSeleccionado(d)} style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 8, cursor: "pointer", background: esHoyD ? "var(--coral)" : esSelec ? "rgba(255,255,255,0.15)" : "transparent", gap: 2 }}>
                <span style={{ fontSize: 12, color: esHoyD || esSelec ? "#fff" : clsD.length > 0 ? "#fff" : "rgba(255,255,255,0.65)", fontWeight: esHoyD || esSelec ? 500 : 400, lineHeight: 1 }}>{d}</span>
                {clsD.length > 0 && (
                  <div style={{ display: "flex", gap: 2 }}>
                    {clsD.slice(0,3).map((c, ci) => (
                      <div key={ci} style={{ width: 4, height: 4, borderRadius: "50%", background: c.tipo === "grupal" ? "var(--coral-light)" : "#93c5fd" }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="section-label">{fechaLabel}{esHoy ? " · Hoy" : ""}</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 13, fontWeight: 500 }}>Clases</span>
            <span className="badge badge-navy">{clasesDiaSelec.length} {clasesDiaSelec.length === 1 ? "clase" : "clases"}</span>
          </div>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>Cargando...</div>
          ) : clasesDiaSelec.length === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>Sin clases este día</div>
          ) : (
            clasesDiaSelec.map((c, i) => (
              <div key={c.id} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < clasesDiaSelec.length - 1 ? "0.5px solid var(--gray-200)" : "none", cursor: "pointer" }} onClick={() => navigate(`/alumnos/${c.alumno_id}`)}>
                <div style={{ textAlign: "right", minWidth: 38 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-700)" }}>{c.hora_inicio?.slice(0,5)}</div>
                  <div style={{ fontSize: 10, color: "var(--gray-400)" }}>60 min</div>
                </div>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: c.tipo === "grupal" ? "var(--coral)" : "var(--navy)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.alumno_nombre}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 1 }}>{c.cancha_nombre}</div>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, fontWeight: 500, background: c.tipo === "grupal" ? "var(--coral-light)" : "var(--navy-light)", color: c.tipo === "grupal" ? "#7a2e00" : "var(--navy-dark)", marginTop: 2, display: "inline-block" }}>
                    {c.tipo === "grupal" ? "Grupal" : "Individual"}
                  </span>
                </div>
                <ChevRight small />
              </div>
            ))
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}

function ChevLeft() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevRight({ small }) {
  const sz = small ? 16 : 18;
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function PlusIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
