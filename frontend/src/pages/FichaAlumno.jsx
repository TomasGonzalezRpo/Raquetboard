import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { alumnos, clases, pagos, inscripciones } from "../api/index";

const TABS = ["Resumen", "Clases", "Pagos"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function FichaAlumno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [clasesList, setClasesList] = useState([]);
  const [pagosList, setPagosList] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      alumnos.obtener(id),
      inscripciones.listar({ alumno_id: id, activa: true }),
      clases.listar({ alumno_id: id }),
      pagos.listar({ alumno_id: id }),
    ]).then(([a, ins, cls, pgs]) => {
      setAlumno(a);
      setInscripcion(ins?.[0] || null);
      setClasesList(cls || []);
      setPagosList(pgs || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-400)" }}>Cargando...</div>;
  if (!alumno) return <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-400)" }}>Alumno no encontrado</div>;

  const vence = inscripcion?.clases_restantes <= 3;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => navigate(-1)} style={{ color: "rgba(255,255,255,0.7)", padding: 4 }}><ChevLeft /></button>
          <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 500, flex: 1 }}>Ficha del alumno</h1>
          <button style={{ color: "rgba(255,255,255,0.7)", padding: 4 }}><EditIcon /></button>
        </div>

        {/* Perfil */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 500, flexShrink: 0 }}>
            {iniciales(alumno.nombre)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 500 }}>{alumno.nombre}</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>Alumno activo</p>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              {[
                { v: clasesList.length, l: "clases totales" },
                { v: inscripcion?.clases_restantes ?? 0, l: "restantes", warn: vence },
                { v: formatPesos(pagosList.reduce((s, p) => s + (p.monto || 0), 0)), l: "cobrado" },
              ].map(({ v, l, warn }, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: warn ? "#fca5a5" : "#fff", lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--navy-dark)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 500, color: tab === i ? "#fff" : "rgba(255,255,255,0.5)", background: "transparent", border: "none", borderBottom: tab === i ? "2px solid var(--coral)" : "2px solid transparent", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === 0 && <TabResumen alumno={alumno} inscripcion={inscripcion} clasesList={clasesList} />}
        {tab === 1 && <TabClases clasesList={clasesList} />}
        {tab === 2 && <TabPagos pagosList={pagosList} />}
      </div>

      <NavBar />
    </div>
  );
}

function TabResumen({ alumno, inscripcion, clasesList }) {
  const vence = inscripcion?.clases_restantes <= 3;
  const esteMes = clasesList.filter(c => c.fecha?.startsWith(new Date().toISOString().slice(0,7))).length;
  return (
    <>
      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 13, fontWeight: 500 }}>Paquete activo</span>
          {inscripcion && <span className={`badge ${vence ? "badge-coral" : "badge-green"}`}>{vence ? "Vence pronto" : "Al día"}</span>}
        </div>
        {inscripcion ? (
          <>
            <InfoRow label="Paquete" value={inscripcion.paquete_nombre} />
            <InfoRow label="Clases usadas" value={`${inscripcion.clases_usadas} de ${inscripcion.clases_total}`} />
            <InfoRow label="Restantes" value={inscripcion.clases_restantes} coral={vence} />
            <InfoRow label="Vencimiento" value={inscripcion.fecha_vencimiento} coral={vence} last />
          </>
        ) : (
          <div style={{ padding: "16px 14px", color: "var(--gray-400)", fontSize: 13 }}>Sin paquete activo</div>
        )}
      </div>
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 13, fontWeight: 500 }}>Estadísticas</span></div>
        <InfoRow label="Clases este mes" value={esteMes} />
        <InfoRow label="Clases totales" value={clasesList.length} last />
      </div>
    </>
  );
}

function TabClases({ clasesList }) {
  const porMes = clasesList.reduce((acc, c) => {
    const key = c.fecha?.slice(0,7) || "sin fecha";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return Object.entries(porMes).sort(([a],[b]) => b.localeCompare(a)).map(([mes, cls]) => {
    const [y, m] = mes.split("-");
    const label = m ? `${MESES[parseInt(m)-1]} ${y}` : mes;
    return (
      <div key={mes} className="card">
        <div className="card-header">
          <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
          <span className="badge badge-navy">{cls.length} clases</span>
        </div>
        {cls.map((c, i) => (
          <div key={c.id} style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < cls.length-1 ? "0.5px solid var(--gray-200)" : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--gray-600)", minWidth: 50 }}>{formatFecha(c.fecha)}</span>
            <div style={{ width: 3, height: 30, borderRadius: 2, background: c.tipo === "grupal" ? "var(--coral)" : "var(--navy)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{c.tipo === "grupal" ? "Clase grupal" : "Clase individual"}</div>
              <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 1 }}>{c.hora_inicio?.slice(0,5)} · {c.cancha_nombre}</div>
            </div>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: c.tipo === "grupal" ? "var(--coral-light)" : "var(--navy-light)", color: c.tipo === "grupal" ? "#7a2e00" : "var(--navy-dark)", fontWeight: 500 }}>
              {c.tipo === "grupal" ? "Grupal" : "Individual"}
            </span>
          </div>
        ))}
      </div>
    );
  });
}

function TabPagos({ pagosList }) {
  const total = pagosList.reduce((s, p) => s + (p.monto || 0), 0);
  return (
    <>
      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 13, fontWeight: 500 }}>Total cobrado</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--success)" }}>{formatPesos(total)}</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 13, fontWeight: 500 }}>Historial de pagos</span></div>
        {pagosList.length === 0 ? (
          <div style={{ padding: "16px 14px", color: "var(--gray-400)", fontSize: 13 }}>Sin pagos registrados</div>
        ) : pagosList.map((p, i) => (
          <div key={p.id} style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < pagosList.length-1 ? "0.5px solid var(--gray-200)" : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--success-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.concepto || "Pago de paquete"}</div>
              <div style={{ fontSize: 10, color: "var(--gray-500)", marginTop: 1 }}>{p.fecha} · {p.metodo || "—"}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--success)" }}>{formatPesos(p.monto)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function InfoRow({ label, value, coral, last }) {
  return (
    <div style={{ padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: last ? "none" : "0.5px solid var(--gray-200)" }}>
      <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: coral ? "var(--coral)" : "var(--gray-900)" }}>{value ?? "—"}</span>
    </div>
  );
}

function iniciales(nombre = "") {
  return nombre.split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase();
}
function formatPesos(val) {
  if (!val) return "$0";
  if (val >= 1000000) return `$${(val/1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${Math.round(val/1000)}k`;
  return `$${val}`;
}
function formatFecha(f) {
  if (!f) return "—";
  const [,, d] = f.split("-");
  const date = new Date(f + "T00:00:00");
  const dias = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  return `${dias[date.getDay()]} ${d}`;
}
function ChevLeft() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function EditIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function CheckIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
