import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "../../node_modules/frappe-gantt/dist/frappe-gantt.css";
import { COLORS, GANTT_CONFIG } from "../lib/constants.js";
import { cardStyle } from "../lib/styles.js";
import { formatDate } from "../lib/format.js";
import manifest from "../data/manifest.json";

export default function Timeline({ apartments, onUpdateDates }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const apts = apartments.filter(
      (a) => a.lease?.available_from && a.lease?.available_until
    );
    if (apts.length === 0) return;

    containerRef.current.innerHTML = "";

    const { start: intStart, end: intEnd } = manifest.internship_dates;
    const tasks = [
      {
        id: "internship",
        name: `Internship (${intStart} – ${intEnd})`,
        start: intStart,
        end: intEnd,
        progress: 0,
        custom_class: "gantt-internship",
      },
      ...apts.map((a, i) => ({
        id: a.id,
        name: a.name,
        start: a.lease.available_from,
        end: a.lease.available_until,
        progress: 100,
        custom_class: `gantt-apt-${i % COLORS.length}`,
      })),
    ];

    new Gantt(containerRef.current, tasks, {
      view_mode: GANTT_CONFIG.viewMode,
      bar_height: GANTT_CONFIG.barHeight,
      padding: GANTT_CONFIG.padding,
      date_format: GANTT_CONFIG.dateFormat,
      on_date_change: (task, start, end) => {
        if (task.id === "internship") return;
        onUpdateDates?.(task.id, formatDate(start), formatDate(end));
      },
    });
  }, [apartments, onUpdateDates]);

  const apts = apartments.filter(
    (a) => a.lease?.available_from && a.lease?.available_until
  );
  if (apts.length === 0) return null;

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>
        Lease Availability Timeline
      </h3>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        Drag bar edges to adjust dates. Changes update the listing data.
      </p>
      <style>{`
        .gantt-container { overflow-x: auto; }
        .gantt .bar-label { font-family: Inter, sans-serif; font-size: 11px; }
        .gantt .bar-wrapper[data-id="internship"] { cursor: default; pointer-events: none; }
        .gantt .lower-text, .gantt .upper-text { font-family: Inter, sans-serif; fill: var(--text-secondary, #475569); }
        .gantt .grid-header { fill: var(--bg-header, #f1f5f9); stroke: var(--border, #e2e8f0); }
        .gantt .grid-row { fill: var(--bg-card, #fff); }
        .gantt .grid-row:nth-child(even) { fill: var(--bg-row-even, #f8fafc); }
        .gantt .row-line { stroke: var(--border, #e2e8f0); }
        .gantt .tick { stroke: var(--border, #e2e8f0); }
        .gantt .today-highlight { fill: rgba(37, 99, 235, 0.06); }
        .gantt-internship .bar-progress { fill: rgba(37, 99, 235, 0.25); }
        .gantt-internship .bar-wrapper { fill: rgba(37, 99, 235, 0.15); stroke: rgba(37, 99, 235, 0.4); }
        ${COLORS.map((c, i) => `
          .gantt-apt-${i} .bar-progress { fill: ${c}; opacity: 0.85; }
          .gantt-apt-${i} .bar-wrapper { fill: ${c}20; stroke: ${c}; }
        `).join("")}
      `}</style>
      <div ref={containerRef} />
    </div>
  );
}
