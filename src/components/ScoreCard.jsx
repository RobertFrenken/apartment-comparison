const COLORS = ["#4f9eff", "#00d4aa", "#f59e0b", "#a78bfa", "#ef4444", "#22c55e"];

const CRITERIA = [
  {
    name: "Monthly Cost",
    weight: 25,
    score: (a) => {
      const total = a.financials.monthly_rent + (a.financials.est_monthly_utilities || 0);
      if (total <= 4000) return 10;
      if (total <= 4500) return 8;
      if (total <= 5000) return 6;
      if (total <= 5500) return 4;
      return 2;
    },
    detail: (a) => `$${(a.financials.monthly_rent + (a.financials.est_monthly_utilities || 0)).toLocaleString()}/mo`,
  },
  {
    name: "LLNL Proximity",
    weight: 20,
    score: (a) => {
      const d = a.location.dist_llnl_miles;
      if (d <= 2) return 10;
      if (d <= 4) return 8;
      if (d <= 6) return 6;
      if (d <= 10) return 4;
      return 2;
    },
    detail: (a) => `${a.location.dist_llnl_miles} mi / ~${a.location.drive_time_llnl_min} min`,
  },
  {
    name: "Space (sq ft)",
    weight: 15,
    score: (a) => {
      const s = a.space.sqft;
      if (s >= 1500) return 10;
      if (s >= 1300) return 8;
      if (s >= 1100) return 6;
      if (s >= 900) return 4;
      return 2;
    },
    detail: (a) => `${a.space.sqft?.toLocaleString()} sq ft`,
  },
  {
    name: "Amenities",
    weight: 15,
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
    detail: (a) => {
      const highlights = [];
      if (a.amenities.internet) highlights.push("WiFi");
      if (a.space.pool) highlights.push("Pool");
      if (a.appliances.fireplace) highlights.push("Fireplace");
      if (a.amenities.community_amenities?.length) highlights.push(...a.amenities.community_amenities);
      return highlights.join(", ") || "Basic";
    },
  },
  {
    name: "Pet Friendly",
    weight: 5,
    score: (a) => a.rules.pets_allowed ? 10 : 0,
    detail: (a) => a.rules.pets_allowed ? "Yes" : "No",
  },
  {
    name: "Move-in Cost",
    weight: 10,
    score: (a) => {
      const total = a.financials.monthly_rent + a.financials.security_deposit + (a.financials.application_fee || 0) + (a.financials.cleaning_fee || 0);
      if (total <= 5000) return 10;
      if (total <= 7000) return 8;
      if (total <= 9000) return 6;
      if (total <= 11000) return 4;
      return 2;
    },
    detail: (a) => {
      const total = a.financials.monthly_rent + a.financials.security_deposit + (a.financials.application_fee || 0) + (a.financials.cleaning_fee || 0);
      return `$${total.toLocaleString()}`;
    },
  },
  {
    name: "Remote Work",
    weight: 10,
    score: (a) => (a.remote_work?.score || 3) * 2,
    detail: (a) => `${a.remote_work?.score || "?"}/5`,
  },
];

function ScoreBar({ score, maxScore, color }) {
  const pct = (score / maxScore) * 100;
  return (
    <div style={{ width: 80, height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.3s" }} />
    </div>
  );
}

export default function ScoreCard({ apartments }) {
  if (apartments.length === 0) return null;

  const scored = apartments.map((a, i) => {
    const scores = CRITERIA.map((c) => ({
      name: c.name,
      weight: c.weight,
      raw: c.score(a),
      weighted: (c.score(a) / 10) * c.weight,
      detail: c.detail(a),
    }));
    const total = scores.reduce((sum, s) => sum + s.weighted, 0);
    return { apartment: a, scores, total, color: COLORS[i % COLORS.length] };
  });

  const winner = scored.reduce((a, b) => (a.total > b.total ? a : b));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Overall Scores */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 16 }}>
          OVERALL RANKING
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {scored.sort((a, b) => b.total - a.total).map((s, i) => (
            <div key={s.apartment.id} style={{
              flex: "1 1 250px", background: "#020817", border: `1px solid ${s === winner ? "#22c55e" : "#1e293b"}`,
              borderRadius: 10, padding: 20, position: "relative",
            }}>
              {s === winner && (
                <div style={{ position: "absolute", top: -10, right: 12, background: "#22c55e", color: "#020817",
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>
                  BEST MATCH
                </div>
              )}
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {s.total.toFixed(1)}
              </div>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>/ 100 POINTS</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{s.apartment.name}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{s.apartment.location.neighborhood}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 16 }}>
          SCORING BREAKDOWN (weights sum to 100)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, color: "#64748b", borderBottom: "1px solid #1e293b" }}>Criterion</th>
              <th style={{ textAlign: "center", padding: 8, color: "#64748b", borderBottom: "1px solid #1e293b", width: 60 }}>Weight</th>
              {scored.map((s) => (
                <th key={s.apartment.id} style={{ textAlign: "center", padding: 8, color: s.color, borderBottom: "1px solid #1e293b" }}>
                  {s.apartment.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, ci) => (
              <tr key={c.name} style={{ background: ci % 2 === 0 ? "#0a0f1a" : "transparent" }}>
                <td style={{ padding: 8, color: "#94a3b8" }}>{c.name}</td>
                <td style={{ padding: 8, textAlign: "center", color: "#475569" }}>{c.weight}%</td>
                {scored.map((s) => {
                  const sc = s.scores[ci];
                  return (
                    <td key={s.apartment.id} style={{ padding: 8, textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <ScoreBar score={sc.raw} maxScore={10} color={s.color} />
                        <span style={{ fontSize: 11, color: "#e2e8f0" }}>{sc.weighted.toFixed(1)}</span>
                        <span style={{ fontSize: 10, color: "#475569" }}>{sc.detail}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #1e293b" }}>
              <td style={{ padding: 8, color: "#e2e8f0", fontWeight: 700 }}>TOTAL</td>
              <td style={{ padding: 8, textAlign: "center", color: "#475569" }}>100%</td>
              {scored.map((s) => (
                <td key={s.apartment.id} style={{ padding: 8, textAlign: "center", fontWeight: 700, fontSize: 14, color: s.color }}>
                  {s.total.toFixed(1)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Methodology Note */}
      <div style={{ fontSize: 10, color: "#334155", padding: "0 8px" }}>
        Scores are calculated from raw listing data. Adjust weights in src/components/ScoreCard.jsx to match your priorities.
        Pet friendliness weighted low by default — increase if bringing a dog.
      </div>
    </div>
  );
}
