import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import manifest from "../data/manifest.json";
import { cardStyle, btnSmall } from "../lib/styles.js";
import {
  MAP_CONFIG, MARKER_SIZES, POPUP_OFFSETS, RADIUS_SLIDER,
  CATEGORY_COLORS, CATEGORY_LABELS, FILTERABLE_CATEGORIES,
} from "../lib/constants.js";
import { haversineMiles, geoCircle } from "../lib/geo.js";

const LLNL = manifest.target_location;

function createMarkerEl(color, size = 14) {
  const el = document.createElement("div");
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.border = "2px solid #fff";
  el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
  el.style.cursor = "pointer";
  return el;
}

function popupHtml(name, detail, color) {
  return `<div style="font-family:Inter,sans-serif;font-size:13px;max-width:220px">
    <div style="font-weight:600;color:${color};margin-bottom:4px">${name}</div>
    ${detail ? `<div style="color:#475569;font-size:12px;line-height:1.4">${detail}</div>` : ""}
  </div>`;
}

const EMPTY_FC = { type: "FeatureCollection", features: [] };

export default function MapView({ apartments }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({ poi: [], apt: [] });

  const [focusAptId, setFocusAptId] = useState("");
  const [radius, setRadius] = useState(RADIUS_SLIDER.default);
  const [hiddenCats, setHiddenCats] = useState(new Set());

  const focusApt = apartments.find((a) => a.id === focusAptId);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.tileStyle,
      center: [LLNL.lng, LLNL.lat],
      zoom: MAP_CONFIG.initialZoom,
      maxBounds: MAP_CONFIG.bounds,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      // Radius circle layer
      map.addSource("radius-circle", { type: "geojson", data: EMPTY_FC });
      map.addLayer({
        id: "radius-circle-fill",
        type: "fill",
        source: "radius-circle",
        paint: { "fill-color": "#2563eb", "fill-opacity": 0.08 },
      });
      map.addLayer({
        id: "radius-circle-outline",
        type: "line",
        source: "radius-circle",
        paint: { "line-color": "#2563eb", "line-width": 2, "line-dasharray": [3, 2] },
      });

      // LLNL marker
      const llnlEl = createMarkerEl(CATEGORY_COLORS.work, MARKER_SIZES.llnl);
      new maplibregl.Marker({ element: llnlEl })
        .setLngLat([LLNL.lng, LLNL.lat])
        .setPopup(new maplibregl.Popup({ offset: POPUP_OFFSETS.llnl }).setHTML(
          popupHtml("LLNL", "7000 East Ave, Livermore, CA 94550", CATEGORY_COLORS.work)
        ))
        .addTo(map);

      // Apartment markers
      apartments.forEach((a) => {
        if (a.location.lat == null || a.location.lng == null) return;
        const el = createMarkerEl(CATEGORY_COLORS.apartment, MARKER_SIZES.apartment);
        const detail = [
          `$${a.financials.monthly_rent.toLocaleString()}/mo`,
          `${a.space.sqft?.toLocaleString()} sq ft`,
          `${a.location.dist_llnl_miles} mi to LLNL`,
          `${a.space.bedrooms}BR/${a.space.bathrooms}BA`,
        ].join("<br>");
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([a.location.lng, a.location.lat])
          .setPopup(new maplibregl.Popup({ offset: POPUP_OFFSETS.apartment }).setHTML(
            popupHtml(a.name, detail, CATEGORY_COLORS.apartment)
          ))
          .addTo(map);
        markersRef.current.apt.push(marker);
      });

      // POI markers
      manifest.points_of_interest.forEach((poi) => {
        if (poi.category === "work") return;
        const color = CATEGORY_COLORS[poi.category] || "#64748b";
        const el = createMarkerEl(color, MARKER_SIZES.poi);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([poi.lng, poi.lat])
          .setPopup(new maplibregl.Popup({ offset: POPUP_OFFSETS.poi }).setHTML(
            popupHtml(poi.name, CATEGORY_LABELS[poi.category] || poi.category, color)
          ))
          .addTo(map);
        marker._poiCategory = poi.category;
        marker._poiLat = poi.lat;
        marker._poiLng = poi.lng;
        markersRef.current.poi.push(marker);
      });

      // Fit bounds
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([LLNL.lng, LLNL.lat]);
      apartments.forEach((a) => {
        if (a.location.lat != null && a.location.lng != null)
          bounds.extend([a.location.lng, a.location.lat]);
      });
      map.fitBounds(bounds, { padding: MAP_CONFIG.fitBoundsPadding, maxZoom: MAP_CONFIG.fitBoundsMaxZoom });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = { poi: [], apt: [] };
    };
  }, [apartments]);

  // Update radius circle and zoom when focus/radius changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("radius-circle");
    if (!source) return;

    if (focusApt && focusApt.location.lat != null && focusApt.location.lng != null) {
      const center = [focusApt.location.lng, focusApt.location.lat];
      source.setData(geoCircle(center, radius));
      map.flyTo({ center, zoom: MAP_CONFIG.flyToZoom, duration: MAP_CONFIG.flyToDuration });
    } else {
      source.setData(EMPTY_FC);
    }
  }, [focusApt, radius]);

  // Toggle marker visibility for hidden categories
  useEffect(() => {
    markersRef.current.poi.forEach((m) => {
      const el = m.getElement();
      el.style.display = hiddenCats.has(m._poiCategory) ? "none" : "";
    });
  }, [hiddenCats]);

  const toggleCat = (cat) => {
    setHiddenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Compute nearby POIs when focused
  const nearbyPois = focusApt && focusApt.location.lat != null
    ? manifest.points_of_interest
        .filter((poi) => poi.category !== "work" && !hiddenCats.has(poi.category))
        .map((poi) => ({
          ...poi,
          dist: haversineMiles(focusApt.location.lat, focusApt.location.lng, poi.lat, poi.lng),
        }))
        .filter((poi) => poi.dist <= radius)
        .sort((a, b) => a.dist - b.dist)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls */}
      <div style={{ ...cardStyle, padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        {/* Focus selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Focus on:</label>
          <select
            value={focusAptId}
            onChange={(e) => setFocusAptId(e.target.value)}
            style={{
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "var(--text-primary)",
              fontFamily: "inherit",
            }}
          >
            <option value="">All apartments</option>
            {apartments.filter((a) => a.location.lat != null).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Radius slider */}
        {focusAptId && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
              Radius: {radius} mi
            </label>
            <input
              type="range"
              min={RADIUS_SLIDER.min}
              max={RADIUS_SLIDER.max}
              step={RADIUS_SLIDER.step}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ width: 120, accentColor: "var(--accent-blue)" }}
            />
          </div>
        )}

        {/* Category filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
          {FILTERABLE_CATEGORIES.map((cat) => {
            const hidden = hiddenCats.has(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                style={{
                  ...btnSmall,
                  opacity: hidden ? 0.4 : 1,
                  borderColor: hidden ? "var(--border)" : CATEGORY_COLORS[cat],
                  color: hidden ? "var(--text-muted)" : CATEGORY_COLORS[cat],
                  fontSize: 11,
                  transition: "opacity 0.15s",
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 8, overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        <div ref={containerRef} style={{ width: "100%", height: 500 }} />
      </div>

      {/* Nearby POIs (when focused) */}
      {focusApt && nearbyPois.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 12 }}>
            Within {radius} mi of {focusApt.name}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
            {nearbyPois.map((poi) => (
              <div key={poi.name} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "8px 12px",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: CATEGORY_COLORS[poi.category] || "#64748b",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {poi.name}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                  {poi.dist.toFixed(1)} mi
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distance cards */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 16 }}>
          Distance to LLNL
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
          {apartments
            .slice()
            .sort((a, b) => a.location.dist_llnl_miles - b.location.dist_llnl_miles)
            .map((a) => (
              <div key={a.id} style={{
                background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {a.location.dist_llnl_miles} mi &middot; ~{a.location.drive_time_llnl_min} min drive &middot; {a.location.city}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
