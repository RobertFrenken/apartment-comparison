import { useState, useRef, lazy, Suspense } from "react";
import "./index.css";
import initialApartments from "./data/apartments.json";
import ComparisonTable from "./components/ComparisonTable.jsx";
import CostBreakdown from "./components/CostBreakdown.jsx";
import ScoreCard from "./components/ScoreCard.jsx";
import AddListing from "./components/AddListing.jsx";
import About from "./components/About.jsx";

const MapView = lazy(() => import("./components/MapView.jsx"));

const TABS = ["Compare", "Costs", "Scorecard", "Map", "Add", "About"];

export default function App() {
  const [apartments, setApartments] = useState(() => {
    const saved = localStorage.getItem("apartments");
    return saved ? JSON.parse(saved) : initialApartments;
  });
  const [activeTab, setActiveTab] = useState("Compare");
  const [copyLabel, setCopyLabel] = useState("Copy JSON");
  const importInputRef = useRef(null);

  const save = (updated) => {
    setApartments(updated);
    localStorage.setItem("apartments", JSON.stringify(updated));
  };

  const addApartment = (apt) => save([...apartments, { ...apt, id: String(Date.now()) }]);
  const removeApartment = (id) => save(apartments.filter((a) => a.id !== id));
  const duplicateApartment = (id) => {
    const original = apartments.find((a) => a.id === id);
    if (!original) return;
    const clone = JSON.parse(JSON.stringify(original));
    clone.name = `${clone.name} (Copy)`;
    clone.id = String(Date.now());
    save([...apartments, clone]);
  };

  const resetData = () => {
    localStorage.removeItem("apartments");
    setApartments(initialApartments);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(apartments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apartments.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error("Expected an array");
        save(parsed);
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(apartments, null, 2));
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy JSON"), 1500);
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 700, margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "var(--accent-blue)",
          }}>Apartment Comparison</h1>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            LLNL Internship 2026
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
          {apartments.length} listings in Livermore, CA
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: "none",
            borderBottom: activeTab === tab ? "2px solid var(--accent-blue)" : "2px solid transparent",
            border: "none",
            borderBottomWidth: 2,
            borderBottomStyle: "solid",
            borderBottomColor: activeTab === tab ? "var(--accent-blue)" : "transparent",
            color: activeTab === tab ? "var(--accent-blue)" : "var(--text-secondary)",
            padding: "10px 20px", cursor: "pointer",
            fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
            fontFamily: "inherit", marginBottom: -2,
            transition: "all 0.15s",
          }}>{tab}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 8, alignSelf: "center", marginBottom: 4 }}>
          <button onClick={downloadJSON} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
            borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12,
            fontFamily: "inherit",
          }}>Download JSON</button>
          <button onClick={() => importInputRef.current?.click()} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
            borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12,
            fontFamily: "inherit",
          }}>Import JSON</button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button onClick={copyJSON} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
            borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12,
            fontFamily: "inherit",
          }}>{copyLabel}</button>
          <button onClick={resetData} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
            borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12,
            fontFamily: "inherit",
          }}>Reset data</button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Compare" && <ComparisonTable apartments={apartments} onRemove={removeApartment} onDuplicate={duplicateApartment} />}
      {activeTab === "Costs" && <CostBreakdown apartments={apartments} />}
      {activeTab === "Scorecard" && <ScoreCard apartments={apartments} />}
      {activeTab === "Map" && (
        <Suspense fallback={<div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading map...</div>}>
          <MapView apartments={apartments} />
        </Suspense>
      )}
      {activeTab === "Add" && <AddListing onAdd={addApartment} />}
      {activeTab === "About" && <About />}
    </div>
  );
}
