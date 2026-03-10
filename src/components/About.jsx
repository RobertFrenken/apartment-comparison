export default function About() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>
      {/* How It Works */}
      <Section title="How It Works">
        <p>This is a static site hosted on GitHub Pages — there's no backend or database. All apartment data lives in two places:</p>
        <ol>
          <li>
            <strong>Built-in data</strong> — <code>src/data/apartments.json</code> in the repo.
            This is the default dataset that loads for everyone. To permanently add or edit a listing,
            update this file and push to GitHub.
          </li>
          <li>
            <strong>Browser storage</strong> — When you add a listing via the "Add" tab or remove one
            from the comparison table, your changes are saved to <code>localStorage</code> in your browser.
            This persists across page reloads on <em>the same device and browser</em>, but won't sync
            across devices or show up for anyone else.
          </li>
        </ol>
        <p>The "Reset data" button in the header clears localStorage and reloads from the JSON file.</p>
      </Section>

      {/* Adding Listings */}
      <Section title="Adding Listings">
        <p>The Add tab offers two modes:</p>
        <ul>
          <li><strong>Form mode</strong> — Fill in key fields (name, rent, sqft, location, etc.). Not every field is exposed in the form; for full control, use JSON mode.</li>
          <li><strong>JSON mode</strong> — Paste a complete JSON object matching the apartment schema. See any entry in <code>src/data/apartments.json</code> for the full shape. This is useful for bulk entry or when you want to populate all fields (grocery stores, landlord details, etc.).</li>
        </ul>
        <p>
          <strong>Tip:</strong> You can ask Claude to extract a listing into JSON format. Paste the listing
          URL or text into a conversation and ask it to output JSON matching the schema. Then paste the
          result into JSON mode.
        </p>
      </Section>

      {/* Scoring Methodology */}
      <Section title="Scoring Methodology">
        <p>The Scorecard tab assigns each listing a score out of 100 based on weighted criteria:</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
          <thead>
            <tr>
              <th style={thStyle}>Criterion</th>
              <th style={{ ...thStyle, textAlign: "center", width: 70 }}>Weight</th>
              <th style={thStyle}>How It's Scored</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Monthly Cost" weight="25%" detail="Total rent + utilities. $4,000 or less = 10/10, scales down to 2/10 above $5,500." />
            <Row label="LLNL Proximity" weight="20%" detail="Driving distance to LLNL (7000 East Ave). 2 mi or less = 10/10, scales down by distance bracket." />
            <Row label="Space" weight="15%" detail="Square footage. 1,500+ = 10/10, 1,300+ = 8/10, etc." />
            <Row label="Amenities" weight="15%" detail="Points for: WiFi (2), washer/dryer (2), A/C (1), pool (1), community amenities (1), fireplace (1), water softener (1), transit access (1). Max 10." />
            <Row label="Move-in Cost" weight="10%" detail="First month + deposit + fees. $5,000 or less = 10/10, scales down." />
            <Row label="Remote Work" weight="10%" detail="Self-assessed 1-5 score (doubled to 0-10). Based on WiFi availability, quiet environment, workspace." />
            <Row label="Pet Friendly" weight="5%" detail="Binary: pets allowed = 10, not allowed = 0." />
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          <strong>Customizing weights:</strong> Edit the <code>CRITERIA</code> array in{" "}
          <code>src/components/ScoreCard.jsx</code>. Weights should sum to 100. If you're bringing a dog,
          consider bumping Pet Friendly from 5% to 15-20% (and reducing another criterion).
        </p>
      </Section>

      {/* Data Schema */}
      <Section title="Data Schema">
        <p>Each apartment object in <code>apartments.json</code> has these top-level sections:</p>
        <ul>
          <li><strong>financials</strong> — monthly_rent, utilities_included, est_monthly_utilities, security_deposit, application_fee, cleaning_fee</li>
          <li><strong>space</strong> — sqft, bedrooms, bedroom_details[], bathrooms, bathroom_details[], parking, outdoor_space, pool</li>
          <li><strong>appliances</strong> — dishwasher, microwave, fridge, stovetop, washer_dryer, fireplace, water_softener</li>
          <li><strong>amenities</strong> — ac, heating, internet, tv, storage, wheelchair_accessible, near_transit, community_amenities[]</li>
          <li><strong>rules</strong> — pets_allowed, smoking, max_occupancy, max_vehicles</li>
          <li><strong>location</strong> — city, state, zip, neighborhood, lat, lng, dist_llnl_miles, drive_time_llnl_min, nearest_grocery[], nearest_hospital</li>
          <li><strong>lease</strong> — contract_type, min_stay_days, available_from, available_until</li>
          <li><strong>landlord</strong> — name, location, tenure_months, verifications[], reviews</li>
          <li><strong>remote_work</strong> — wifi_included, quiet_environment, dedicated_workspace, score (1-5)</li>
          <li><strong>commute</strong> — one_way_miles, est_monthly_gas, methods[]</li>
        </ul>
        <p>
          Boolean fields use <code>true</code>/<code>false</code>. Unknown values use <code>null</code>.
          String fields like <code>internet</code> can be <code>null</code> (unknown), <code>false</code> (not included),
          or a string like <code>"Included"</code>.
        </p>
      </Section>

      {/* Cost Calculations */}
      <Section title="Cost Calculations">
        <p>The Costs tab computes:</p>
        <ul>
          <li><strong>Monthly total</strong> = rent + estimated utilities (if not included) + estimated gas/commute</li>
          <li><strong>Move-in cost</strong> = first month rent + security deposit + application fee + cleaning fee</li>
          <li><strong>Total stay cost</strong> = move-in cost + (monthly total x remaining months). The stay duration is calculated from the lease dates.</li>
          <li><strong>Gas estimate</strong> = one_way_miles x 2 x 22 workdays x $0.21/mile (IRS standard mileage approximation)</li>
        </ul>
      </Section>
    </div>
  );
}

const thStyle = {
  textAlign: "left", padding: "10px 12px", color: "var(--text-secondary)",
  borderBottom: "2px solid var(--border)", fontWeight: 500, fontSize: 13,
};

function Section({ title, children }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 8, padding: 28, boxShadow: "var(--shadow-sm)",
    }}>
      <h3 style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>{title}</h3>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
        <style>{`
          .about-content p { margin: 0 0 12px; }
          .about-content ul, .about-content ol { margin: 0 0 12px; padding-left: 24px; }
          .about-content li { margin-bottom: 6px; }
          .about-content code { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 3px; padding: 1px 5px; font-size: 12px; color: var(--text-primary); }
        `}</style>
        <div className="about-content">{children}</div>
      </div>
    </div>
  );
}

function Row({ label, weight, detail }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 12px", fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>{label}</td>
      <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--accent-blue)", fontWeight: 600, fontSize: 13 }}>{weight}</td>
      <td style={{ padding: "10px 12px", color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.5 }}>{detail}</td>
    </tr>
  );
}
