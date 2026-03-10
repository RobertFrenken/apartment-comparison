import Badge, { BoolBadge } from "./Badge.jsx";

const fmt = (n) => n != null ? `$${n.toLocaleString()}` : "N/A";

const SECTIONS = [
  {
    title: "FINANCIALS",
    rows: [
      { label: "Monthly Rent", render: (a) => <Badge color="#00d4aa">{fmt(a.financials.monthly_rent)}/mo</Badge> },
      { label: "Utilities Included", render: (a) => <BoolBadge value={a.financials.utilities_included} /> },
      { label: "Est. Utilities", render: (a) => a.financials.utilities_included ? <Badge color="#22c55e">Included</Badge> : <Badge color="#f59e0b">~{fmt(a.financials.est_monthly_utilities)}/mo</Badge> },
      { label: "Total Monthly Cost", render: (a) => <Badge color="#00d4aa">{fmt(a.financials.monthly_rent + (a.financials.est_monthly_utilities || 0))}/mo</Badge> },
      { label: "Security Deposit", render: (a) => fmt(a.financials.security_deposit) },
      { label: "Application Fee", render: (a) => a.financials.application_fee ? fmt(a.financials.application_fee) : "None" },
      { label: "Cleaning Fee", render: (a) => fmt(a.financials.cleaning_fee) },
      { label: "Total Move-in Cost", render: (a) => {
        const total = a.financials.monthly_rent + a.financials.security_deposit + (a.financials.application_fee || 0) + (a.financials.cleaning_fee || 0);
        return <Badge color="#00d4aa">{fmt(total)}</Badge>;
      }},
    ],
  },
  {
    title: "SPACE & LAYOUT",
    rows: [
      { label: "Square Footage", render: (a) => `${a.space.sqft?.toLocaleString() || "N/A"} sq ft` },
      { label: "Price / sq ft", render: (a) => a.space.sqft ? `$${(a.financials.monthly_rent / a.space.sqft).toFixed(2)}/sq ft` : "N/A" },
      { label: "Bedrooms", render: (a) => a.space.bedrooms },
      { label: "Bedroom Details", render: (a) => a.space.bedroom_details?.map((b, i) => <Badge key={i} color="#a78bfa">{b}</Badge>) },
      { label: "Bathrooms", render: (a) => a.space.bathrooms },
      { label: "Parking", render: (a) => a.space.parking || "N/A" },
      { label: "Outdoor Space", render: (a) => a.space.outdoor_space || "N/A" },
      { label: "Pool", render: (a) => <BoolBadge value={a.space.pool} /> },
    ],
  },
  {
    title: "APPLIANCES",
    rows: [
      { label: "Washer/Dryer", render: (a) => <BoolBadge value={a.appliances.washer_dryer} /> },
      { label: "Dishwasher", render: (a) => <BoolBadge value={a.appliances.dishwasher} /> },
      { label: "Fireplace", render: (a) => <BoolBadge value={a.appliances.fireplace} /> },
      { label: "Water Softener/RO", render: (a) => <BoolBadge value={a.appliances.water_softener} /> },
    ],
  },
  {
    title: "AMENITIES",
    rows: [
      { label: "A/C", render: (a) => <BoolBadge value={a.amenities.ac} /> },
      { label: "Internet/WiFi", render: (a) => <BoolBadge value={a.amenities.internet} /> },
      { label: "TV", render: (a) => <BoolBadge value={a.amenities.tv} /> },
      { label: "Wheelchair Accessible", render: (a) => <BoolBadge value={a.amenities.wheelchair_accessible} /> },
      { label: "Near Transit", render: (a) => <BoolBadge value={a.amenities.near_transit} /> },
      { label: "Community Amenities", render: (a) => a.amenities.community_amenities?.length
        ? a.amenities.community_amenities.map((c, i) => <Badge key={i} color="#f59e0b">{c}</Badge>)
        : <span style={{ color: "#475569", fontStyle: "italic" }}>None listed</span>
      },
    ],
  },
  {
    title: "HOUSE RULES",
    rows: [
      { label: "Pets Allowed", render: (a) => <BoolBadge value={a.rules.pets_allowed} /> },
      { label: "Smoking", render: (a) => <BoolBadge value={a.rules.smoking} trueLabel="Allowed" falseLabel="Not Allowed" /> },
      { label: "Max Occupancy", render: (a) => a.rules.max_occupancy || "N/A" },
    ],
  },
  {
    title: "LOCATION",
    rows: [
      { label: "Area", render: (a) => `${a.location.city}, ${a.location.state} ${a.location.zip}` },
      { label: "Neighborhood", render: (a) => a.location.neighborhood },
      { label: "Distance to LLNL", render: (a) => <Badge color="#4f9eff">{a.location.dist_llnl_miles} mi</Badge> },
      { label: "Drive Time to LLNL", render: (a) => <Badge color="#4f9eff">~{a.location.drive_time_llnl_min} min</Badge> },
      { label: "Nearest Grocery", render: (a) => a.location.nearest_grocery?.map((g, i) =>
        <div key={i} style={{ fontSize: 11, marginBottom: 2 }}>{g.name} — {g.dist_miles} mi</div>
      )},
      { label: "Nearest Hospital", render: (a) => a.location.nearest_hospital
        ? `${a.location.nearest_hospital.name} (${a.location.nearest_hospital.dist_miles} mi)`
        : "N/A"
      },
    ],
  },
  {
    title: "LEASE TERMS",
    rows: [
      { label: "Contract Type", render: (a) => a.lease.contract_type },
      { label: "Available From", render: (a) => a.lease.available_from },
      { label: "Available Until", render: (a) => a.lease.available_until },
      { label: "Stay Duration", render: (a) => {
        if (!a.lease.available_from || !a.lease.available_until) return "N/A";
        const days = Math.round((new Date(a.lease.available_until) - new Date(a.lease.available_from)) / 86400000);
        return `${days} days (~${(days / 30).toFixed(1)} months)`;
      }},
    ],
  },
  {
    title: "LANDLORD",
    rows: [
      { label: "Name", render: (a) => a.landlord.name },
      { label: "Location", render: (a) => a.landlord.location },
      { label: "Platform Tenure", render: (a) => `${a.landlord.tenure_months} months` },
      { label: "Verifications", render: (a) => a.landlord.verifications?.map((v, i) => <Badge key={i} color="#a78bfa">{v}</Badge>) },
      { label: "Reviews", render: (a) => a.landlord.reviews || "None" },
    ],
  },
  {
    title: "COMMUTE & REMOTE WORK",
    rows: [
      { label: "Est. Monthly Gas", render: (a) => a.commute?.est_monthly_gas ? `$${a.commute.est_monthly_gas.toFixed(2)}` : "N/A" },
      { label: "Commute Methods", render: (a) => a.commute?.methods?.map((m, i) => <Badge key={i} color="#4f9eff">{m}</Badge>) },
      { label: "Remote Work Score", render: (a) => {
        const s = a.remote_work?.score;
        if (!s) return "N/A";
        const color = s >= 4 ? "#22c55e" : s >= 3 ? "#f59e0b" : "#ef4444";
        return <Badge color={color}>{s}/5</Badge>;
      }},
    ],
  },
];

export default function ComparisonTable({ apartments, onRemove }) {
  if (apartments.length === 0) {
    return <div style={{ textAlign: "center", color: "#475569", padding: 60 }}>No listings yet. Add some in the "Add" tab.</div>;
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #1e293b" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#0a1628" }}>
            <th style={{
              padding: "12px 14px", textAlign: "left", color: "#4f9eff",
              fontSize: 10, letterSpacing: 2, fontWeight: 700, whiteSpace: "nowrap",
              borderBottom: "1px solid #1e293b", position: "sticky", left: 0,
              background: "#0a1628", minWidth: 160, zIndex: 2,
            }}>FIELD</th>
            {apartments.map((a, i) => (
              <th key={a.id} style={{
                padding: "12px 14px", textAlign: "left",
                borderBottom: "1px solid #1e293b", minWidth: 220,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: `hsl(${i * 137}deg, 70%, 40%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ color: "#475569", fontSize: 10 }}>FF#{a.listing_id}</div>
                  </div>
                  <button onClick={() => onRemove(a.id)} title="Remove listing" style={{
                    background: "none", border: "1px solid #334155", color: "#64748b",
                    borderRadius: 4, padding: "1px 6px", cursor: "pointer", fontSize: 11,
                  }}>x</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section) => (
            <>
              <tr key={`header-${section.title}`}>
                <td colSpan={apartments.length + 1} style={{
                  padding: "10px 14px", background: "#0a1628",
                  color: "#4f9eff", fontSize: 10, fontWeight: 700,
                  letterSpacing: 2, borderBottom: "1px solid #1e293b",
                  borderTop: "2px solid #1e293b",
                }}>
                  {section.title}
                </td>
              </tr>
              {section.rows.map((row, ri) => (
                <tr key={`${section.title}-${row.label}`} style={{
                  background: ri % 2 === 0 ? "#0a0f1a" : "#0d1526",
                }}>
                  <td style={{
                    padding: "8px 14px", color: "#64748b", fontSize: 11,
                    fontWeight: 600, whiteSpace: "nowrap",
                    borderRight: "1px solid #1e293b", position: "sticky", left: 0,
                    background: ri % 2 === 0 ? "#0a0f1a" : "#0d1526", zIndex: 1,
                  }}>
                    {row.label}
                  </td>
                  {apartments.map((a) => (
                    <td key={a.id} style={{ padding: "8px 14px", verticalAlign: "top" }}>
                      {row.render(a)}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
          {/* Notes row */}
          <tr>
            <td style={{
              padding: "10px 14px", color: "#64748b", fontSize: 11, fontWeight: 600,
              borderRight: "1px solid #1e293b", borderTop: "2px solid #1e293b",
              position: "sticky", left: 0, background: "#0a0f1a", zIndex: 1,
            }}>Notes</td>
            {apartments.map((a) => (
              <td key={a.id} style={{
                padding: "10px 14px", fontSize: 11, color: "#94a3b8",
                borderTop: "2px solid #1e293b", lineHeight: 1.6,
              }}>{a.notes || "—"}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
