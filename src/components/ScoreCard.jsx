const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

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
    <div style={{ width: 80, height: 8, background: "var(--bg-primary)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }} />
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Overall Scores */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 20 }}>Overall Ranking</h3>
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
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ 100 points</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10, color: "var(--text-primary)" }}>{s.apartment.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{s.apartment.location.neighborhood}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 20 }}>
          Scoring Breakdown
          <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>weights sum to 100</span>
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-secondary)", borderBottom: "2px solid var(--border)", fontWeight: 500 }}>Criterion</th>
              <th style={{ textAlign: "center", padding: "10px 12px", color: "var(--text-secondary)", borderBottom: "2px solid var(--border)", width: 60, fontWeight: 500 }}>Weight</th>
              {scored.map((s) => (
                <th key={s.apartment.id} style={{ textAlign: "center", padding: "10px 12px", color: s.color, borderBottom: "2px solid var(--border)", fontWeight: 600 }}>
                  {s.apartment.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, ci) => (
              <tr key={c.name} style={{ background: ci % 2 === 0 ? "var(--bg-row-even)" : "var(--bg-row-odd)" }}>
                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{c.name}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--text-muted)" }}>{c.weight}%</td>
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
              <td style={{ padding: "12px 12px", textAlign: "center", color: "var(--text-muted)" }}>100%</td>
              {scored.map((s) => (
                <td key={s.apartment.id} style={{ padding: "12px 12px", textAlign: "center", fontWeight: 700, fontSize: 16, color: s.color }}>
                  {s.total.toFixed(1)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", padding: "0 4px" }}>
        Adjust weights in src/components/ScoreCard.jsx to match your priorities.
        If bringing a dog, increase Pet Friendly weight from 5% to 15-20%.
      </p>
    </div>
  );
}
