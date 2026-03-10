const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

const CRITERIA = [
  {
    name: "Monthly Cost",
    score: (a) => {
      const total = a.financials.monthly_rent + (a.financials.est_monthly_utilities || 0);
      if (total <= 4000) return 10;
      if (total <= 4500) return 8;
      if (total <= 5000) return 6;
      if (total <= 5500) return 4;
      return 2;
    },
  },
  {
    name: "LLNL Proximity",
    score: (a) => {
      const d = a.location.dist_llnl_miles;
      if (d <= 2) return 10;
      if (d <= 4) return 8;
      if (d <= 6) return 6;
      if (d <= 10) return 4;
      return 2;
    },
  },
  {
    name: "Space",
    score: (a) => {
      const s = a.space.sqft;
      if (s >= 1500) return 10;
      if (s >= 1300) return 8;
      if (s >= 1100) return 6;
      if (s >= 900) return 4;
      return 2;
    },
  },
  {
    name: "Amenities",
    score: (a) => {
      let s = 0;
      if (a.amenities.internet) s += 2;
      if (a.amenities.ac) s += 1;
      if (a.appliances.washer_dryer) s += 2;
      if (a.space.pool) s += 1;
      if (a.amenities.community_amenities?.length > 0) s += 1;
      if (a.appliances.fireplace) s += 1;
      if (a.appliances.water_softener) s += 1;
      if (a.amenities.near_transit) s += 1;
      return s;
    },
  },
  {
    name: "Pet Friendly",
    score: (a) => a.rules.pets_allowed ? 10 : 0,
  },
  {
    name: "Move-in Cost",
    score: (a) => {
      const total = a.financials.monthly_rent + a.financials.security_deposit + (a.financials.application_fee || 0) + (a.financials.cleaning_fee || 0);
      if (total <= 5000) return 10;
      if (total <= 7000) return 8;
      if (total <= 9000) return 6;
      if (total <= 11000) return 4;
      return 2;
    },
  },
  {
    name: "Remote Work",
    score: (a) => (a.remote_work?.score || 3) * 2,
  },
];

const NUM_AXES = CRITERIA.length;
const CX = 200;
const CY = 200;
const R = 140; // outer radius for data
const LABEL_R = 168; // radius at which labels are placed
const RINGS = [0.25, 0.5, 0.75, 1.0];

// Return [x, y] for a given axis index and radius fraction (0-1)
function axisPoint(axisIndex, fraction, r = R) {
  // Start at top (-π/2) and go clockwise
  const angle = (2 * Math.PI * axisIndex) / NUM_AXES - Math.PI / 2;
  return [CX + r * fraction * Math.cos(angle), CY + r * fraction * Math.sin(angle)];
}

// Build a polygon points string from an array of [x, y] pairs
function polyPoints(points) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

export default function RadarChart({ apartments }) {
  if (!apartments || apartments.length === 0) return null;

  // Compute normalized scores (0-1) per apartment per criterion
  const aptScores = apartments.map((apt) =>
    CRITERIA.map((c) => c.score(apt) / 10)
  );

  // Axis endpoints (at full radius, for drawing axis lines and labels)
  const axisEndpoints = CRITERIA.map((_, i) => axisPoint(i, 1.0));
  const labelPoints = CRITERIA.map((_, i) => axisPoint(i, 1.0, LABEL_R));

  // Compute label anchor and alignment per axis angle
  function labelStyle(axisIndex) {
    const angle = (2 * Math.PI * axisIndex) / NUM_AXES - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // textAnchor: left side → start, right side → end, near top/bottom → middle
    let textAnchor = "middle";
    if (cos > 0.2) textAnchor = "start";
    if (cos < -0.2) textAnchor = "end";
    // dominantBaseline: top of chart → auto (text below), bottom → hanging (text above)
    let dominantBaseline = "middle";
    if (sin < -0.5) dominantBaseline = "auto";
    if (sin > 0.5) dominantBaseline = "hanging";
    return { textAnchor, dominantBaseline };
  }

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 24,
      boxShadow: "var(--shadow-sm)",
    }}>
      <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>
        Performance Radar
      </h3>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        Each axis scored 0-10. Larger area = better overall profile.
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

      {/* SVG — viewBox 400x400, displayed at max 400px centered */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          viewBox="0 0 400 400"
          style={{ width: "100%", maxWidth: 400, display: "block" }}
          aria-label="Radar chart comparing apartment scores across 7 criteria"
        >
          {/* Concentric guide rings */}
          {RINGS.map((fraction) => {
            const ringPoints = CRITERIA.map((_, i) => axisPoint(i, fraction));
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

          {/* Ring percentage labels (right side of chart) */}
          {RINGS.map((fraction) => {
            const [x, y] = axisPoint(0, fraction); // top axis
            // Place label just to the right of the right-most ring intersection
            const [rx] = axisPoint(Math.floor(NUM_AXES * 0.15), fraction);
            return (
              <text
                key={`ring-label-${fraction}`}
                x={CX + 6}
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

          {/* Axis lines from center to edge */}
          {axisEndpoints.map(([x, y], i) => (
            <line
              key={`axis-${i}`}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="var(--border, #e2e8f0)"
              strokeWidth={0.8}
              opacity={0.8}
            />
          ))}

          {/* Data polygons — render back-to-front so first apartment is on top */}
          {[...aptScores].reverse().map((scores, ri) => {
            const ai = aptScores.length - 1 - ri; // original index
            const color = COLORS[ai % COLORS.length];
            const pts = scores.map((score, axisIdx) => axisPoint(axisIdx, score));
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
              const [x, y] = axisPoint(axisIdx, score);
              return (
                <circle
                  key={`dot-${ai}-${axisIdx}`}
                  cx={x}
                  cy={y}
                  r={3}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1}
                  opacity={0.9}
                />
              );
            });
          })}

          {/* Axis labels */}
          {CRITERIA.map((c, i) => {
            const [lx, ly] = labelPoints[i];
            const { textAnchor, dominantBaseline } = labelStyle(i);
            return (
              <text
                key={`label-${i}`}
                x={lx}
                y={ly}
                fontSize={10}
                fontWeight={600}
                fill="var(--text-secondary, #64748b)"
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                fontFamily="inherit"
              >
                {c.name}
              </text>
            );
          })}

          {/* Center dot */}
          <circle cx={CX} cy={CY} r={2.5} fill="var(--border, #e2e8f0)" />
        </svg>
      </div>
    </div>
  );
}
