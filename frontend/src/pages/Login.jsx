import { auth } from "../api/index";

export default function Login() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    }}>
      {/* Logo / Icono */}
      <div style={{
        width: 80, height: 80,
        background: "var(--green)",
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        boxShadow: "0 8px 24px rgba(22,163,74,0.3)",
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>
        Raquetboard
      </h1>
      <p style={{ fontSize: 15, color: "var(--gray-500)", textAlign: "center", marginBottom: 40, maxWidth: 280 }}>
        Tu sistema de gestión de clases de tenis
      </p>

      <a
        href={auth.loginUrl()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 24px",
          background: "#fff",
          border: "1px solid var(--gray-200)",
          borderRadius: 14,
          fontWeight: 600,
          fontSize: 16,
          color: "var(--gray-800)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Iniciar sesión con Google
      </a>

      <p style={{ marginTop: 32, fontSize: 12, color: "var(--gray-400)", textAlign: "center" }}>
        Acceso restringido al profesor autorizado
      </p>
    </div>
  );
}
