import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { clasesAPI } from '../api/clases'
import { alumnosAPI } from '../api/alumnos'
import { formatHora, nombreDia, formatDiasHasta, diasHasta } from '../utils/dates'
import { useAuth } from '../context/AuthContext'

function MetricCard({ label, value, sub, warn }) {
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      borderRadius: 10,
      border: '0.5px solid var(--color-border)',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: warn ? 'var(--color-warning)' : 'var(--color-text-primary)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function BadgeEstado({ estado }) {
  const map = {
    dada: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
    faltante: { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' },
    pendiente: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
    cancelada: { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' },
  }
  const s = map[estado] || map.pendiente
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 99,
      background: s.bg, color: s.color, fontWeight: 500, flexShrink: 0,
    }}>
      {estado}
    </span>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([clasesAPI.hoy(), alumnosAPI.listar()])
      .then(([c, a]) => { setClases(c); setAlumnos(a) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const clasesCompletadas = clases.filter(c => c.estado === 'dada').length
  const porVencer = alumnos.filter(a => a.inscripcion_activa && diasHasta(a.inscripcion_activa.fecha_vencimiento) <= 7).length
  const alertaAlumno = alumnos.find(a => a.inscripcion_activa &&
    a.inscripcion_activa.clases_usadas >= a.inscripcion_activa.clases_total - 1 &&
    diasHasta(a.inscripcion_activa.fecha_vencimiento) <= 5)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <PageLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 0 16px' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Hoy</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, textTransform: 'capitalize' }}>
            {nombreDia()}
          </p>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 500, color: 'var(--color-primary)',
        }}>
          {initials}
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <MetricCard label="Clases hoy" value={loading ? '—' : clases.length} sub={`${clasesCompletadas} completadas`} />
        <MetricCard label="Alumnos activos" value={loading ? '—' : alumnos.length} />
        <MetricCard label="Completadas hoy" value={loading ? '—' : clasesCompletadas} sub={`de ${clases.length} programadas`} />
        <MetricCard label="Paquetes por vencer" value={loading ? '—' : porVencer} warn={porVencer > 0} sub="próximos 7 días" />
      </div>

      {/* Alerta vencimiento */}
      {alertaAlumno && (
        <div style={{
          background: 'var(--color-warning-light)',
          borderRadius: 10, padding: '10px 14px',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--color-warning)' }}>
            {alertaAlumno.nombre} tiene {alertaAlumno.inscripcion_activa.clases_total - alertaAlumno.inscripcion_activa.clases_usadas} clase(s) restante(s) · {formatDiasHasta(alertaAlumno.inscripcion_activa.fecha_vencimiento)}
          </span>
        </div>
      )}

      {/* Clases del día */}
      <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Clases de hoy</h2>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Cargando...</p>
      ) : clases.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No hay clases programadas para hoy.</p>
      ) : (
        clases.map(clase => (
          <div key={clase.clase_id} onClick={() => navigate(`/alumnos/${clase.alumno_id}`)}
            style={{
              background: 'var(--color-bg-primary)',
              border: '0.5px solid var(--color-border)',
              borderRadius: 12, padding: '10px 12px',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
            }}>
            <div style={{
              background: 'var(--color-bg-secondary)', borderRadius: 8,
              padding: '6px 8px', textAlign: 'center', minWidth: 46, flexShrink: 0,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{formatHora(clase.hora_inicio)}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>1h</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {clase.alumno_nombre}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                {clase.cancha_nombre || '—'}
              </div>
            </div>
            <BadgeEstado estado={clase.estado} />
          </div>
        ))
      )}

      {/* FAB registrar clase */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={() => navigate('/registrar-clase')} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--color-text-primary)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </PageLayout>
  )
}
