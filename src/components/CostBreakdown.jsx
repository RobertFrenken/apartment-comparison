const fmt = (n) => `$${n.toLocaleString()}`;
const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

function Bar({ value, max, color, label }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div style={{ width: 120, fontSize: 12, color: "var(--text-secondary)", textAlign: "right", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: "var(--bg-primary)", borderRadius: 6, height: 24, position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color + "25", borderRadius: 5, transition: "width 0.3s" }} />
        <span style={{ position: "absolute", left: 10, top: 3, fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{fmt(value)}</span>
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
    const totalStay = moveIn + totalMonthly * (stayMonths - 1);
    return { ...a, rent, utils, monthly, gas, totalMonthly, stayDays, stayMonths, moveIn, totalStay };
  });

  const maxMonthly = Math.max(...costs.map((c) => c.totalMonthly));
  const maxMoveIn = Math.max(...costs.map((c) => c.moveIn));
  const maxTotal = Math.max(...costs.map((c) => c.totalStay));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Monthly Comparison */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 20 }}>
          Monthly Cost Breakdown
        </h3>
        {costs.map((c, i) => (
          <div key={c.id} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: COLORS[i % COLORS.length] }}>
              {c.name}
            </div>
            <Bar label="Rent" value={c.rent} max={maxMonthly} color="#059669" />
            <Bar label="Utilities" value={c.utils} max={maxMonthly} color="#d97706" />
            <Bar label="Gas/Commute" value={c.gas} max={maxMonthly} color="#2563eb" />
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 10, paddingTop: 10 }}>
              <Bar label="TOTAL / month" value={c.totalMonthly} max={maxMonthly} color={COLORS[i % COLORS.length]} />
            </div>
          </div>
        ))}
      </div>

      {/* Move-in & Total */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>Move-in Cost</h3>
          {costs.map((c, i) => (
            <Bar key={c.id} label={c.name.split(" ")[0]} value={c.moveIn} max={maxMoveIn} color={COLORS[i % COLORS.length]} />
          ))}
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>
            Total Stay Cost ({costs[0]?.stayDays} days)
          </h3>
          {costs.map((c, i) => (
            <Bar key={c.id} label={c.name.split(" ")[0]} value={Math.round(c.totalStay)} max={maxTotal} color={COLORS[i % COLORS.length]} />
          ))}
        </div>
      </div>

      {/* Summary Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>Cost Summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-secondary)", borderBottom: "2px solid var(--border)", fontWeight: 500 }}>Metric</th>
              {costs.map((c, i) => (
                <th key={c.id} style={{ textAlign: "right", padding: "10px 12px", color: COLORS[i % COLORS.length], borderBottom: "2px solid var(--border)", fontWeight: 600 }}>
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
            ].map(([label, fn], ri) => {
              const isTotal = label.startsWith("=") || label.startsWith("Total");
              return (
                <tr key={label} style={{ background: ri % 2 === 0 ? "var(--bg-row-even)" : "var(--bg-row-odd)" }}>
                  <td style={{ padding: "10px 12px", color: isTotal ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isTotal ? 600 : 400 }}>{label}</td>
                  {costs.map((c) => (
                    <td key={c.id} style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-primary)", fontWeight: isTotal ? 600 : 400 }}>{fn(c)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
