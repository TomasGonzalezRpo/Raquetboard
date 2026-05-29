import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { alumnos, inscripciones, clases, canchas } from "../api/index";

const STEP_LABELS = ["Alumno", "Detalles", "Confirmar"];

export default function RegistrarClase() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [alumnosList, setAlumnosList] = useState([]);
  const [canchasList, setCanchasList] = useState([]);
  const [alumnoSel, setAlumnoSel] = useState(null);
  const [inscripcionSel, setInscripcionSel] = useState(null);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    hora_inicio: "09:00",
    cancha_id: "",
    tipo: "individual",
    notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([alumnos.listar(), canchas.listar()])
      .then(([a, c]) => { setAlumnosList(a || []); setCanchasList(c || []); if (c?.[0]) setForm(f => ({ ...f, cancha_id: c[0].id })); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function selectAlumno(a) {
    setAlumnoSel(a);
    try {
      const ins = await inscripciones.listar({ alumno_id: a.id, activa: true });
      setInscripcionSel(ins?.[0] || null);
    } catch { setInscripcionSel(null); }
  }

  async function registrar() {
    if (!alumnoSel || !inscripcionSel) return;
    setSubmitting(true);
    try {
      await clases.registrar({
        inscripcion_id: inscripcionSel.id,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        cancha_id: form.cancha_id,
        tipo: form.tipo,
        notas: form.notas,
      });
      navigate("/");
    } catch (e) {
      alert(e.message || "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      {/* Header con stepper */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} style={{ color: "rgba(255,255,255,0.7)", padding: 4 }}><ChevLeft /></button>
          <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 500, flex: 1 }}>
            {step === 1 ? "Seleccionar alumno" : step === 2 ? "Detalles de la clase" : "Confirmar clase"}
          </h1>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {[1,2,3].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: s < 3 ? 1 : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, background: s < step ? "var(--coral)" : s === step ? "#fff" : "rgba(255,255,255,0.2)", color: s < step ? "#fff" : s === step ? "var(--navy-dark)" : "rgba(255,255,255,0.5)", flexShrink: 0 }}>
                {s < step ? <CheckIcon /> : s}
              </div>
              {s < 3 && <div style={{ flex: 1, height: 2, margin: "0 4px", background: s < step ? "var(--coral)" : "rgba(255,255,255,0.2)" }} />}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: 4 }}>
          {STEP_LABELS.map((l, i) => (
            <span key={l} style={{ fontSize: 9, color: i + 1 === step ? "#fff" : "rgba(255,255,255,0.45)", textAlign: "center", fontWeight: i + 1 === step ? 500 : 400 }}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>Cargando...</div>
        ) : step === 1 ? (
          <Step1 alumnos={alumnosList} alumnoSel={alumnoSel} onSelect={a => { selectAlumno(a); setStep(2); }} />
        ) : step === 2 ? (
          <Step2 form={form} onChange={setForm} canchas={canchasList} onNext={() => setStep(3)} />
        ) : (
          <Step3 alumno={alumnoSel} inscripcion={inscripcionSel} form={form} canchas={canchasList} onSubmit={registrar} submitting={submitting} />
        )}
      </div>

      <NavBar />
    </div>
  );
}

function Step1({ alumnos, alumnoSel, onSelect }) {
  const [busqueda, setBusqueda] = useState("");
  const filtrados = alumnos.filter(a => a.nombre?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <>
      <div style={{ background: "rgba(26,58,92,0.08)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <SearchIcon />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar alumno..." style={{ border: "none", background: "transparent", flex: 1, fontSize: 14, outline: "none", color: "var(--gray-900)" }} />
      </div>
      <div className="card">
        {filtrados.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>Sin resultados</div>
        ) : filtrados.map((a, i) => {
          const sel = alumnoSel?.id === a.id;
          return (
            <div key={a.id} onClick={() => onSelect(a)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < filtrados.length - 1 ? "0.5px solid var(--gray-200)" : "none", cursor: "pointer", background: sel ? "var(--navy-light)" : "transparent" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: sel ? "var(--navy)" : "var(--navy-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: sel ? "#fff" : "var(--navy)", flexShrink: 0 }}>
                {iniciales(a.nombre)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 1 }}>{a.clases_restantes ?? "—"} clases restantes</div>
              </div>
              {sel && <CheckCircleIcon />}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Step2({ form, onChange, canchas, onNext }) {
  return (
    <>
      <div className="card">
        <Campo label="Fecha">
          <input type="date" value={form.fecha} onChange={e => onChange(f => ({ ...f, fecha: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 500, outline: "none", color: "var(--gray-900)", textAlign: "right" }} />
        </Campo>
        <Campo label="Hora">
          <input type="time" value={form.hora_inicio} onChange={e => onChange(f => ({ ...f, hora_inicio: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 500, outline: "none", color: "var(--gray-900)", textAlign: "right" }} />
        </Campo>
        <Campo label="Cancha">
          <select value={form.cancha_id} onChange={e => onChange(f => ({ ...f, cancha_id: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 500, outline: "none", color: "var(--gray-900)", textAlign: "right" }}>
            {canchas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Campo>
        <Campo label="Tipo">
          <select value={form.tipo} onChange={e => onChange(f => ({ ...f, tipo: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 500, outline: "none", color: "var(--gray-900)", textAlign: "right" }}>
            <option value="individual">Individual</option>
            <option value="grupal">Grupal</option>
          </select>
        </Campo>
        <Campo label="Notas" last>
          <input value={form.notas} onChange={e => onChange(f => ({ ...f, notas: e.target.value }))} placeholder="Opcional..." style={{ border: "none", background: "transparent", fontSize: 13, outline: "none", color: "var(--gray-900)", textAlign: "right", width: "100%" }} />
        </Campo>
      </div>
      <button className="btn-secondary" onClick={onNext}>
        <ChevRight /> Continuar
      </button>
    </>
  );
}

function Step3({ alumno, inscripcion, form, canchas, onSubmit, submitting }) {
  const cancha = canchas.find(c => c.id === form.cancha_id);
  const restantesTras = (inscripcion?.clases_restantes ?? 0) - 1;
  return (
    <>
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 13, fontWeight: 500 }}>Resumen</span></div>
        {[
          ["Alumno", alumno?.nombre],
          ["Fecha", form.fecha],
          ["Hora", form.hora_inicio],
          ["Cancha", cancha?.nombre ?? "—"],
          ["Tipo", form.tipo === "grupal" ? "Grupal" : "Individual"],
          ["Paquete", inscripcion ? `${inscripcion.paquete_nombre} · ${inscripcion.clases_restantes} restantes` : "Sin paquete activo"],
        ].map(([l, v], i) => (
          <div key={l} style={{ padding: "9px 14px", display: "flex", justifyContent: "space-between", borderBottom: i < 5 ? "0.5px solid var(--gray-200)" : "none" }}>
            <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{l}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
        <div style={{ padding: "9px 14px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>Tras registrar</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: restantesTras <= 1 ? "var(--coral)" : "var(--success)" }}>{restantesTras} restantes</span>
        </div>
      </div>
      {!inscripcion && (
        <div style={{ background: "var(--coral-light)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#7a2e00" }}>
          Este alumno no tiene un paquete activo. Asignale uno antes de registrar la clase.
        </div>
      )}
      <button className="btn-primary" onClick={onSubmit} disabled={!inscripcion || submitting}>
        <CheckIcon /> {submitting ? "Registrando..." : "Registrar clase"}
      </button>
    </>
  );
}

function Campo({ label, children, last }) {
  return (
    <div style={{ padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: last ? "none" : "0.5px solid var(--gray-200)" }}>
      <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{label}</span>
      {children}
    </div>
  );
}

function iniciales(nombre = "") {
  return nombre.split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase();
}

function ChevLeft() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevRight() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function CheckIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function CheckCircleIcon() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function SearchIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
