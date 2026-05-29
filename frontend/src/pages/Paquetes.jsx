import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import FormField, { inputStyle, btnPrimary } from "../components/FormField";
import { paquetes as apiPkgs } from "../api/index";

export default function Paquetes() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", num_clases: "", precio: "", vigencia_dias: "30" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Vista previa en tiempo real
  const preview = form.num_clases && form.precio
    ? `$${(parseFloat(form.precio) / parseInt(form.num_clases)).toFixed(0)} por clase`
    : null;

  const cargar = () => {
    setLoading(true);
    apiPkgs.listar()
      .then(setLista)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  async function handleCrear(e) {
    e.preventDefault();
    if (!form.nombre || !form.num_clases || !form.precio) { setError("Completá nombre, clases y precio"); return; }
    setGuardando(true); setError("");
    try {
      await apiPkgs.crear({
        nombre: form.nombre,
        num_clases: parseInt(form.num_clases),
        precio: parseFloat(form.precio),
        vigencia_dias: parseInt(form.vigencia_dias) || 30,
      });
      setShowModal(false);
      setForm({ nombre: "", num_clases: "", precio: "", vigencia_dias: "30" });
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(pkg) {
    await apiPkgs.editar(pkg.paquete_id, { activo: !pkg.activo });
    cargar();
  }

  return (
    <PageLayout
      title="Paquetes"
      action={
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}
        >
          + Nuevo
        </button>
      }
    >
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? <Spinner /> : lista.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--gray-400)", padding: 40, fontSize: 14 }}>
            No hay paquetes creados
          </div>
        ) : lista.map((p) => (
          <div key={p.paquete_id} style={{
            background: "#fff", borderRadius: 14, padding: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            opacity: p.activo ? 1 : 0.5,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{p.nombre}</p>
                <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
                  {p.num_clases} clases · vigencia {p.vigencia_dias} días
                </p>
              </div>
              <Badge color={p.activo ? "green" : "gray"}>{p.activo ? "Activo" : "Inactivo"}</Badge>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 22, fontWeight: 800, color: "var(--gray-900)" }}>${p.precio.toFixed(0)}</span>
                <span style={{ fontSize: 13, color: "var(--gray-400)", marginLeft: 8 }}>${p.costo_por_clase.toFixed(0)}/clase</span>
              </div>
              <button
                onClick={() => toggleActivo(p)}
                style={{
                  fontSize: 12, padding: "6px 12px", borderRadius: 8,
                  background: p.activo ? "var(--gray-100)" : "var(--green-light)",
                  color: p.activo ? "var(--gray-600)" : "var(--green-dark)",
                  border: "none", cursor: "pointer", fontWeight: 600,
                }}
              >
                {p.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal nuevo paquete */}
      {showModal && (
        <Modal
          title="Nuevo paquete"
          onClose={() => { setShowModal(false); setError(""); }}
          footer={
            <button onClick={handleCrear} disabled={guardando} style={{ ...btnPrimary, opacity: guardando ? 0.7 : 1 }}>
              {guardando ? "Guardando..." : "Crear paquete"}
            </button>
          }
        >
          <FormField label="Nombre" error={error}>
            <input style={inputStyle} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Paquete 8 clases" autoFocus />
          </FormField>
          <div style={{ display: "flex", gap: 10 }}>
            <FormField label="N° de clases" style={{ flex: 1 }}>
              <input type="number" style={inputStyle} value={form.num_clases} onChange={(e) => setForm({ ...form, num_clases: e.target.value })} placeholder="8" min="1" />
            </FormField>
            <FormField label="Precio total ($)" style={{ flex: 1 }}>
              <input type="number" style={inputStyle} value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="40000" min="0" />
            </FormField>
          </div>
          <FormField label="Vigencia (días)">
            <input type="number" style={inputStyle} value={form.vigencia_dias} onChange={(e) => setForm({ ...form, vigencia_dias: e.target.value })} placeholder="30" min="1" />
          </FormField>

          {/* Vista previa */}
          {preview && (
            <div style={{
              background: "var(--green-light)", borderRadius: 10, padding: "10px 14px",
              fontSize: 14, color: "var(--green-dark)", fontWeight: 600,
            }}>
              💡 Vista previa: {preview}
            </div>
          )}
        </Modal>
      )}
    </PageLayout>
  );
}
