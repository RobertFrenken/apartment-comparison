export default function Badge({ children, color = "var(--accent-blue)" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      background: color + "14",
      color: color,
      border: `1px solid ${color}30`,
      marginRight: 4,
      marginBottom: 4,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function BoolBadge({ value, trueLabel = "Yes", falseLabel = "No" }) {
  if (value === null || value === undefined) return <Badge color="#94a3b8">N/A</Badge>;
  if (typeof value === "string") return <Badge color="#d97706">{value}</Badge>;
  return value
    ? <Badge color="#059669">{trueLabel}</Badge>
    : <Badge color="#dc2626">{falseLabel}</Badge>;
}
