import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import manifest from "../data/manifest.json";

const LLNL = manifest.target_location;

// Tri-Valley / East Bay bounding box — prevents panning outside the region
const TRI_VALLEY_BOUNDS = [
  [-122.20, 37.45], // SW: west of Castro Valley, south of Fremont
  [-121.50, 37.90], // NE: east of Altamont Pass, north of Dublin ridge
];

const CATEGORY_COLORS = {
  apartment: "#2563eb",
  work: "#dc2626",
  grocery: "#059669",
  hospital: "#7c3aed",
  transit: "#d97706",
  area: "#64748b",
  landmark: "#0891b2",
};

const CATEGORY_LABELS = {
  apartment: "Apartments",
  work: "LLNL",
  grocery: "Grocery",
  hospital: "Hospital",
  transit: "Transit",
  area: "Areas",
  landmark: "Landmarks",
};

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

export default function MapView({ apartments }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [LLNL.lng, LLNL.lat],
      zoom: 11.5,
      maxBounds: TRI_VALLEY_BOUNDS,
      minZoom: 9,
      maxZoom: 17,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      // LLNL marker (larger, red)
      const llnlEl = createMarkerEl(CATEGORY_COLORS.work, 20);
      new maplibregl.Marker({ element: llnlEl })
        .setLngLat([LLNL.lng, LLNL.lat])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(
          popupHtml("LLNL", "7000 East Ave, Livermore, CA 94550", CATEGORY_COLORS.work)
        ))
        .addTo(map);

      // Apartment markers (blue, large)
      apartments.forEach((a) => {
        const lat = a.location.lat;
        const lng = a.location.lng;
        if (lat == null || lng == null) return;

        const el = createMarkerEl(CATEGORY_COLORS.apartment, 18);
        const rent = `$${a.financials.monthly_rent.toLocaleString()}/mo`;
        const detail = [
          rent,
          `${a.space.sqft?.toLocaleString()} sq ft`,
          `${a.location.dist_llnl_miles} mi to LLNL`,
          `${a.space.bedrooms}BR/${a.space.bathrooms}BA`,
        ].join("<br>");

        new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(
            popupHtml(a.name, detail, CATEGORY_COLORS.apartment)
          ))
          .addTo(map);
      });

      // POI markers from manifest
      manifest.points_of_interest.forEach((poi) => {
        if (poi.category === "work") return; // Already added LLNL above
        const color = CATEGORY_COLORS[poi.category] || "#64748b";
        const el = createMarkerEl(color, 10);

        new maplibregl.Marker({ element: el })
          .setLngLat([poi.lng, poi.lat])
          .setPopup(new maplibregl.Popup({ offset: 8 }).setHTML(
            popupHtml(poi.name, poi.category, color)
          ))
          .addTo(map);
      });

      // Fit bounds to show all points
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([LLNL.lng, LLNL.lat]);
      apartments.forEach((a) => {
        if (a.location.lat != null && a.location.lng != null) {
          bounds.extend([a.location.lng, a.location.lat]);
        }
      });
      manifest.points_of_interest.forEach((poi) => {
        bounds.extend([poi.lng, poi.lat]);
      });
      map.fitBounds(bounds, { padding: 50, maxZoom: 13 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [apartments]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 8, overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        <div ref={containerRef} style={{ width: "100%", height: 500 }} />
      </div>

      {/* Legend */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "16px 24px", boxShadow: "var(--shadow-sm)",
        display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13,
      }}>
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: cat === "apartment" || cat === "work" ? 14 : 10,
              height: cat === "apartment" || cat === "work" ? 14 : 10,
              borderRadius: "50%",
              background: CATEGORY_COLORS[cat],
              border: "2px solid #fff",
              boxShadow: "0 0 0 1px var(--border)",
            }} />
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Apartment distances */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 8, padding: 24, boxShadow: "var(--shadow-sm)",
      }}>
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
