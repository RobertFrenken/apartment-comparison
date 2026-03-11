import { CRITERIA, DEFAULT_WEIGHTS, scoreCriterion } from "../lib/scoring.js";
import { COLORS, RADAR } from "../lib/constants.js";
import { cardStyle } from "../lib/styles.js";

function axisPoint(axisIndex, fraction, numAxes, r = RADAR.radius) {
  const angle = (2 * Math.PI * axisIndex) / numAxes - Math.PI / 2;
  return [RADAR.cx + r * fraction * Math.cos(angle), RADAR.cy + r * fraction * Math.sin(angle)];
}

function polyPoints(points) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

export default function RadarChart({ apartments, weights = DEFAULT_WEIGHTS }) {
  if (!apartments || apartments.length === 0) return null;

  // Only show axes for criteria with non-zero weight
  const activeCriteria = CRITERIA.filter((c) => (weights[c.key] ?? 0) > 0);
  const numAxes = activeCriteria.length;
  if (numAxes < RADAR.minAxes) return null;

  const aptScores = apartments.map((apt) =>
    activeCriteria.map((c) => scoreCriterion(c, apt) / 10)
  );

  const axisEndpoints = activeCriteria.map((_, i) => axisPoint(i, 1.0, numAxes));
  const labelPoints = activeCriteria.map((_, i) => axisPoint(i, 1.0, numAxes, RADAR.labelRadius));

  function labelStyle(axisIndex) {
    const angle = (2 * Math.PI * axisIndex) / numAxes - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let textAnchor = "middle";
    if (cos > 0.2) textAnchor = "start";
    if (cos < -0.2) textAnchor = "end";
    let dominantBaseline = "middle";
    if (sin < -0.5) dominantBaseline = "auto";
    if (sin > 0.5) dominantBaseline = "hanging";
    return { textAnchor, dominantBaseline };
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>
        Performance Radar
      </h3>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        Each axis scored 0-10. Criteria with 0% weight are hidden.
      </p>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
        {apartments.map((apt, i) => (
          <div key={apt.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 2,
              background: COLORS[i % COLORS.length],
              opacity: 0.85,
            }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
              {apt.name}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          viewBox={RADAR.viewBox}
          style={{ width: "100%", maxWidth: 400, display: "block" }}
          aria-label={`Radar chart comparing apartment scores across ${numAxes} criteria`}
        >
          {/* Concentric guide rings */}
          {RADAR.rings.map((fraction) => {
            const ringPoints = activeCriteria.map((_, i) => axisPoint(i, fraction, numAxes));
            return (
              <polygon
                key={fraction}
                points={polyPoints(ringPoints)}
                fill="none"
                stroke="var(--border, #e2e8f0)"
                strokeWidth={fraction === 1.0 ? 1.2 : 0.8}
                strokeDasharray={fraction === 1.0 ? "none" : "3,3"}
                opacity={0.7}
              />
            );
          })}

          {/* Ring percentage labels */}
          {RADAR.rings.map((fraction) => {
            const [, y] = axisPoint(0, fraction, numAxes);
            return (
              <text
                key={`ring-label-${fraction}`}
                x={RADAR.cx + 6}
                y={y}
                fontSize={8}
                fill="var(--text-muted, #94a3b8)"
                textAnchor="start"
                dominantBaseline="middle"
              >
                {fraction * 100}%
              </text>
            );
          })}

          {/* Axis lines */}
          {axisEndpoints.map(([x, y], i) => (
            <line
              key={`axis-${i}`}
              x1={RADAR.cx} y1={RADAR.cy} x2={x} y2={y}
              stroke="var(--border, #e2e8f0)"
              strokeWidth={0.8}
              opacity={0.8}
            />
          ))}

          {/* Data polygons */}
          {[...aptScores].reverse().map((scores, ri) => {
            const ai = aptScores.length - 1 - ri;
            const color = COLORS[ai % COLORS.length];
            const pts = scores.map((score, axisIdx) => axisPoint(axisIdx, score, numAxes));
            return (
              <polygon
                key={`apt-poly-${ai}`}
                points={polyPoints(pts)}
                fill={color}
                fillOpacity={0.15}
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeOpacity={0.9}
              />
            );
          })}

          {/* Data point dots */}
          {aptScores.map((scores, ai) => {
            const color = COLORS[ai % COLORS.length];
            return scores.map((score, axisIdx) => {
              const [x, y] = axisPoint(axisIdx, score, numAxes);
              return (
                <circle
                  key={`dot-${ai}-${axisIdx}`}
                  cx={x} cy={y} r={RADAR.dotRadius}
                  fill={color} stroke="#fff" strokeWidth={1} opacity={0.9}
                />
              );
            });
          })}

          {/* Axis labels with weight */}
          {activeCriteria.map((c, i) => {
            const [lx, ly] = labelPoints[i];
            const { textAnchor, dominantBaseline } = labelStyle(i);
            const w = weights[c.key] ?? 0;
            return (
              <text
                key={`label-${i}`}
                x={lx} y={ly}
                fontSize={10} fontWeight={600}
                fill="var(--text-secondary, #64748b)"
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                fontFamily="inherit"
              >
                {c.name} ({w}%)
              </text>
            );
          })}

          <circle cx={RADAR.cx} cy={RADAR.cy} r={2.5} fill="var(--border, #e2e8f0)" />
        </svg>
      </div>
    </div>
  );
}
