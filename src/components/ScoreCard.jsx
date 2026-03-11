import RadarChart from "./RadarChart.jsx";
import WeightSliders from "./WeightSliders.jsx";
import { CRITERIA, scoreCriterion, criterionDetail, calcOverallScore, costPerPerson } from "../lib/scoring.js";
import { COLORS } from "../lib/constants.js";
import { cardStyle, sectionHeading, thStyle, rowBg } from "../lib/styles.js";

function ScoreBar({ score, maxScore, color }) {
  const pct = (score / maxScore) * 100;
  return (
    <div style={{ width: 80, height: 8, background: "var(--bg-primary)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }} />
    </div>
  );
}

export default function ScoreCard({ apartments, weights, brackets, onWeightsChange }) {
  if (apartments.length === 0) return null;

  const scored = apartments.map((a, i) => {
    const scores = CRITERIA.map((c) => {
      const raw = scoreCriterion(c, a, brackets);
      const w = weights[c.key] ?? 0;
      return {
        key: c.key,
        name: c.name,
        weight: w,
        raw,
        weighted: (raw / 10) * w,
        detail: criterionDetail(c, a),
      };
    });
    const total = calcOverallScore(a, weights, brackets);
    return { apartment: a, scores, total, color: COLORS[i % COLORS.length] };
  });

  const winner = scored.reduce((a, b) => (a.total > b.total ? a : b));
  const weightTotal = Object.values(weights).reduce((s, v) => s + v, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Weight Sliders */}
      <WeightSliders weights={weights} onChange={onWeightsChange} />

      {/* Overall Scores */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Overall Ranking</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {scored.sort((a, b) => b.total - a.total).map((s) => (
            <div key={s.apartment.id} style={{
              flex: "1 1 250px", background: "var(--bg-primary)",
              border: `2px solid ${s === winner ? "#059669" : "var(--border)"}`,
              borderRadius: 10, padding: 24, position: "relative",
            }}>
              {s === winner && (
                <div style={{ position: "absolute", top: -12, right: 16, background: "#059669", color: "#fff",
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.5 }}>
                  BEST MATCH
                </div>
              )}
              <div style={{ fontSize: 40, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {s.total.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ {weightTotal} points</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10, color: "var(--text-primary)" }}>{s.apartment.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                {s.apartment.location.neighborhood} &middot; ${costPerPerson(s.apartment).toLocaleString()}/person
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Chart */}
      <RadarChart apartments={apartments} weights={weights} />

      {/* Detailed Breakdown */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>
          Scoring Breakdown
          <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>
            weights sum to {weightTotal}
          </span>
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>Criterion</th>
              <th style={{ ...thStyle, textAlign: "center", width: 60 }}>Weight</th>
              {scored.map((s) => (
                <th key={s.apartment.id} style={{ ...thStyle, textAlign: "center", color: s.color, fontWeight: 600 }}>
                  {s.apartment.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, ci) => (
              <tr key={c.key} style={{ background: rowBg(ci) }}>
                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{c.name}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--text-muted)" }}>{weights[c.key] ?? 0}%</td>
                {scored.map((s) => {
                  const sc = s.scores[ci];
                  return (
                    <td key={s.apartment.id} style={{ padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <ScoreBar score={sc.raw} maxScore={10} color={s.color} />
                        <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{sc.weighted.toFixed(1)}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{sc.detail}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid var(--border)" }}>
              <td style={{ padding: "12px 12px", color: "var(--text-primary)", fontWeight: 700 }}>TOTAL</td>
              <td style={{ padding: "12px 12px", textAlign: "center", color: "var(--text-muted)" }}>{weightTotal}%</td>
              {scored.map((s) => (
                <td key={s.apartment.id} style={{ padding: "12px 12px", textAlign: "center", fontWeight: 700, fontSize: 16, color: s.color }}>
                  {s.total.toFixed(1)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
