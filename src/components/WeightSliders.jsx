import { CRITERIA, DEFAULT_WEIGHTS } from "../lib/scoring.js";
import { cardStyle, btnSmall } from "../lib/styles.js";
import { WEIGHT_SLIDER } from "../lib/constants.js";

// Reusable weight slider panel for scoring criteria.
// compact=true: single-row inline sliders for the Compare tab
// compact=false: full grid layout for Scorecard/Calculator
export default function WeightSliders({ weights, onChange, compact = false, showReset = true, onOpenCalculator }) {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  const isDefault = CRITERIA.every((c) => (weights[c.key] ?? 0) === (DEFAULT_WEIGHTS[c.key] ?? 0));

  if (compact) {
    return (
      <div style={{
        ...cardStyle,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
          Weights
        </span>
        {CRITERIA.map((c) => (
          <CompactSlider
            key={c.key}
            label={c.name}
            value={weights[c.key] ?? 0}
            onChange={(v) => onChange({ ...weights, [c.key]: v })}
          />
        ))}
        <span style={{ fontSize: 11, color: Math.abs(total - 100) > 1 ? "var(--accent-amber)" : "var(--text-muted)" }}>
          = {total}%
        </span>
        {!isDefault && (
          <button onClick={() => onChange({ ...DEFAULT_WEIGHTS })} style={{ ...btnSmall, fontSize: 11 }}>
            Reset
          </button>
        )}
        {onOpenCalculator && (
          <button onClick={onOpenCalculator} style={{ ...btnSmall, fontSize: 11, color: "var(--accent-blue)", borderColor: "var(--accent-blue)" }}>
            Full Calculator
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
            Scoring Weights
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Drag sliders to prioritize what matters to you. Total: {total.toFixed(0)}%
          </p>
        </div>
        {showReset && !isDefault && (
          <button onClick={() => onChange({ ...DEFAULT_WEIGHTS })} style={btnSmall}>
            Reset defaults
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {CRITERIA.map((c) => (
          <WeightSlider
            key={c.key}
            label={c.name}
            value={weights[c.key] ?? 0}
            onChange={(v) => onChange({ ...weights, [c.key]: v })}
          />
        ))}
      </div>

      {Math.abs(total - 100) > 1 && (
        <p style={{ fontSize: 12, color: "var(--accent-amber)", marginTop: 12 }}>
          Weights sum to {total.toFixed(0)}% (recommended: 100%). Scores still work but won't be on a 0-100 scale.
        </p>
      )}
    </div>
  );
}

// Full slider row for grid layout
function WeightSlider({ label, value, onChange, min = WEIGHT_SLIDER.min, max = WEIGHT_SLIDER.max, step = WEIGHT_SLIDER.step }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "var(--bg-primary)", border: "1px solid var(--border)",
      borderRadius: 6, padding: "8px 12px",
    }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 100, flexShrink: 0 }}>
        {label}
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: "var(--accent-blue)", height: 6 }}
      />
      <span style={{
        fontSize: 12, fontWeight: 600, color: "var(--text-primary)",
        width: 32, textAlign: "right", fontVariantNumeric: "tabular-nums",
      }}>
        {value}%
      </span>
    </div>
  );
}

// Compact inline slider for the Compare tab
function CompactSlider({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
      <input
        type="range" min={WEIGHT_SLIDER.min} max={WEIGHT_SLIDER.max} step={WEIGHT_SLIDER.step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 50, accentColor: "var(--accent-blue)", height: 4 }}
      />
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)", width: 22, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
