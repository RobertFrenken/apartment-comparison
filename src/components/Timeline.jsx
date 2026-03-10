// Lease Timeline — Phase 2.3
// Pure SVG horizontal timeline showing lease availability windows per apartment.

const INTERNSHIP_START = new Date("2026-05-22");
const INTERNSHIP_END   = new Date("2026-08-25");
const TODAY            = new Date("2026-03-10");

// Layout constants
const VIEW_W    = 600;
const VIEW_H    = 200;
const PAD_LEFT  = 130; // room for y-axis labels
const PAD_RIGHT = 16;
const PAD_TOP   = 28;  // room for month labels
const PAD_BOT   = 12;

const CHART_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const CHART_H = VIEW_H - PAD_TOP  - PAD_BOT;

const BAR_HEIGHT  = 14;
const ROW_SPACING = 10; // gap between bars

function dateToMs(d) {
  return typeof d === "string" ? new Date(d).getTime() : d.getTime();
}

function msToX(ms, domainStart, domainEnd) {
  return PAD_LEFT + ((ms - domainStart) / (domainEnd - domainStart)) * CHART_W;
}

// Return first day of each month within [start, end] (inclusive edges)
function monthTicks(startMs, endMs) {
  const ticks = [];
  const d = new Date(startMs);
  d.setDate(1);
  // step forward to first month boundary >= startMs
  while (d.getTime() < startMs) d.setMonth(d.getMonth() + 1);
  while (d.getTime() <= endMs) {
    ticks.push(new Date(d));
    d.setMonth(d.getMonth() + 1);
  }
  return ticks;
}

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Timeline({ apartments }) {
  if (!apartments || apartments.length === 0) return null;

  // Filter to apartments that have lease date data
  const apts = apartments.filter(
    (a) => a.lease?.available_from && a.lease?.available_until
  );
  if (apts.length === 0) return null;

  // Domain: earliest available_from to latest available_until, with 15-day padding each side
  const allFromMs  = apts.map((a) => dateToMs(a.lease.available_from));
  const allUntilMs = apts.map((a) => dateToMs(a.lease.available_until));
  const PADDING_MS = 15 * 24 * 3600 * 1000;
  const domainStart = Math.min(...allFromMs,  dateToMs(TODAY)) - PADDING_MS;
  const domainEnd   = Math.max(...allUntilMs, dateToMs(TODAY)) + PADDING_MS;

  // Row layout — evenly distribute bars vertically in CHART_H
  const n = apts.length;
  const totalBarArea = n * BAR_HEIGHT + (n - 1) * ROW_SPACING;
  const firstBarY = PAD_TOP + (CHART_H - totalBarArea) / 2;
  const rowStride  = BAR_HEIGHT + ROW_SPACING;

  // Month tick positions
  const ticks = monthTicks(domainStart, domainEnd);

  // Internship band
  const bandX1 = msToX(dateToMs(INTERNSHIP_START), domainStart, domainEnd);
  const bandX2 = msToX(dateToMs(INTERNSHIP_END),   domainStart, domainEnd);

  // Today marker
  const todayX = msToX(dateToMs(TODAY), domainStart, domainEnd);
  const todayInRange = todayX >= PAD_LEFT && todayX <= PAD_LEFT + CHART_W;

  return (
    <div style={{
      margin: "16px 0 8px 0",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "12px 16px 8px 16px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1,
        color: "var(--accent-blue)", marginBottom: 8,
        textTransform: "uppercase",
      }}>
        Lease Availability Timeline
      </div>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", display: "block", overflow: "visible" }}
        aria-label="Lease availability timeline"
      >
        {/* Internship period background band */}
        <rect
          x={Math.max(bandX1, PAD_LEFT)}
          y={PAD_TOP}
          width={Math.min(bandX2, PAD_LEFT + CHART_W) - Math.max(bandX1, PAD_LEFT)}
          height={CHART_H}
          fill="rgba(37, 99, 235, 0.08)"
          stroke="rgba(37, 99, 235, 0.25)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        {/* "Internship" label above the band */}
        <text
          x={(Math.max(bandX1, PAD_LEFT) + Math.min(bandX2, PAD_LEFT + CHART_W)) / 2}
          y={PAD_TOP - 6}
          textAnchor="middle"
          fontSize={9}
          fontFamily="Inter, sans-serif"
          fill="rgba(37, 99, 235, 0.7)"
          fontWeight={600}
          letterSpacing={0.5}
        >
          INTERNSHIP
        </text>

        {/* Month tick lines + labels */}
        {ticks.map((tick, ti) => {
          const x = msToX(tick.getTime(), domainStart, domainEnd);
          if (x < PAD_LEFT || x > PAD_LEFT + CHART_W) return null;
          return (
            <g key={ti}>
              <line
                x1={x} y1={PAD_TOP}
                x2={x} y2={PAD_TOP + CHART_H}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={PAD_TOP - 4}
                textAnchor="middle"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fill="var(--text-muted)"
              >
                {MONTH_ABBR[tick.getMonth()]}
                {/* Show year for Jan */}
                {tick.getMonth() === 0 ? ` '${String(tick.getFullYear()).slice(2)}` : ""}
              </text>
            </g>
          );
        })}

        {/* Apartment bars */}
        {apts.map((a, i) => {
          const color = `hsl(${i * 137}deg, 55%, 50%)`;
          const fromMs  = dateToMs(a.lease.available_from);
          const untilMs = dateToMs(a.lease.available_until);
          const barX1 = Math.max(msToX(fromMs,  domainStart, domainEnd), PAD_LEFT);
          const barX2 = Math.min(msToX(untilMs, domainStart, domainEnd), PAD_LEFT + CHART_W);
          const barY  = firstBarY + i * rowStride;
          const barW  = Math.max(barX2 - barX1, 2);
          const midY  = barY + BAR_HEIGHT / 2;

          return (
            <g key={a.id}>
              {/* Y-axis label */}
              <text
                x={PAD_LEFT - 8}
                y={midY + 4}
                textAnchor="end"
                fontSize={10}
                fontFamily="Inter, sans-serif"
                fill="var(--text-secondary)"
                fontWeight={500}
              >
                {/* Truncate long names */}
                {a.name.length > 20 ? a.name.slice(0, 18) + "…" : a.name}
              </text>
              {/* Color dot matching table header */}
              <circle
                cx={PAD_LEFT - 106}
                cy={midY}
                r={5}
                fill={color}
              />
              {/* Availability bar */}
              <rect
                x={barX1}
                y={barY}
                width={barW}
                height={BAR_HEIGHT}
                rx={3}
                fill={color}
                opacity={0.85}
              />
            </g>
          );
        })}

        {/* Today marker */}
        {todayInRange && (
          <g>
            <line
              x1={todayX} y1={PAD_TOP - 2}
              x2={todayX} y2={PAD_TOP + CHART_H}
              stroke="var(--accent-red)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={todayX + 3}
              y={PAD_TOP + CHART_H - 3}
              fontSize={8}
              fontFamily="Inter, sans-serif"
              fill="var(--accent-red)"
              fontWeight={600}
            >
              Today
            </text>
          </g>
        )}

        {/* Legend — bottom right */}
        <g transform={`translate(${PAD_LEFT + CHART_W - 120}, ${VIEW_H - PAD_BOT - 2})`}>
          {/* Internship swatch */}
          <rect x={0} y={-8} width={10} height={8} rx={1}
            fill="rgba(37,99,235,0.15)" stroke="rgba(37,99,235,0.4)" strokeWidth={1} />
          <text x={13} y={0} fontSize={8} fontFamily="Inter, sans-serif" fill="var(--text-muted)">
            Internship window
          </text>
          {/* Today swatch */}
          <line x1={70} y1={-8} x2={70} y2={0}
            stroke="var(--accent-red)" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={74} y={0} fontSize={8} fontFamily="Inter, sans-serif" fill="var(--text-muted)">
            Today
          </text>
        </g>
      </svg>
    </div>
  );
}
