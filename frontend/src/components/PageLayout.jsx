import NavBar from "./NavBar";

export default function PageLayout({ children, title, action }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid var(--gray-200)",
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>{title}</h1>
        {action}
      </header>

      {/* Content */}
      <main style={{
        flex: 1,
        overflowY: "auto",
        paddingBottom: "calc(var(--nav-height) + var(--safe-bottom) + 16px)",
      }}>
        {children}
      </main>

      <NavBar />
    </div>
  );
}
