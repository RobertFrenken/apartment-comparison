import { useState, useCallback } from "react";

const COLUMNS = [
  { key: "address", label: "Address" },
  { key: "price", label: "Monthly Price" },
  { key: "price_per_bed", label: "Price / Bedroom" },
  { key: "price_per_person", label: "Price / Person (est.)" },
  { key: "sqft", label: "Sq Feet" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bedroom_types", label: "Bedroom Types" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "bathroom_types", label: "Bathroom Types" },
  { key: "appliances", label: "Appliances" },
  { key: "amenities", label: "Amenities" },
  { key: "house_rules", label: "House Rules" },
  { key: "dist_llnl", label: "Distance to LLNL" },
  { key: "commute_llnl", label: "Commute Time to LLNL" },
  { key: "landlord", label: "Landlord Profile" },
  { key: "nearest_grocery", label: "Nearest Grocery Stores" },
  { key: "dist_grocery", label: "Distance to Grocery" },
  { key: "contract_type", label: "Contract Type" },
  { key: "contract_duration", label: "Contract Duration" },
  { key: "utilities_included", label: "Utilities Included" },
  { key: "pet_policy", label: "Pet Policy" },
  { key: "walkability_score", label: "Walkability Score" },
  { key: "noise_level", label: "Neighborhood Noise / Safety" },
  { key: "notes", label: "Notes / Flags" },
];

const SYSTEM_PROMPT = `You are a real estate research assistant. Given a FurnishedFinder property URL and any scraped text context, extract as much information as possible about the listing.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "address": "full address if visible",
  "price": "monthly rent e.g. $2,500/mo",
  "price_per_bed": "calculated price / number of bedrooms",
  "price_per_person": "assume 1 person unless stated",
  "sqft": "square footage",
  "bedrooms": "number e.g. 3",
  "bedroom_types": "e.g. 1 master, 2 standard",
  "bathrooms": "number e.g. 2",
  "bathroom_types": "e.g. 1 ensuite, 1 shared",
  "appliances": "comma-separated list",
  "amenities": "comma-separated list",
  "house_rules": "key rules like no smoking, no pets, etc.",
  "dist_llnl": "driving distance from address to Lawrence Livermore National Laboratory, 7000 East Ave, Livermore CA 94550",
  "commute_llnl": "estimated drive time to LLNL",
  "landlord": "name, verified status, review count if visible",
  "nearest_grocery": "names of 2-3 nearest grocery stores",
  "dist_grocery": "estimated distance to nearest grocery",
  "contract_type": "e.g. month-to-month, fixed lease",
  "contract_duration": "e.g. 3 months, May 22 – Aug 25",
  "utilities_included": "what's included e.g. WiFi, water, electric",
  "pet_policy": "pets allowed? any restrictions?",
  "walkability_score": "Walk Score or estimate based on neighborhood",
  "noise_level": "neighborhood character, safety notes",
  "notes": "any red flags, standout features, or missing info"
}

If a value is unknown, use "N/A". Be concise. For dist_llnl and commute_llnl, reason from the address if provided — LLNL is in Livermore, CA 94550.`;

const STATUS = { idle: "idle", loading: "loading", done: "done", error: "error" };

const TAG_COLORS = {
  price: "#00d4aa",
  distance: "#4f9eff",
  amenity: "#f59e0b",
  rule: "#ef4444",
  landlord: "#a78bfa",
};

function Badge({ children, color = "#4f9eff" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      marginRight: 4,
      marginBottom: 4,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function CellValue({ col, value }) {
  if (!value || value === "N/A") return <span style={{ color: "#555", fontStyle: "italic" }}>N/A</span>;
  
  if (col === "price") return <Badge color="#00d4aa">{value}</Badge>;
  if (col === "price_per_bed" || col === "price_per_person") return <Badge color="#00d4aa">{value}</Badge>;
  if (col === "dist_llnl" || col === "commute_llnl" || col === "dist_grocery") return <Badge color="#4f9eff">{value}</Badge>;
  if (col === "utilities_included") return <Badge color="#f59e0b">{value}</Badge>;
  if (col === "pet_policy") return (
    <Badge color={value.toLowerCase().includes("no pet") ? "#ef4444" : "#22c55e"}>{value}</Badge>
  );
  if (col === "walkability_score") return <Badge color="#a78bfa">{value}</Badge>;
  if (col === "contract_type" || col === "contract_duration") return <Badge color="#64748b">{value}</Badge>;
  if (col === "amenities" || col === "appliances") {
    const items = value.split(",").map(s => s.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {items.map((item, i) => <Badge key={i} color="#f59e0b">{item}</Badge>)}
      </div>
    );
  }
  
  return <span style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.5 }}>{value}</span>;
}

function PropertyCard({ prop, index, onRemove }) {
  const shortUrl = prop.url.replace("https://www.furnishedfinder.com/property/", "FF#");
  return (
    <div style={{
      background: "#0f172a",
      border: "1px solid #1e293b",
      borderRadius: 8,
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `hsl(${index * 137}deg, 70%, 40%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}>{index + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {prop.data?.address || shortUrl}
        </div>
        {prop.data?.price && <div style={{ color: "#00d4aa", fontSize: 12 }}>{prop.data.price}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>
        {prop.status === STATUS.loading && (
          <div style={{ width: 20, height: 20, border: "2px solid #334155", borderTop: "2px solid #4f9eff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        )}
        {prop.status === STATUS.done && <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>}
        {prop.status === STATUS.error && <span style={{ color: "#ef4444", fontSize: 16 }}>✗</span>}
      </div>
      <button onClick={() => onRemove(prop.id)} style={{
        background: "none", border: "1px solid #334155", color: "#64748b",
        borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 12,
        flexShrink: 0,
      }}>✕</button>
    </div>
  );
}

export default function ApartmentTracker() {
  const [urlInput, setUrlInput] = useState("");
  const [properties, setProperties] = useState([]);
  const [selectedCols, setSelectedCols] = useState(COLUMNS.map(c => c.key));
  const [viewMode, setViewMode] = useState("table"); // table | cards
  const [filterText, setFilterText] = useState("");
  const [globalLoading, setGlobalLoading] = useState(false);

  const addProperty = useCallback(async (rawUrl) => {
    const url = rawUrl.trim();
    if (!url) return;
    
    const id = Date.now() + Math.random();
    const newProp = { id, url, status: STATUS.loading, data: null, error: null };
    setProperties(prev => [...prev, newProp]);
    setUrlInput("");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Research this FurnishedFinder rental listing and extract all property details. URL: ${url}
            
Use web search to find information about this specific property listing. Search for the property ID in the URL. Also search for nearby grocery stores and the commute distance to Lawrence Livermore National Laboratory (7000 East Ave, Livermore, CA 94550) from the property address once found.

Return the JSON object as specified.`
          }]
        })
      });

      const data = await response.json();
      
      // Extract text from all content blocks
      let fullText = "";
      for (const block of data.content || []) {
        if (block.type === "text") fullText += block.text;
      }

      // Parse JSON from response
      let parsed = {};
      try {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch {
        parsed = { notes: "Could not parse structured data. Raw: " + fullText.slice(0, 200) };
      }

      // Add the URL as source
      parsed._source_url = url;

      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, status: STATUS.done, data: parsed } : p
      ));
    } catch (err) {
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, status: STATUS.error, error: err.message } : p
      ));
    }
  }, []);

  const handleAddUrls = () => {
    const urls = urlInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.startsWith("http"));
    urls.forEach(url => addProperty(url));
  };

  const removeProperty = (id) => setProperties(prev => prev.filter(p => p.id !== id));

  const exportCSV = () => {
    const rows = [COLUMNS.filter(c => selectedCols.includes(c.key)).map(c => c.label)];
    properties.filter(p => p.data).forEach(p => {
      rows.push(COLUMNS.filter(c => selectedCols.includes(c.key)).map(c => `"${(p.data[c.key] || "N/A").toString().replace(/"/g, '""')}"`));
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "apartment-comparison.csv";
    a.click();
  };

  const doneProps = properties.filter(p => p.status === STATUS.done && p.data);
  const visibleCols = COLUMNS.filter(c => selectedCols.includes(c.key));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020817",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        textarea:focus, input:focus { outline: none; }
        .col-toggle:hover { background: #1e293b !important; }
        .action-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.5px",
            fontFamily: "'Space Grotesk', sans-serif",
            background: "linear-gradient(90deg, #4f9eff, #00d4aa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>APARTMENT RESEARCH DB</h1>
          <span style={{ color: "#334155", fontSize: 11, letterSpacing: 2 }}>// LLNL INTERNSHIP 2026</span>
        </div>
        <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
          Paste FurnishedFinder URLs → AI extracts & compares all listing data
        </p>
      </div>

      {/* URL Input */}
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10,
        padding: 16, marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>
          ADD LISTINGS
        </div>
        <textarea
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder={"Paste one or more FurnishedFinder URLs (one per line or comma-separated):\nhttps://www.furnishedfinder.com/property/881538_1\nhttps://www.furnishedfinder.com/property/898100_1"}
          rows={3}
          style={{
            width: "100%", background: "#020817", border: "1px solid #1e293b",
            borderRadius: 6, color: "#94a3b8", fontSize: 12, padding: "10px 12px",
            resize: "vertical", fontFamily: "inherit",
          }}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleAddUrls(); }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="action-btn" onClick={handleAddUrls} style={{
            background: "linear-gradient(90deg, #1d4ed8, #0e7490)",
            border: "none", borderRadius: 6, color: "#fff", padding: "8px 18px",
            cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            letterSpacing: 0.5,
          }}>
            ⚡ RESEARCH LISTINGS
          </button>
          <span style={{ color: "#334155", fontSize: 11, alignSelf: "center" }}>
            {properties.length > 0 && `${doneProps.length}/${properties.length} loaded`}
          </span>
        </div>
      </div>

      {/* Property Queue */}
      {properties.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>
            LISTING QUEUE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {properties.map((p, i) => (
              <PropertyCard key={p.id} prop={p} index={i} onRemove={removeProperty} />
            ))}
          </div>
        </div>
      )}

      {/* Column Selector */}
      {doneProps.length > 0 && (
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10,
          padding: 14, marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600 }}>COLUMNS</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSelectedCols(COLUMNS.map(c => c.key))} style={{
                background: "none", border: "1px solid #334155", color: "#64748b",
                borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
              }}>All</button>
              <button onClick={() => setSelectedCols(["address","price","price_per_bed","bedrooms","bathrooms","dist_llnl","commute_llnl","nearest_grocery","amenities","contract_duration"])} style={{
                background: "none", border: "1px solid #334155", color: "#64748b",
                borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
              }}>Key Only</button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COLUMNS.map(col => (
              <button key={col.key} className="col-toggle" onClick={() => {
                setSelectedCols(prev =>
                  prev.includes(col.key) ? prev.filter(k => k !== col.key) : [...prev, col.key]
                );
              }} style={{
                background: selectedCols.includes(col.key) ? "#1e3a5f" : "#0f172a",
                border: `1px solid ${selectedCols.includes(col.key) ? "#4f9eff" : "#1e293b"}`,
                color: selectedCols.includes(col.key) ? "#4f9eff" : "#475569",
                borderRadius: 4, padding: "3px 9px", cursor: "pointer",
                fontSize: 11, fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {col.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {doneProps.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#4f9eff", letterSpacing: 2, fontWeight: 600 }}>
              COMPARISON TABLE — {doneProps.length} LISTINGS
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Filter..."
                style={{
                  background: "#0f172a", border: "1px solid #1e293b", borderRadius: 4,
                  color: "#94a3b8", fontSize: 11, padding: "4px 10px", fontFamily: "inherit", width: 140,
                }}
              />
              <button className="action-btn" onClick={exportCSV} style={{
                background: "#0f172a", border: "1px solid #334155", color: "#94a3b8",
                borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
              }}>↓ CSV</button>
            </div>
          </div>

          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #1e293b" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0a1628" }}>
                  <th style={{
                    padding: "10px 14px", textAlign: "left", color: "#4f9eff",
                    fontSize: 10, letterSpacing: 2, fontWeight: 700, whiteSpace: "nowrap",
                    borderBottom: "1px solid #1e293b", position: "sticky", left: 0,
                    background: "#0a1628", minWidth: 140,
                  }}>FIELD</th>
                  {doneProps.map((p, i) => (
                    <th key={p.id} style={{
                      padding: "10px 14px", textAlign: "left",
                      borderBottom: "1px solid #1e293b", minWidth: 200,
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          background: `hsl(${i * 137}deg, 70%, 40%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>{i + 1}</div>
                        <div>
                          <div style={{ color: "#e2e8f0", fontSize: 11, fontWeight: 600 }}>
                            {p.data?.address?.split(",")[0] || `Listing ${i + 1}`}
                          </div>
                          <div style={{ color: "#475569", fontSize: 10 }}>
                            {p.url.match(/property\/(\d+)/)?.[1] && `FF#${p.url.match(/property\/(\d+)/)[1]}`}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCols
                  .filter(col => !filterText || col.label.toLowerCase().includes(filterText.toLowerCase()))
                  .map((col, ri) => (
                  <tr key={col.key} style={{
                    background: ri % 2 === 0 ? "#0a0f1a" : "#0d1526",
                    transition: "background 0.1s",
                  }}>
                    <td style={{
                      padding: "10px 14px", color: "#64748b", fontSize: 11,
                      fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap",
                      borderRight: "1px solid #1e293b", position: "sticky", left: 0,
                      background: ri % 2 === 0 ? "#0a0f1a" : "#0d1526",
                    }}>
                      {col.label}
                    </td>
                    {doneProps.map(p => (
                      <td key={p.id} style={{
                        padding: "10px 14px", verticalAlign: "top",
                        borderRight: "1px solid #0f172a",
                      }}>
                        <CellValue col={col.key} value={p.data?.[col.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {properties.length === 0 && (
        <div style={{
          border: "1px dashed #1e293b", borderRadius: 10, padding: "40px 24px",
          textAlign: "center", color: "#334155",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
          <div style={{ fontSize: 13, marginBottom: 6, color: "#475569" }}>No listings yet</div>
          <div style={{ fontSize: 11 }}>Paste FurnishedFinder URLs above to start researching</div>
          <div style={{ fontSize: 11, marginTop: 8, color: "#4f9eff44" }}>
            AI will extract price, rooms, LLNL commute, grocery proximity, and 20+ data points per listing
          </div>
        </div>
      )}
    </div>
  );
}
