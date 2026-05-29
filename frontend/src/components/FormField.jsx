export default function FormField({ label, error, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 13, fontWeight: 600,
          color: "var(--gray-700)", marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      {children}
      {hint && <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--gray-300)",
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  background: "#fff",
  color: "var(--gray-900)",
  transition: "border-color 0.15s",
};

export const btnPrimary = {
  width: "100%",
  padding: "13px",
  background: "var(--green)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnSecondary = {
  width: "100%",
  padding: "13px",
  background: "var(--gray-100)",
  color: "var(--gray-700)",
  border: "none",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
