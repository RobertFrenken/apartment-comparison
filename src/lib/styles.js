// Shared inline style objects for consistent component styling.

export const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 24,
  boxShadow: "var(--shadow-sm)",
};

export const btnSmall = {
  background: "none",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  borderRadius: 4,
  padding: "2px 8px",
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "inherit",
};

export const btnMedium = {
  background: "none",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "inherit",
};

export const sectionHeading = {
  fontSize: 14,
  color: "var(--text-primary)",
  fontWeight: 600,
  marginBottom: 20,
};

export const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  color: "var(--text-secondary)",
  borderBottom: "2px solid var(--border)",
  fontWeight: 500,
};

export const miniThStyle = {
  padding: "6px 8px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  borderBottom: "2px solid var(--border)",
  whiteSpace: "nowrap",
};

export const inputStyle = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-primary)",
  fontSize: 13,
  padding: "8px 12px",
  fontFamily: "inherit",
};

export function rowBg(index) {
  return index % 2 === 0 ? "var(--bg-row-even)" : "var(--bg-row-odd)";
}

export function stickyCol(background) {
  return {
    position: "sticky",
    left: 0,
    background,
    zIndex: 1,
    borderRight: "1px solid var(--border)",
  };
}
