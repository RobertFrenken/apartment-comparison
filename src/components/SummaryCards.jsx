// Shared scoring logic — mirrors CRITERIA in ScoreCard.jsx exactly.
// If you update weights/scoring there, update here too.
const CRITERIA = [
  {
    weight: 25,
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
    weight: 20,
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
    weight: 15,
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
  },
  {
    weight: 5,
    score: (a) => (a.rules.pets_allowed ? 10 : 0),
  },
  {
    weight: 10,
    score: (a) => {
      const total =
        a.financials.monthly_rent +
        a.financials.security_deposit +
        (a.financials.application_fee || 0) +
        (a.financials.cleaning_fee || 0);
      if (total <= 5000) return 10;
      if (total <= 7000) return 8;
      if (total <= 9000) return 6;
      if (total <= 11000) return 4;
      return 2;
    },
  },
  {
    weight: 10,
    score: (a) => (a.remote_work?.score || 3) * 2,
  },
];

function calcOverallScore(a) {
  return CRITERIA.reduce((sum, c) => sum + (c.score(a) / 10) * c.weight, 0);
}

function calcTotalCost(a) {
  return a.financials.monthly_rent + (a.financials.est_monthly_utilities || 0);
}

// Verdict tags: an apartment can carry multiple if it wins multiple dimensions.
function calcVerdicts(apartments) {
  const totalCosts = apartments.map(calcTotalCost);
  const scores = apartments.map(calcOverallScore);
  const sqfts = apartments.map((a) => a.space.sqft ?? 0);
  const dists = apartments.map((a) => a.location.dist_llnl_miles);

  const minCost = Math.min(...totalCosts);
  const maxScore = Math.max(...scores);
  const maxSqft = Math.max(...sqfts);
  const minDist = Math.min(...dists);

  return apartments.map((a, i) => {
    const tags = [];
    if (totalCosts[i] === minCost) tags.push({ label: "Best Value", color: "var(--accent-green)" });
    if (dists[i] === minDist) tags.push({ label: "Closest", color: "var(--accent-blue)" });
    if (sqfts[i] === maxSqft) tags.push({ label: "Most Space", color: "var(--accent-purple)" });
    if (scores[i] === maxScore) tags.push({ label: "Best Overall", color: "#0891b2" });
    return tags;
  });
}

const CARD_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

function costColor(total) {
  if (total < 4500) return "var(--accent-green)";
  if (total < 5500) return "var(--accent-amber)";
  return "var(--accent-red)";
}

function StatRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || "var(--text-primary)", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

export default function SummaryCards({ apartments }) {
  if (!apartments || apartments.length === 0) return null;

  const verdicts = calcVerdicts(apartments);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: 12,
      marginBottom: 20,
    }}>
      {apartments.map((a, i) => {
        const total = calcTotalCost(a);
        const score = calcOverallScore(a);
        const accentColor = CARD_COLORS[i % CARD_COLORS.length];
        const tags = verdicts[i];

        return (
          <div key={a.id} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderTop: `3px solid ${accentColor}`,
            borderRadius: 8,
            padding: "14px 16px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {/* Header: number avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                lineHeight: 1.3, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>{a.name}</div>
            </div>

            {/* Key stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <StatRow
                label="Monthly total"
                value={`$${total.toLocaleString()}/mo`}
                valueColor={costColor(total)}
              />
              <StatRow
                label="Square footage"
                value={a.space.sqft ? `${a.space.sqft.toLocaleString()} sq ft` : "N/A"}
              />
              <StatRow
                label="Dist. to LLNL"
                value={`${a.location.dist_llnl_miles} mi`}
              />
              <StatRow
                label="Overall score"
                value={`${score.toFixed(1)} / 100`}
                valueColor={accentColor}
              />
            </div>

            {/* Verdict tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                {tags.map((t) => (
                  <span key={t.label} style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                    padding: "2px 7px", borderRadius: 4,
                    background: t.color, color: "#fff",
                  }}>{t.label.toUpperCase()}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
