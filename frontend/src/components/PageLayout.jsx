import NavBar from './NavBar'

export default function PageLayout({ children, title }) {
  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: 'calc(var(--nav-height) + var(--safe-bottom))',
      background: 'var(--color-bg-secondary)',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 16px 16px',
      }}>
        {children}
      </div>
      <NavBar />
    </div>
  )
}
