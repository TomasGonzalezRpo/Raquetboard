export default function Spinner({ size = 24 }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: 32,
    }}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--gray-200)`,
        borderTopColor: "var(--green)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
