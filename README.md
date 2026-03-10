# Apartment Comparison

A static React app for comparing furnished rental listings near Lawrence Livermore National Laboratory (LLNL) for a summer 2026 internship. Deployed to GitHub Pages.

**Live site:** https://robertfrenken.github.io/apartment-comparison/

## Features

- **Compare** — Side-by-side table across 9 categories with collapsible sections, summary cards, and best/worst value highlighting (green/red tints)
- **Costs** — Monthly cost breakdown with bar charts, move-in costs, and total stay cost
- **Scorecard** — Weighted scoring system (7 criteria, 100 points) with ranked results and radar chart
- **Map** — MapLibre GL map bounded to Tri-Valley area with apartments, LLNL, groceries, hospitals, and transit markers
- **Add** — Add listings via form (with URL auto-detect, gas auto-calc) or JSON paste
- **About** — Scoring methodology, data schema, and cost calculation docs
- **Data portability** — Download/Import/Copy JSON buttons, duplicate listings
- **GitHub Issue flow** — Submit listings via issue form, auto-generates a PR for review

## Tech Stack

- **Vite 6** + **React 19** — Static SPA, no backend
- **MapLibre GL JS** — Vector tile map for location visualization
- **GitHub Pages** — Deployment via GitHub Actions
- **localStorage** — Client-side persistence for added/removed listings

## Data

All listing data lives in `src/data/apartments.json`. See `src/data/SCHEMA.md` for the full field reference and `src/data/manifest.json` for points of interest and metadata.

Listings are sourced from [FurnishedFinder](https://www.furnishedfinder.com) (requires login to view). The raw listing HTML files have been extracted into structured JSON and are no longer stored in the repo.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Outputs to dist/
```

## Adding Listings

1. **Form mode** — Fill in key fields via the Add tab. Pasting a FurnishedFinder URL auto-fills platform and listing ID. Distance auto-calculates gas cost.
2. **JSON mode** — Paste a JSON object matching the schema (see `src/data/SCHEMA.md`)
3. **GitHub Issue** — Open a [New Listing issue](../../issues/new?template=new-listing.yml) — a PR is auto-generated for review
4. **Duplicate** — Click "dup" on any existing listing in the Compare tab to copy and modify
5. **Import** — Click "Import JSON" to load a previously exported file
6. **Permanent** — Edit `src/data/apartments.json` directly and push

Changes made via the Add tab are saved to localStorage (browser-only, per-device). Use **Download JSON** to export your data, or **Copy JSON** to clipboard. Use "Reset data" to clear localStorage and reload from the JSON file.

## Scoring

| Criterion | Weight | Top Score Threshold |
|-----------|--------|-------------------|
| Monthly Cost | 25% | $4,000/mo or less |
| LLNL Proximity | 20% | 2 miles or less |
| Space | 15% | 1,500+ sq ft |
| Amenities | 15% | 10-point checklist |
| Move-in Cost | 10% | $5,000 or less |
| Remote Work | 10% | 5/5 self-assessed |
| Pet Friendly | 5% | Pets allowed |

Weights are configurable in `src/components/ScoreCard.jsx`.

## Project Structure

```
src/
├── data/
│   ├── apartments.json   # Listing data (source of truth)
│   ├── manifest.json     # POIs, metadata, internship dates
│   └── SCHEMA.md         # Field reference
├── components/
│   ├── ComparisonTable.jsx  # Collapsible sections, best/worst highlighting
│   ├── SummaryCards.jsx     # At-a-glance cards above comparison table
│   ├── CostBreakdown.jsx
│   ├── ScoreCard.jsx
│   ├── RadarChart.jsx       # SVG spider chart for score comparison
│   ├── Timeline.jsx         # SVG lease timeline with internship overlay
│   ├── MapView.jsx          # Bounded to Tri-Valley area
│   ├── AddListing.jsx       # URL auto-detect, gas auto-calc
│   ├── About.jsx
│   └── Badge.jsx
├── App.jsx
├── main.jsx
└── index.css
```
