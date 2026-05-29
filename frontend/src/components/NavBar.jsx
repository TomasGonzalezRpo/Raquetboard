import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/",             label: "Inicio",    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",   type: "path2" },
  { to: "/agenda",       label: "Agenda",    icon: "calendar", type: "calendar" },
  { to: "/registrar",    label: "Registrar", icon: "book",     type: "book" },
  { to: "/alumnos",      label: "Alumnos",   icon: "users",    type: "users" },
  { to: "/mas",          label: "Más",       icon: "dots",     type: "dots" },
];

export default function NavBar() {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: "var(--nav-height)",
      paddingBottom: "var(--safe-bottom)",
      background: "#fff",
      borderTop: "0.5px solid var(--gray-200)",
      display: "flex",
      zIndex: 100,
    }}>
      {ITEMS.map(({ to, label, type }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            color: isActive
              ? (type === "book" ? "var(--coral)" : "var(--navy)")
              : "var(--gray-400)",
            fontSize: 10,
            fontWeight: isActive ? 500 : 400,
            transition: "color 0.15s",
            textDecoration: "none",
          })}
        >
          <NavIcon type={type} size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function NavIcon({ type, size }) {
  const s = { width: size, height: size, display: "block" };
  const props = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

  if (type === "path2") return (
    <svg style={s} {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
  if (type === "calendar") return (
    <svg style={s} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  if (type === "book") return (
    <svg style={s} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
  if (type === "users") return (
    <svg style={s} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
  if (type === "dots") return (
    <svg style={s} {...props}>
      <circle cx="5" cy="12" r="1" fill="currentColor"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="19" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
  return null;
}
