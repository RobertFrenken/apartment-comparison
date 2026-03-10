export default function Badge({ children, color = "#4f9eff" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      marginRight: 4,
      marginBottom: 4,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function BoolBadge({ value, trueLabel = "Yes", falseLabel = "No" }) {
  if (value === null || value === undefined) return <Badge color="#64748b">N/A</Badge>;
  if (typeof value === "string") return <Badge color="#f59e0b">{value}</Badge>;
  return value
    ? <Badge color="#22c55e">{trueLabel}</Badge>
    : <Badge color="#ef4444">{falseLabel}</Badge>;
}
