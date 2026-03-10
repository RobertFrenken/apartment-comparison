import Badge from "./Badge.jsx";

const fmt = (n) => `$${n.toLocaleString()}`;
const COLORS = ["#4f9eff", "#00d4aa", "#f59e0b", "#a78bfa", "#ef4444", "#22c55e"];

function Bar({ value, max, color, label }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 120, fontSize: 11, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: "#0f172a", borderRadius: 4, height: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color + "66", borderRadius: 4, transition: "width 0.3s" }} />
        <span style={{ position: "absolute", left: 8, top: 2, fontSize: 11, color, fontWeight: 600 }}>{fmt(value)}</span>
      </div>
    </div>
  );
}

export default function CostBreakdown({ apartments }) {
  if (apartments.length === 0) return null;

  const costs = apartments.map((a) => {
    const rent = a.financials.monthly_rent;
    const utils = a.financials.est_monthly_utilities || 0;
    const monthly = rent + utils;
    const gas = a.commute?.est_monthly_gas || 0;
    const totalMonthly = monthly + gas;
    const stayDays = a.lease.available_from && a.lease.available_until
      ? Math.round((new Date(a.lease.available_until) - new Date(a.lease.available_from)) / 86400000)
      : 90;
    const stayMonths = stayDays / 30;
    const moveIn = rent + a.financials.security_deposit + (a.financials.application_fee || 0) + (a.financials.cleaning_fee || 0);
    const totalStay = moveIn + totalMonthly * (stayMonths - 1); // first month included in move-in
    return { ...a, rent, utils, monthly, gas, totalMonthly, stayDays, stayMonths, moveIn, totalStay };
  });

  const maxMonthly = Math.max(...costs.map((c) => c.totalMonthly));
  const maxMoveIn = Math.max(...costs.map((c) => c.moveIn));
  const maxTotal = Math.max(...costs.map((c) => c.totalStay));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Monthly Comparison */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 16 }}>
          MONTHLY COST BREAKDOWN
        </div>
        {costs.map((c, i) => (
          <div key={c.id} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: COLORS[i % COLORS.length] }}>
              {c.name}
            </div>
            <Bar label="Rent" value={c.rent} max={maxMonthly} color="#00d4aa" />
            <Bar label="Utilities" value={c.utils} max={maxMonthly} color="#f59e0b" />
            <Bar label="Gas/Commute" value={c.gas} max={maxMonthly} color="#4f9eff" />
            <div style={{ borderTop: "1px solid #1e293b", marginTop: 8, paddingTop: 8 }}>
              <Bar label="TOTAL / month" value={c.totalMonthly} max={maxMonthly} color={COLORS[i % COLORS.length]} />
            </div>
          </div>
        ))}
      </div>

      {/* Move-in & Total */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 16 }}>
            MOVE-IN COST
          </div>
          {costs.map((c, i) => (
            <Bar key={c.id} label={c.name.split(" ")[0]} value={c.moveIn} max={maxMoveIn} color={COLORS[i % COLORS.length]} />
          ))}
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 16 }}>
            TOTAL STAY COST ({costs[0]?.stayDays} days)
          </div>
          {costs.map((c, i) => (
            <Bar key={c.id} label={c.name.split(" ")[0]} value={Math.round(c.totalStay)} max={maxTotal} color={COLORS[i % COLORS.length]} />
          ))}
        </div>
      </div>

      {/* Summary Table */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 16 }}>
          COST SUMMARY
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, color: "#64748b", borderBottom: "1px solid #1e293b" }}>Metric</th>
              {costs.map((c, i) => (
                <th key={c.id} style={{ textAlign: "right", padding: 8, color: COLORS[i % COLORS.length], borderBottom: "1px solid #1e293b" }}>
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Monthly Rent", (c) => fmt(c.rent)],
              ["+ Utilities", (c) => c.utils ? fmt(c.utils) : "Included"],
              ["+ Gas/Commute", (c) => fmt(Math.round(c.gas))],
              ["= Monthly Total", (c) => fmt(Math.round(c.totalMonthly))],
              ["Move-in Cost", (c) => fmt(c.moveIn)],
              [`Total Stay (${costs[0]?.stayDays}d)`, (c) => fmt(Math.round(c.totalStay))],
              ["Cost / day", (c) => fmt(Math.round(c.totalStay / c.stayDays))],
            ].map(([label, fn], ri) => (
              <tr key={label} style={{ background: ri % 2 === 0 ? "#0a0f1a" : "transparent" }}>
                <td style={{ padding: 8, color: label.startsWith("=") || label.startsWith("Total") ? "#e2e8f0" : "#94a3b8", fontWeight: label.startsWith("=") || label.startsWith("Total") ? 600 : 400 }}>{label}</td>
                {costs.map((c) => (
                  <td key={c.id} style={{ padding: 8, textAlign: "right", color: "#e2e8f0" }}>{fn(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
