import { useState } from "react";

const EMPTY = {
  name: "",
  platform: "FurnishedFinder",
  listing_id: "",
  url: "",
  status: "active",
  financials: { monthly_rent: 0, utilities_included: false, est_monthly_utilities: 0, security_deposit: 0, application_fee: 0, cleaning_fee: 0 },
  space: { sqft: 0, bedrooms: 0, bedroom_details: [], bathrooms: 0, bathroom_details: [], parking: "", outdoor_space: "", pool: false },
  appliances: { dishwasher: false, microwave: false, fridge: false, stovetop: false, washer_dryer: "", fireplace: false, water_softener: false },
  amenities: { ac: "", heating: false, internet: null, tv: false, storage: false, wheelchair_accessible: null, near_transit: null, community_amenities: [] },
  rules: { pets_allowed: false, smoking: false, max_occupancy: null, max_vehicles: null },
  location: { city: "Livermore", state: "CA", zip: "", neighborhood: "", lat: null, lng: null, dist_llnl_miles: 0, drive_time_llnl_min: 0, nearest_grocery: [], nearest_hospital: null },
  lease: { contract_type: "Monthly furnished rental", min_stay_days: 30, available_from: "", available_until: "" },
  landlord: { name: "", location: "", tenure_months: 0, verifications: [], reviews: 0 },
  remote_work: { wifi_included: null, quiet_environment: false, dedicated_workspace: false, score: 3 },
  commute: { one_way_miles: 0, est_monthly_gas: 0, methods: [] },
  notes: "",
};

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <label style={{ width: 180, fontSize: 11, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "", style: extraStyle = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      background: "#020817", border: "1px solid #1e293b", borderRadius: 4,
      color: "#e2e8f0", fontSize: 12, padding: "6px 10px", fontFamily: "inherit",
      width: 240, ...extraStyle,
    }} />
  );
}

function Check({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#94a3b8" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: "#4f9eff" }} />
      {label}
    </label>
  );
}

export default function AddListing({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const set = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonText);
        onAdd({ ...EMPTY, ...parsed, added_date: new Date().toISOString().slice(0, 10) });
        setJsonText("");
      } catch {
        alert("Invalid JSON");
      }
      return;
    }
    if (!form.name) { alert("Name is required"); return; }
    onAdd({ ...form, added_date: new Date().toISOString().slice(0, 10) });
    setForm(EMPTY);
  };

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600 }}>
          ADD NEW LISTING
        </div>
        <button onClick={() => setJsonMode(!jsonMode)} style={{
          background: "none", border: "1px solid #334155", color: "#64748b",
          borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
        }}>{jsonMode ? "Form Mode" : "JSON Mode"}</button>
      </div>

      {jsonMode ? (
        <div>
          <p style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
            Paste a JSON object matching the apartment schema. See src/data/apartments.json for examples.
          </p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{"name": "My Listing", "financials": {"monthly_rent": 3000, ...}}'
            rows={16}
            style={{
              width: "100%", background: "#020817", border: "1px solid #1e293b",
              borderRadius: 6, color: "#94a3b8", fontSize: 12, padding: 12,
              resize: "vertical", fontFamily: "inherit",
            }}
          />
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 8 }}>BASICS</div>
          <Field label="Listing Name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. 3BR/2BA Downtown Livermore" /></Field>
          <Field label="Platform"><Input value={form.platform} onChange={(e) => set("platform", e.target.value)} /></Field>
          <Field label="Listing ID"><Input value={form.listing_id} onChange={(e) => set("listing_id", e.target.value)} placeholder="e.g. 881538_1" /></Field>
          <Field label="URL"><Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." style={{ width: 400 }} /></Field>

          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>FINANCIALS</div>
          <Field label="Monthly Rent ($)"><Input type="number" value={form.financials.monthly_rent || ""} onChange={(e) => set("financials.monthly_rent", Number(e.target.value))} /></Field>
          <Field label="Utilities Included"><Check checked={form.financials.utilities_included} onChange={(e) => set("financials.utilities_included", e.target.checked)} label="All utilities included in rent" /></Field>
          <Field label="Est. Utilities ($/mo)"><Input type="number" value={form.financials.est_monthly_utilities || ""} onChange={(e) => set("financials.est_monthly_utilities", Number(e.target.value))} /></Field>
          <Field label="Security Deposit ($)"><Input type="number" value={form.financials.security_deposit || ""} onChange={(e) => set("financials.security_deposit", Number(e.target.value))} /></Field>

          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>SPACE</div>
          <Field label="Square Footage"><Input type="number" value={form.space.sqft || ""} onChange={(e) => set("space.sqft", Number(e.target.value))} /></Field>
          <Field label="Bedrooms"><Input type="number" value={form.space.bedrooms || ""} onChange={(e) => set("space.bedrooms", Number(e.target.value))} /></Field>
          <Field label="Bathrooms"><Input type="number" value={form.space.bathrooms || ""} onChange={(e) => set("space.bathrooms", Number(e.target.value))} /></Field>
          <Field label="Parking"><Input value={form.space.parking} onChange={(e) => set("space.parking", e.target.value)} placeholder="e.g. Double Garage" /></Field>
          <Field label="Pool"><Check checked={form.space.pool} onChange={(e) => set("space.pool", e.target.checked)} label="Has pool" /></Field>

          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>LOCATION</div>
          <Field label="Neighborhood"><Input value={form.location.neighborhood} onChange={(e) => set("location.neighborhood", e.target.value)} placeholder="e.g. Downtown Livermore" style={{ width: 320 }} /></Field>
          <Field label="ZIP"><Input value={form.location.zip} onChange={(e) => set("location.zip", e.target.value)} placeholder="94550" /></Field>
          <Field label="Distance to LLNL (mi)"><Input type="number" value={form.location.dist_llnl_miles || ""} onChange={(e) => set("location.dist_llnl_miles", Number(e.target.value))} /></Field>
          <Field label="Drive Time (min)"><Input type="number" value={form.location.drive_time_llnl_min || ""} onChange={(e) => set("location.drive_time_llnl_min", Number(e.target.value))} /></Field>

          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>RULES & AMENITIES</div>
          <Field label="Pets Allowed"><Check checked={form.rules.pets_allowed} onChange={(e) => set("rules.pets_allowed", e.target.checked)} label="Pets allowed" /></Field>
          <Field label="WiFi Included"><Check checked={form.amenities.internet === "Included"} onChange={(e) => set("amenities.internet", e.target.checked ? "Included" : null)} label="WiFi included" /></Field>
          <Field label="A/C"><Input value={form.amenities.ac} onChange={(e) => set("amenities.ac", e.target.value)} placeholder="e.g. Central, Window Unit" /></Field>
          <Field label="Washer/Dryer"><Input value={form.appliances.washer_dryer} onChange={(e) => set("appliances.washer_dryer", e.target.value)} placeholder="e.g. In-unit, Shared" /></Field>

          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>LEASE</div>
          <Field label="Available From"><Input type="date" value={form.lease.available_from} onChange={(e) => set("lease.available_from", e.target.value)} /></Field>
          <Field label="Available Until"><Input type="date" value={form.lease.available_until} onChange={(e) => set("lease.available_until", e.target.value)} /></Field>

          <div style={{ fontSize: 10, color: "#4f9eff", letterSpacing: 2, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>NOTES</div>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Any notes, red flags, or highlights..."
            rows={3}
            style={{
              width: "100%", background: "#020817", border: "1px solid #1e293b",
              borderRadius: 6, color: "#94a3b8", fontSize: 12, padding: 10,
              resize: "vertical", fontFamily: "inherit", marginBottom: 8,
            }}
          />
        </div>
      )}

      <button onClick={handleSubmit} style={{
        background: "linear-gradient(90deg, #1d4ed8, #0e7490)",
        border: "none", borderRadius: 6, color: "#fff", padding: "10px 24px",
        cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
        letterSpacing: 0.5, marginTop: 16,
      }}>ADD LISTING</button>
    </div>
  );
}
