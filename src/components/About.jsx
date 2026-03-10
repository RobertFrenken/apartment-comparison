import { cardStyle, thStyle } from "../lib/styles.js";

export default function About() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>
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

      <Section title="Scoring Methodology">
        <p>
          Each listing is scored out of 100 based on 8 weighted criteria. Scores update live across
          all tabs as you adjust settings. Use the <strong>Calculator</strong> tab to:
        </p>
        <ul>
          <li>Adjust <strong>weights</strong> — prioritize what matters to you (cost vs. space vs. proximity, etc.)</li>
          <li>Edit <strong>scoring thresholds</strong> — change what counts as "good" for each bracket (e.g., raise the monthly cost threshold if your budget allows it)</li>
          <li>See the <strong>amenity checklist</strong> — 14 items scored with full transparency on what each listing gets credit for</li>
        </ul>
        <p>
          The compact weight sliders on the Compare tab give quick access. The Calculator tab shows
          every formula under the hood. Changes persist in your browser via localStorage.
        </p>
      </Section>

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

function Section({ title, children }) {
  return (
    <div style={cardStyle}>
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
