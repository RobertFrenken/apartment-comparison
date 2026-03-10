import { useState } from "react";
import "./index.css";
import initialApartments from "./data/apartments.json";
import ComparisonTable from "./components/ComparisonTable.jsx";
import CostBreakdown from "./components/CostBreakdown.jsx";
import ScoreCard from "./components/ScoreCard.jsx";
import AddListing from "./components/AddListing.jsx";
import About from "./components/About.jsx";

const TABS = ["Compare", "Costs", "Scorecard", "Add", "About"];

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
        <button onClick={resetData} style={{
          background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
          borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12,
          fontFamily: "inherit", alignSelf: "center", marginBottom: 4,
        }}>Reset data</button>
      </div>

      {/* Tab Content */}
      {activeTab === "Compare" && <ComparisonTable apartments={apartments} onRemove={removeApartment} />}
      {activeTab === "Costs" && <CostBreakdown apartments={apartments} />}
      {activeTab === "Scorecard" && <ScoreCard apartments={apartments} />}
      {activeTab === "Add" && <AddListing onAdd={addApartment} />}
      {activeTab === "About" && <About />}
    </div>
  );
}
