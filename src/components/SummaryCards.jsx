import { calcOverallScore, costPerPerson } from "../lib/scoring.js";
import { totalMonthlyCost } from "../lib/costs.js";
import { COLORS } from "../lib/constants.js";

function calcVerdicts(apartments, weights, brackets) {
  const totalCosts = apartments.map(totalMonthlyCost);
  const scores = apartments.map((a) => calcOverallScore(a, weights, brackets));
  const sqfts = apartments.map((a) => a.space.sqft ?? 0);
  const dists = apartments.map((a) => a.location.dist_llnl_miles);
  const cpps = apartments.map(costPerPerson);

  const minCost = Math.min(...totalCosts);
  const maxScore = Math.max(...scores);
  const maxSqft = Math.max(...sqfts);
  const minDist = Math.min(...dists);
  const minCpp = Math.min(...cpps);

  return apartments.map((a, i) => {
    const tags = [];
    if (totalCosts[i] === minCost) tags.push({ label: "Best Value", color: "var(--accent-green)" });
    if (cpps[i] === minCpp) tags.push({ label: "Best $/Person", color: "#0d9488" });
    if (dists[i] === minDist) tags.push({ label: "Closest", color: "var(--accent-blue)" });
    if (sqfts[i] === maxSqft) tags.push({ label: "Most Space", color: "var(--accent-purple)" });
    if (scores[i] === maxScore) tags.push({ label: "Best Overall", color: "#0891b2" });
    return tags;
  });
}

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

export default function SummaryCards({ apartments, weights, brackets }) {
  if (!apartments || apartments.length === 0) return null;

  const verdicts = calcVerdicts(apartments, weights, brackets);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: 12,
      marginBottom: 20,
    }}>
      {apartments.map((a, i) => {
        const total = totalMonthlyCost(a);
        const cpp = costPerPerson(a);
        const score = calcOverallScore(a, weights, brackets);
        const accentColor = COLORS[i % COLORS.length];
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
            <div style={{
              fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
              lineHeight: 1.3, overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>{a.name}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <StatRow label="Monthly total" value={`$${total.toLocaleString()}/mo`} valueColor={costColor(total)} />
              <StatRow label="Cost / person" value={`$${cpp.toLocaleString()}/mo`} valueColor={costColor(cpp * 2)} />
              <StatRow label="Square footage" value={a.space.sqft ? `${a.space.sqft.toLocaleString()} sq ft` : "N/A"} />
              <StatRow label="Dist. to LLNL" value={`${a.location.dist_llnl_miles} mi`} />
              <StatRow label="Overall score" value={`${score.toFixed(1)} / 100`} valueColor={accentColor} />
            </div>

            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                {tags.map((t) => (
                  <span key={t.label} style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                    padding: "2px 7px", borderRadius: 4,
                    background: "transparent",
                    border: `1px solid ${t.color}`,
                    color: t.color,
                  }}>{t.label}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
