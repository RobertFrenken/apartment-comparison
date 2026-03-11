import { useState } from "react";
import {
  CRITERIA, DEFAULT_WEIGHTS,
  scoreCriterion, criterionDetail, calcOverallScore,
  bracketLabels, costPerPerson,
} from "../lib/scoring.js";
import { COLORS } from "../lib/constants.js";
import { cardStyle, sectionHeading, btnSmall, miniThStyle } from "../lib/styles.js";
import WeightSliders from "./WeightSliders.jsx";
import RadarChart from "./RadarChart.jsx";

export default function Calculator({ apartments, weights, brackets, onWeightsChange, onBracketsChange }) {
  const [expandedKey, setExpandedKey] = useState(null);

  const toggle = (key) => setExpandedKey((prev) => (prev === key ? null : key));

  const scored = apartments.map((a, i) => ({
    apartment: a,
    total: calcOverallScore(a, weights, brackets),
    color: COLORS[i % COLORS.length],
  }));

  const resetAllBrackets = () => onBracketsChange({});
  const hasCustomBrackets = Object.keys(brackets).length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Intro */}
      <div style={{ ...cardStyle, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
          Score Calculator
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          This calculator drives all scores across the site — summary cards, scorecard, and radar chart
          update live as you adjust. Each criterion is scored 0-10, then multiplied by its weight.
          Click any criterion below to see and edit how it scores.
        </p>
      </div>

      {/* Weight Sliders */}
      <WeightSliders weights={weights} onChange={onWeightsChange} />

      {/* Live Score Preview */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Live Score Preview</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {scored.sort((a, b) => b.total - a.total).map((s) => (
            <ScorePreviewCard key={s.apartment.id} s={s} weights={weights} />
          ))}
        </div>
      </div>

      {/* Radar */}
      <RadarChart apartments={apartments} weights={weights} />

      {/* Criteria Breakdown */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ ...sectionHeading, marginBottom: 0 }}>
            Scoring Formulas
            <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>
              click to expand
            </span>
          </h3>
          {hasCustomBrackets && (
            <button onClick={resetAllBrackets} style={btnSmall}>Reset all thresholds</button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CRITERIA.map((c) => (
            <CriterionCard
              key={c.key}
              criterion={c}
              apartments={apartments}
              weights={weights}
              brackets={brackets}
              expanded={expandedKey === c.key}
              onToggle={() => toggle(c.key)}
              onBracketsChange={onBracketsChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Reusable sub-components ---

function ScorePreviewCard({ s, weights }) {
  const weightTotal = Object.values(weights).reduce((sum, v) => sum + v, 0);
  return (
    <div style={{
      flex: "1 1 200px", background: "var(--bg-primary)",
      border: "1px solid var(--border)", borderRadius: 8,
      padding: "16px 20px", borderTop: `3px solid ${s.color}`,
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
        {s.total.toFixed(1)}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/ {weightTotal} pts</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, color: "var(--text-primary)" }}>
        {s.apartment.name}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
        ${costPerPerson(s.apartment).toLocaleString()}/person
      </div>
    </div>
  );
}

function CriterionCard({ criterion: c, apartments, weights, brackets, expanded, onToggle, onBracketsChange }) {
  const weight = weights[c.key] ?? 0;
  const isCustom = brackets[c.key] != null;

  return (
    <div style={{
      background: "var(--bg-primary)", border: "1px solid var(--border)",
      borderRadius: 8, overflow: "hidden",
    }}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
          {c.name}
          {isCustom && (
            <span style={{ fontSize: 10, color: "var(--accent-blue)", marginLeft: 6 }}>customized</span>
          )}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", width: 40, textAlign: "right" }}>
          {weight}%
        </span>
        {/* Mini scores */}
        <div style={{ display: "flex", gap: 6 }}>
          {apartments.map((a, i) => {
            const score = scoreCriterion(c, a, brackets);
            return (
              <span key={a.id} style={{
                fontSize: 11, fontWeight: 600, color: COLORS[i % COLORS.length],
                background: COLORS[i % COLORS.length] + "15",
                padding: "2px 6px", borderRadius: 4, fontVariantNumeric: "tabular-nums",
              }}>
                {score.toFixed(0)}
              </span>
            );
          })}
        </div>
        <span style={{ fontSize: 14, color: "var(--text-muted)", width: 16, textAlign: "center" }}>
          {expanded ? "−" : "+"}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "12px 0", lineHeight: 1.5 }}>
            {c.description}
          </p>

          {c.type === "bracket" && (
            <BracketEditor criterion={c} apartments={apartments} brackets={brackets} onChange={onBracketsChange} />
          )}
          {c.type === "checklist" && (
            <ChecklistBreakdown criterion={c} apartments={apartments} />
          )}
          {c.type === "binary" && (
            <BinaryBreakdown criterion={c} apartments={apartments} />
          )}
          {c.type === "scale" && (
            <ScaleBreakdown criterion={c} apartments={apartments} />
          )}
        </div>
      )}
    </div>
  );
}

// --- Type-specific breakdown components ---

function BracketEditor({ criterion: c, apartments, brackets, onChange }) {
  const currentBrackets = brackets[c.key] || c.defaultBrackets;
  const labels = bracketLabels(c, brackets);
  const isCustom = brackets[c.key] != null;

  const updateThreshold = (index, value) => {
    const updated = [...currentBrackets];
    updated[index] = Number(value);
    onChange({ ...brackets, [c.key]: updated });
  };

  const resetThresholds = () => {
    const next = { ...brackets };
    delete next[c.key];
    onChange(next);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          Scoring Thresholds
          <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 6 }}>
            ({c.direction === "lower" ? "lower is better" : "higher is better"})
          </span>
        </span>
        {isCustom && (
          <button onClick={resetThresholds} style={{ ...btnSmall, fontSize: 11 }}>Reset</button>
        )}
      </div>

      {/* Threshold inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginBottom: 16 }}>
        {labels.slice(0, -1).map((l, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "6px 10px",
          }}>
            <span style={{ fontSize: 12, color: "var(--accent-blue)", fontWeight: 700, width: 28 }}>
              {l.score}pt
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {c.direction === "lower" ? "≤" : "≥"}
            </span>
            <input
              type="number"
              value={currentBrackets[i]}
              onChange={(e) => updateThreshold(i, e.target.value)}
              style={{
                width: 80, background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 4, padding: "4px 8px", fontSize: 12, color: "var(--text-primary)",
                fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
              }}
            />
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{c.unit}</span>
          </div>
        ))}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "6px 10px", opacity: 0.6,
        }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, width: 28 }}>2pt</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Otherwise</span>
        </div>
      </div>

      {/* Per-apartment values */}
      <ApartmentScoreTable criterion={c} apartments={apartments} brackets={brackets} />
    </div>
  );
}

function ChecklistBreakdown({ criterion: c, apartments }) {
  return (
    <div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>
        Amenity Checklist
        <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 6 }}>
          (points sum capped at 10)
        </span>
      </span>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={miniThStyle}>Item</th>
            <th style={{ ...miniThStyle, textAlign: "center", width: 40 }}>Pts</th>
            {apartments.map((a, i) => (
              <th key={a.id} style={{ ...miniThStyle, textAlign: "center", color: COLORS[i % COLORS.length] }}>
                {a.name.split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.items.map((item) => (
            <tr key={item.key} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>{item.label}</td>
              <td style={{ padding: "6px 8px", textAlign: "center", color: "var(--text-muted)" }}>{item.points}</td>
              {apartments.map((a, i) => {
                const has = item.check(a);
                return (
                  <td key={a.id} style={{ padding: "6px 8px", textAlign: "center" }}>
                    <span style={{
                      color: has ? "var(--accent-green)" : "var(--text-muted)",
                      fontSize: 13,
                    }}>
                      {has ? "+" + item.points : "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td style={{ padding: "8px 8px", fontWeight: 600, color: "var(--text-primary)" }}>Total (capped at 10)</td>
            <td />
            {apartments.map((a, i) => (
              <td key={a.id} style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                {scoreCriterion(c, a).toFixed(1)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function BinaryBreakdown({ criterion: c, apartments }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {apartments.map((a, i) => {
        const passes = c.check(a);
        return (
          <div key={a.id} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS[i % COLORS.length] }}>
              {a.name.split("/")[0]}
            </span>
            <span style={{
              fontSize: 12,
              color: passes ? "var(--accent-green)" : "var(--text-muted)",
              fontWeight: 500,
            }}>
              {passes ? c.trueLabel + " (10)" : c.falseLabel + " (0)"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ScaleBreakdown({ criterion: c, apartments }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {apartments.map((a, i) => {
        const score = scoreCriterion(c, a);
        return (
          <div key={a.id} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS[i % COLORS.length] }}>
              {a.name.split("/")[0]}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {c.formatValue(a)} → {score}/10
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Shared table showing each apartment's value and score for a bracket criterion
function ApartmentScoreTable({ criterion: c, apartments, brackets }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {apartments.map((a, i) => {
        const value = c.getValue(a);
        const score = scoreCriterion(c, a, brackets);
        return (
          <div key={a.id} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS[i % COLORS.length] }}>
              {a.name.split("/")[0]}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {c.formatValue(value)}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length],
              background: COLORS[i % COLORS.length] + "15",
              padding: "2px 6px", borderRadius: 4,
            }}>
              {score}/10
            </span>
          </div>
        );
      })}
    </div>
  );
}

