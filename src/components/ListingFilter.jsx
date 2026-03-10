import { COLORS } from "../lib/constants.js";

export default function ListingFilter({ apartments, hiddenIds, setHiddenIds }) {
  const allVisible = hiddenIds.length === 0;
  const allHidden = hiddenIds.length === apartments.length;

  const toggle = (id) => {
    setHiddenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const showAll = () => setHiddenIds([]);
  const hideAll = () => setHiddenIds(apartments.map((a) => a.id));

  if (apartments.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 16,
    }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginRight: 2 }}>
        Filter:
      </span>
      {apartments.map((a, i) => {
        const color = COLORS[i % COLORS.length];
        const hidden = hiddenIds.includes(a.id);
        return (
          <button
            key={a.id}
            onClick={() => toggle(a.id)}
            title={hidden ? `Show ${a.name}` : `Hide ${a.name}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: hidden ? "var(--border)" : color,
              background: hidden ? "transparent" : `${color}12`,
              color: hidden ? "var(--text-muted)" : "var(--text-primary)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              fontWeight: hidden ? 400 : 500,
              opacity: hidden ? 0.55 : 1,
              transition: "all 0.15s",
              textDecoration: hidden ? "line-through" : "none",
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: hidden ? "var(--text-muted)" : color,
              flexShrink: 0,
            }} />
            {a.name}
          </button>
        );
      })}
      <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
        <button
          onClick={showAll}
          disabled={allVisible}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: allVisible ? "var(--text-muted)" : "var(--text-secondary)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: allVisible ? "default" : "pointer",
            fontSize: 11,
            fontFamily: "inherit",
            opacity: allVisible ? 0.5 : 1,
          }}
        >
          Show All
        </button>
        <button
          onClick={hideAll}
          disabled={allHidden}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: allHidden ? "var(--text-muted)" : "var(--text-secondary)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: allHidden ? "default" : "pointer",
            fontSize: 11,
            fontFamily: "inherit",
            opacity: allHidden ? 0.5 : 1,
          }}
        >
          Hide All
        </button>
      </div>
    </div>
  );
}
