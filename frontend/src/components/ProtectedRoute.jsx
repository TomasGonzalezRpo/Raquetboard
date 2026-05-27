import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Cargando...</span>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
