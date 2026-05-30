import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Spinner from "./components/Spinner";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alumnos from "./pages/Alumnos";
import FichaAlumno from "./pages/FichaAlumno";
import Agenda from "./pages/Agenda";
import Paquetes from "./pages/Paquetes";
import RegistrarClase from "./pages/RegistrarClase";
import NuevoAlumno from "./pages/NuevoAlumno";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}><Spinner /></div>;
  if (!user) return <Login />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/alumnos" element={<RequireAuth><Alumnos /></RequireAuth>} />
      <Route path="/alumnos/nuevo" element={<RequireAuth><NuevoAlumno /></RequireAuth>} />
      <Route path="/alumnos/:id" element={<RequireAuth><FichaAlumno /></RequireAuth>} />
      <Route path="/agenda" element={<RequireAuth><Agenda /></RequireAuth>} />
      <Route path="/paquetes" element={<RequireAuth><Paquetes /></RequireAuth>} />
      <Route path="/registrar" element={<RequireAuth><RegistrarClase /></RequireAuth>} />
      <Route path="/registrar-clase" element={<Navigate to="/registrar" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
