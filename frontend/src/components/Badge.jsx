export default function Badge({ color = "gray", children }) {
  const colors = {
    green: { bg: "var(--green-light)", text: "var(--green-dark)" },
    orange: { bg: "var(--orange-light)", text: "var(--orange)" },
    red: { bg: "var(--red-light)", text: "var(--red)" },
    blue: { bg: "var(--blue-light)", text: "var(--blue)" },
    gray: { bg: "var(--gray-100)", text: "var(--gray-600)" },
  };
  const { bg, text } = colors[color] || colors.gray;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: bg,
      color: text,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}
