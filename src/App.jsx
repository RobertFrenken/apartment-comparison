import { useState, useMemo } from "react";
import "./index.css";
import initialApartments from "./data/apartments.json";
import ComparisonTable from "./components/ComparisonTable.jsx";
import CostBreakdown from "./components/CostBreakdown.jsx";
import ScoreCard from "./components/ScoreCard.jsx";
import AddListing from "./components/AddListing.jsx";

const TABS = ["Compare", "Costs", "Scorecard", "Add"];

export default function App() {
  const [apartments, setApartments] = useState(() => {
    const saved = localStorage.getItem("apartments");
    return saved ? JSON.parse(saved) : initialApartments;
  });
  const [activeTab, setActiveTab] = useState("Compare");

  const save = (updated) => {
    setApartments(updated);
    localStorage.setItem("apartments", JSON.stringify(updated));
  };

  const addApartment = (apt) => save([...apartments, { ...apt, id: String(Date.now()) }]);
  const removeApartment = (id) => save(apartments.filter((a) => a.id !== id));

  const resetData = () => {
    localStorage.removeItem("apartments");
    setApartments(initialApartments);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.5px",
            fontFamily: "'Space Grotesk', sans-serif",
            background: "linear-gradient(90deg, #4f9eff, #00d4aa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>APARTMENT COMPARISON</h1>
          <span style={{ color: "#334155", fontSize: 11, letterSpacing: 2 }}>
            // LLNL INTERNSHIP 2026
          </span>
        </div>
        <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
          {apartments.length} listings loaded — Livermore, CA
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #1e293b", paddingBottom: 8 }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: activeTab === tab ? "#1e3a5f" : "transparent",
            border: `1px solid ${activeTab === tab ? "#4f9eff" : "#1e293b"}`,
            color: activeTab === tab ? "#4f9eff" : "#475569",
            borderRadius: 6, padding: "6px 16px", cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit", letterSpacing: 1,
          }}>{tab.toUpperCase()}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={resetData} style={{
          background: "none", border: "1px solid #334155", color: "#64748b",
          borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 10,
          fontFamily: "inherit",
        }}>Reset to defaults</button>
      </div>

      {/* Tab Content */}
      {activeTab === "Compare" && <ComparisonTable apartments={apartments} onRemove={removeApartment} />}
      {activeTab === "Costs" && <CostBreakdown apartments={apartments} />}
      {activeTab === "Scorecard" && <ScoreCard apartments={apartments} />}
      {activeTab === "Add" && <AddListing onAdd={addApartment} />}
    </div>
  );
}
