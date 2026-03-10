import { useState, useCallback, useRef, lazy, Suspense } from "react";
import "./index.css";
import initialApartments from "./data/apartments.json";
import ComparisonTable from "./components/ComparisonTable.jsx";
import CostBreakdown from "./components/CostBreakdown.jsx";
import ScoreCard from "./components/ScoreCard.jsx";
import AddListing from "./components/AddListing.jsx";
import About from "./components/About.jsx";
import Timeline from "./components/Timeline.jsx";
import ListingFilter from "./components/ListingFilter.jsx";
import WeightSliders from "./components/WeightSliders.jsx";
import { btnMedium } from "./lib/styles.js";
import Calculator from "./components/Calculator.jsx";
import { DEFAULT_WEIGHTS } from "./lib/scoring.js";
import useLocalStorage from "./lib/useLocalStorage.js";

const MapView = lazy(() => import("./components/MapView.jsx"));

const TABS = ["Compare", "Costs", "Scorecard", "Calculator", "Map", "Add", "About"];

export default function App() {
  const [apartments, setApartments, resetApartments] = useLocalStorage("apartments", initialApartments);
  const [hiddenIds, setHiddenIds] = useLocalStorage("hidden-listings", []);
  const [weights, setWeights] = useLocalStorage("scoring-weights", DEFAULT_WEIGHTS);
  const [brackets, setBrackets] = useLocalStorage("scoring-brackets", {});
  const [activeTab, setActiveTab] = useState("Compare");

  const visibleApartments = apartments.filter((a) => !hiddenIds.includes(a.id));
  const [copyLabel, setCopyLabel] = useState("Copy JSON");
  const importInputRef = useRef(null);

  const addApartment = (apt) => setApartments([...apartments, { ...apt, id: String(Date.now()) }]);
  const removeApartment = (id) => setApartments(apartments.filter((a) => a.id !== id));
  const duplicateApartment = (id) => {
    const original = apartments.find((a) => a.id === id);
    if (!original) return;
    const clone = JSON.parse(JSON.stringify(original));
    clone.name = `${clone.name} (Copy)`;
    clone.id = String(Date.now());
    setApartments([...apartments, clone]);
  };

  const updateApartmentDates = useCallback((id, from, until) => {
    setApartments((prev) =>
      prev.map((a) =>
        a.id !== id ? a : { ...a, lease: { ...a.lease, available_from: from, available_until: until } }
      )
    );
  }, [setApartments]);

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
        setApartments(parsed);
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
          <button onClick={downloadJSON} style={btnMedium}>Download JSON</button>
          <button onClick={() => importInputRef.current?.click()} style={btnMedium}>Import JSON</button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button onClick={copyJSON} style={btnMedium}>{copyLabel}</button>
          <button onClick={resetApartments} style={btnMedium}>Reset data</button>
        </div>
      </div>

      {/* Listing Filter */}
      {activeTab !== "Add" && activeTab !== "About" && (
        <ListingFilter apartments={apartments} hiddenIds={hiddenIds} setHiddenIds={setHiddenIds} />
      )}

      {/* Tab Content */}
      {activeTab === "Compare" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <WeightSliders weights={weights} onChange={setWeights} compact onOpenCalculator={() => setActiveTab("Calculator")} />
          <ComparisonTable apartments={visibleApartments} onRemove={removeApartment} onDuplicate={duplicateApartment} weights={weights} brackets={brackets} />
          <Timeline apartments={visibleApartments} onUpdateDates={updateApartmentDates} />
        </div>
      )}
      {activeTab === "Costs" && <CostBreakdown apartments={visibleApartments} />}
      {activeTab === "Scorecard" && <ScoreCard apartments={visibleApartments} weights={weights} brackets={brackets} onWeightsChange={setWeights} />}
      {activeTab === "Calculator" && (
        <Calculator
          apartments={visibleApartments}
          weights={weights}
          brackets={brackets}
          onWeightsChange={setWeights}
          onBracketsChange={setBrackets}
        />
      )}
      {activeTab === "Map" && (
        <Suspense fallback={<div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading map...</div>}>
          <MapView apartments={visibleApartments} />
        </Suspense>
      )}
      {activeTab === "Add" && <AddListing onAdd={addApartment} />}
      {activeTab === "About" && <About />}
    </div>
  );
}
