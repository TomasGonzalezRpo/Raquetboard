import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useAlumnos } from '../hooks/useAlumnos'
import { formatDiasHasta, diasHasta } from '../utils/dates'

function Avatar({ nombre, index }) {
  const colors = [
    ['var(--color-primary-light)', 'var(--color-primary)'],
    ['var(--color-success-light)', 'var(--color-success)'],
    ['#FAEEDA', '#854F0B'],
    ['#FBEAF0', '#993556'],
    ['#EEEDFE', '#3C3489'],
  ]
  const [bg, color] = colors[index % colors.length]
  const initials = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      background: bg, color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 500,
    }}>{initials}</div>
  )
}

export default function Alumnos() {
  const navigate = useNavigate()
  const { alumnos, loading } = useAlumnos()
  const [busqueda, setBusqueda] = useState('')

  const filtrados = alumnos.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Alumnos</h1>
        <button onClick={() => navigate('/alumnos/nuevo')} style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--color-bg-primary)',
          border: '0.5px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{
        background: 'var(--color-bg-primary)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 10, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
        </svg>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar alumno..."
          style={{ border: 'none', outline: 'none', background: 'none', flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}
        />
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No se encontraron alumnos.</p>
      ) : (
        filtrados.map((alumno, i) => {
          const ins = alumno.inscripcion_activa
          const porVencer = ins && diasHasta(ins.fecha_vencimiento) <= 5
          const restantes = ins ? ins.clases_total - ins.clases_usadas : null
          return (
            <div key={alumno.alumno_id}
              onClick={() => navigate(`/alumnos/${alumno.alumno_id}`)}
              style={{
                background: 'var(--color-bg-primary)',
                border: '0.5px solid var(--color-border)',
                borderRadius: 12, padding: '10px 12px',
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer',
              }}>
              <Avatar nombre={alumno.nombre} index={i} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{alumno.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                  {ins ? `${ins.paquete_nombre} · ${formatDiasHasta(ins.fecha_vencimiento)}` : 'Sin paquete activo'}
                </div>
              </div>
              {restantes !== null && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {porVencer ? (
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 99,
                      background: 'var(--color-warning-light)', color: 'var(--color-warning)', fontWeight: 500,
                    }}>{restantes} clase{restantes !== 1 ? 's' : ''}</span>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{restantes}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>restantes</div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </PageLayout>
  )
}
