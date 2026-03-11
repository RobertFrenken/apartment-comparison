import { useState } from "react";
import { cardStyle, btnMedium } from "../lib/styles.js";
import { gasEstimate } from "../lib/costs.js";

const EMPTY = {
  name: "",
  platform: "FurnishedFinder",
  listing_id: "",
  url: "",
  status: "active",
  financials: { monthly_rent: 0, utilities_included: false, est_monthly_utilities: 0, security_deposit: 0, application_fee: 0, cleaning_fee: 0 },
  space: { sqft: 0, bedrooms: 0, bedroom_details: [], bathrooms: 0, bathroom_details: [], parking: "", outdoor_space: "", pool: false },
  appliances: { dishwasher: true, microwave: true, fridge: true, stovetop: true, washer_dryer: "", fireplace: false, water_softener: false },
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
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <label style={{ width: 180, fontSize: 13, color: "var(--text-secondary)", textAlign: "right", flexShrink: 0 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "", style: extraStyle = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 6,
      color: "var(--text-primary)", fontSize: 13, padding: "8px 12px", fontFamily: "inherit",
      width: 260, ...extraStyle,
    }} />
  );
}

function Check({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: "var(--accent-blue)", width: 16, height: 16 }} />
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Instructions */}
      <div style={{ ...cardStyle, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 12 }}>
          How to Add Listings
        </h3>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Form Mode</div>
              <p style={{ margin: 0 }}>
                Fill in the fields below. Pasting a FurnishedFinder URL auto-fills the platform and listing ID.
                Entering a distance auto-calculates the gas estimate.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>JSON Mode</div>
              <p style={{ margin: 0 }}>
                Paste a full apartment JSON object matching the schema. Useful for bulk entry or when you want
                to set all fields. See <code style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 4px", fontSize: 12 }}>src/data/apartments.json</code> for examples.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>GitHub Issue</div>
              <p style={{ margin: 0 }}>
                Open a{" "}
                <a href="https://github.com/RobertFrenken/apartment-comparison/issues/new?template=new-listing.yml"
                   target="_blank" rel="noopener noreferrer"
                   style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>
                  New Listing issue
                </a>{" "}
                on GitHub. Fill out the form and a pull request is auto-generated for review.
                Once merged, the listing appears on the site for everyone.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            Other methods: click "dup" on an existing listing in the Compare tab to clone and modify it,
            or use the toolbar buttons to Import/Export JSON files and Copy data to clipboard.
          </div>
        </div>
      </div>

      {/* Form / JSON input */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>
            {jsonMode ? "Paste JSON" : "Add New Listing"}
          </h3>
          <button onClick={() => setJsonMode(!jsonMode)} style={btnMedium}>
            {jsonMode ? "Switch to Form" : "Switch to JSON"}
          </button>
        </div>

        {jsonMode ? (
          <div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"name": "My Listing", "financials": {"monthly_rent": 3000, ...}}'
              rows={16}
              style={{
                width: "100%", background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-primary)", fontSize: 13, padding: 14,
                resize: "vertical", fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        ) : (
          <div>
            <SectionLabel>Basics</SectionLabel>
            <Field label="Listing Name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. 3BR/2BA Downtown Livermore" /></Field>
            <Field label="Platform"><Input value={form.platform} onChange={(e) => set("platform", e.target.value)} /></Field>
            <Field label="Listing ID"><Input value={form.listing_id} onChange={(e) => set("listing_id", e.target.value)} placeholder="e.g. 881538_1" /></Field>
            <Field label="URL"><Input value={form.url} onChange={(e) => {
              const url = e.target.value;
              set("url", url);
              const ffMatch = url.match(/furnishedfinder\.com\/property\/(\d+(?:_\d+)?)/);
              if (ffMatch) {
                set("platform", "FurnishedFinder");
                if (!form.listing_id) set("listing_id", ffMatch[1]);
              }
            }} placeholder="https://..." style={{ width: 400 }} /></Field>

            <SectionLabel>Financials</SectionLabel>
            <Field label="Monthly Rent ($)"><Input type="number" value={form.financials.monthly_rent || ""} onChange={(e) => set("financials.monthly_rent", Number(e.target.value))} /></Field>
            <Field label="Utilities Included"><Check checked={form.financials.utilities_included} onChange={(e) => set("financials.utilities_included", e.target.checked)} label="All utilities included in rent" /></Field>
            <Field label="Est. Utilities ($/mo)"><Input type="number" value={form.financials.est_monthly_utilities || ""} onChange={(e) => set("financials.est_monthly_utilities", Number(e.target.value))} /></Field>
            <Field label="Security Deposit ($)"><Input type="number" value={form.financials.security_deposit || ""} onChange={(e) => set("financials.security_deposit", Number(e.target.value))} /></Field>

            <SectionLabel>Space</SectionLabel>
            <Field label="Square Footage"><Input type="number" value={form.space.sqft || ""} onChange={(e) => set("space.sqft", Number(e.target.value))} /></Field>
            <Field label="Bedrooms"><Input type="number" value={form.space.bedrooms || ""} onChange={(e) => set("space.bedrooms", Number(e.target.value))} /></Field>
            <Field label="Bathrooms"><Input type="number" value={form.space.bathrooms || ""} onChange={(e) => set("space.bathrooms", Number(e.target.value))} /></Field>
            <Field label="Parking"><Input value={form.space.parking} onChange={(e) => set("space.parking", e.target.value)} placeholder="e.g. Double Garage" /></Field>
            <Field label="Pool"><Check checked={form.space.pool} onChange={(e) => set("space.pool", e.target.checked)} label="Has pool" /></Field>

            <SectionLabel>Location</SectionLabel>
            <Field label="Neighborhood"><Input value={form.location.neighborhood} onChange={(e) => set("location.neighborhood", e.target.value)} placeholder="e.g. Downtown Livermore" style={{ width: 340 }} /></Field>
            <Field label="ZIP"><Input value={form.location.zip} onChange={(e) => set("location.zip", e.target.value)} placeholder="94550" /></Field>
            <Field label="Distance to LLNL (mi)"><Input type="number" value={form.location.dist_llnl_miles || ""} onChange={(e) => {
              const miles = Number(e.target.value);
              set("location.dist_llnl_miles", miles);
              set("commute.one_way_miles", miles);
              if (!form.commute.est_monthly_gas) set("commute.est_monthly_gas", gasEstimate(miles));
            }} /></Field>
            <Field label="Drive Time (min)"><Input type="number" value={form.location.drive_time_llnl_min || ""} onChange={(e) => set("location.drive_time_llnl_min", Number(e.target.value))} /></Field>

            <SectionLabel>Rules & Amenities</SectionLabel>
            <Field label="Pets Allowed"><Check checked={form.rules.pets_allowed} onChange={(e) => set("rules.pets_allowed", e.target.checked)} label="Pets allowed" /></Field>
            <Field label="WiFi Included"><Check checked={form.amenities.internet === "Included"} onChange={(e) => set("amenities.internet", e.target.checked ? "Included" : null)} label="WiFi included" /></Field>
            <Field label="A/C"><Input value={form.amenities.ac} onChange={(e) => set("amenities.ac", e.target.value)} placeholder="e.g. Central, Window Unit" /></Field>
            <Field label="Washer/Dryer"><Input value={form.appliances.washer_dryer} onChange={(e) => set("appliances.washer_dryer", e.target.value)} placeholder="e.g. In-unit, Shared" /></Field>

            <SectionLabel>Lease</SectionLabel>
            <Field label="Available From"><Input type="date" value={form.lease.available_from} onChange={(e) => set("lease.available_from", e.target.value)} /></Field>
            <Field label="Available Until"><Input type="date" value={form.lease.available_until} onChange={(e) => set("lease.available_until", e.target.value)} /></Field>

            <SectionLabel>Notes</SectionLabel>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any notes, red flags, or highlights..."
              rows={3}
              style={{
                width: "100%", background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-primary)", fontSize: 13, padding: 12,
                resize: "vertical", fontFamily: "inherit", marginBottom: 8,
              }}
            />
          </div>
        )}

        <button onClick={handleSubmit} style={{
          background: "var(--accent-blue)",
          border: "none", borderRadius: 6, color: "#fff", padding: "10px 28px",
          cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
          marginTop: 20, boxShadow: "var(--shadow-sm)",
        }}>Add Listing</button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 12, color: "var(--text-secondary)", fontWeight: 600,
      marginBottom: 12, marginTop: 24, paddingBottom: 6,
      borderBottom: "1px solid var(--border)",
    }}>{children}</div>
  );
}
