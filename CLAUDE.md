# Apartment Comparison

## Overview
Static React SPA (Vite 6 + React 19) for comparing furnished rentals near LLNL. Deployed to GitHub Pages via Actions workflow. No backend — all data in JSON + localStorage.

## Architecture
- **Entry:** `index.html` → `src/main.jsx` → `src/App.jsx`
- **Tabs:** Compare, Costs, Scorecard, Map, Add, About — each a component in `src/components/`
- **Data:** `src/data/apartments.json` is the source of truth. `manifest.json` has POIs + metadata.
- **State:** `App.jsx` manages apartments array with localStorage persistence. `save()` writes, `resetData()` clears. Export/Import JSON buttons for data portability.
- **Styling:** CSS variables in `src/index.css` (light theme). All components use inline styles referencing these variables.
- **Map:** MapLibre GL JS with free CARTO Positron tiles (no API key). Bounded to Tri-Valley/East Bay area via `maxBounds`.
- **GitHub Issue → PR:** `new-listing` issue template auto-generates PRs via Actions workflow.

## Key Files
| File | Purpose |
|------|---------|
| `src/data/apartments.json` | Listing data — add/edit listings here |
| `src/data/manifest.json` | POIs (LLNL, groceries, hospitals, transit), internship dates |
| `src/data/SCHEMA.md` | Full field reference for apartment objects |
| `src/components/ComparisonTable.jsx` | `SECTIONS` array defines comparison rows, collapsible sections, best/worst highlighting |
| `src/components/SummaryCards.jsx` | At-a-glance cards (cost, sqft, distance, score, verdict tags) |
| `src/components/ScoreCard.jsx` | Scoring weights in `CRITERIA` array — adjust weights here |
| `src/components/RadarChart.jsx` | SVG spider chart for visual score comparison |
| `src/components/Timeline.jsx` | SVG lease timeline with internship period overlay |
| `src/components/CostBreakdown.jsx` | Cost formulas: monthly, move-in, total stay |
| `src/components/MapView.jsx` | MapLibre map with apartment + POI markers, bounded to Tri-Valley |
| `src/components/AddListing.jsx` | Form with URL auto-detect, gas auto-calc, smart defaults |
| `src/index.css` | CSS variables for theming |
| `.github/workflows/deploy.yml` | GitHub Actions → GitHub Pages deployment |
| `.github/workflows/listing-from-issue.yml` | Issue → PR automation for new listings |
| `vite.config.js` | `base: "/apartment-comparison/"` for GH Pages subpath |

## Conventions
- All monetary values in USD as numbers (no strings)
- Boolean fields: `true`/`false`. Unknown: `null`
- String-or-boolean fields (e.g. `internet`): `null` = unknown, `false` = not available, string = value
- Gas estimate: `one_way_miles * 2 * 22 * $0.21`
- Scoring: 7 criteria, weights sum to 100, each criterion scored 0-10
- Listing IDs from FurnishedFinder (e.g. "881538_1")
- `photos_url` field exists but photos are not yet implemented

## Development
```bash
npm run dev     # Dev server at localhost:5173
npm run build   # Production build to dist/
```

## What NOT to do
- Don't add heavy JS frameworks — this is intentionally a lightweight SPA
- Don't hardcode API keys — map uses free tile servers
- Don't modify `dist/` — it's build output, gitignored
