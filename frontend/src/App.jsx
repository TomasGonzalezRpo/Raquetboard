import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Alumnos from "./pages/Alumnos";
import AlumnoDetalle from "./pages/AlumnoDetalle";
import AlumnoForm from "./pages/AlumnoForm";
import Agenda from "./pages/Agenda";
import Paquetes from "./pages/Paquetes";
import PaqueteForm from "./pages/PaqueteForm";
import RegistrarClase from "./pages/RegistrarClase";
import Login from "./pages/Login";
import { alumnosAPI } from "./api/alumnos";
import { paquetesAPI } from "./api/paquetes";

function AlumnoFormEditar() {
  const { id } = useParams();
  const [alumno, setAlumno] = useState(null);
  useEffect(() => {
    alumnosAPI.obtener(id).then(setAlumno);
  }, [id]);
  if (!alumno)
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
  return <AlumnoForm alumno={alumno} />;
}

function PaqueteFormEditar() {
  const { id } = useParams();
  const [paquete, setPaquete] = useState(null);
  useEffect(() => {
    paquetesAPI.listar().then((lista) => {
      const p = lista.find((x) => x.paquete_id === id);
      setPaquete(p || null);
    });
  }, [id]);
  if (!paquete)
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
  return <PaqueteForm paquete={paquete} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/alumnos/nuevo" element={<AlumnoForm />} />
            <Route path="/alumnos/:id" element={<AlumnoDetalle />} />
            <Route path="/alumnos/:id/editar" element={<AlumnoFormEditar />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/paquetes" element={<Paquetes />} />
            <Route path="/paquetes/nuevo" element={<PaqueteForm />} />
            <Route
              path="/paquetes/:id/editar"
              element={<PaqueteFormEditar />}
            />
            <Route path="/registrar-clase" element={<RegistrarClase />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
