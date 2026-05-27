import { useLocation, useNavigate } from 'react-router-dom'

const ITEMS = [
  {
    path: '/',
    label: 'Inicio',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/alumnos',
    label: 'Alumnos',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    path: '/agenda',
    label: 'Agenda',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
      </svg>
    ),
  },
  {
    path: '/paquetes',
    label: 'Paquetes',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
]

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'calc(var(--nav-height) + var(--safe-bottom))',
      background: 'var(--color-bg-primary)',
      borderTop: '0.5px solid var(--color-border)',
      display: 'flex',
      zIndex: 100,
    }}>
      {ITEMS.map(({ path, label, icon }) => {
        const active = location.pathname === path
        return (
          <button key={path} onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              paddingBottom: 'var(--safe-bottom)',
              color: active ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
            }}>
            {icon(active)}
            <span style={{ fontSize: 10, fontWeight: active ? 500 : 400 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
