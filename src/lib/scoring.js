// Data-driven scoring system — every formula is transparent and configurable.
// Used by: ScoreCard, SummaryCards, RadarChart, Calculator

import { totalMonthlyCost, moveInCost } from "./costs.js";
import { BRACKET_SCORES, BRACKET_FLOOR, CHECKLIST_CAP, REMOTE_WORK_SCALE_FACTOR } from "./constants.js";

// --- Criterion types ---
// "bracket"   — numeric value scored against configurable thresholds
// "checklist" — sum of boolean items, capped at 10
// "binary"    — yes/no toggle
// "scale"     — pre-computed numeric scale mapped to 0-10

export const CRITERIA = [
  {
    key: "monthly_cost",
    name: "Monthly Cost",
    type: "bracket",
    direction: "lower",
    getValue: (a) => totalMonthlyCost(a),
    formatValue: (v) => `$${v.toLocaleString()}/mo`,
    unit: "$",
    defaultBrackets: [4000, 4500, 5000, 5500],
    description: "Total rent + estimated utilities per month. Lower is better.",
  },
  {
    key: "cost_per_person",
    name: "Cost / Person",
    type: "bracket",
    direction: "lower",
    getValue: (a) => costPerPerson(a),
    formatValue: (v) => `$${v.toLocaleString()}/person`,
    unit: "$",
    defaultBrackets: [1500, 2000, 2500, 3000],
    description: "Monthly cost divided by number of bedrooms. Measures value per occupant.",
  },
  {
    key: "proximity",
    name: "LLNL Proximity",
    type: "bracket",
    direction: "lower",
    getValue: (a) => a.location.dist_llnl_miles,
    formatValue: (v) => `${v} mi`,
    unit: "mi",
    defaultBrackets: [2, 4, 6, 10],
    description: "Driving distance to LLNL (7000 East Ave). Shorter commute scores higher.",
  },
  {
    key: "space",
    name: "Space (sq ft)",
    type: "bracket",
    direction: "higher",
    getValue: (a) => a.space.sqft ?? 0,
    formatValue: (v) => `${v.toLocaleString()} sq ft`,
    unit: "sq ft",
    defaultBrackets: [1500, 1300, 1100, 900],
    description: "Total living area. More space scores higher.",
  },
  {
    key: "amenities",
    name: "Amenities",
    type: "checklist",
    items: [
      { key: "wifi", label: "WiFi Included", points: 1.5, check: (a) => !!a.amenities.internet },
      { key: "ac", label: "Air Conditioning", points: 1, check: (a) => !!a.amenities.ac },
      { key: "washer_dryer", label: "Washer/Dryer", points: 1.5, check: (a) => !!a.appliances.washer_dryer },
      { key: "dishwasher", label: "Dishwasher", points: 0.5, check: (a) => !!a.appliances.dishwasher },
      { key: "pool", label: "Pool", points: 1, check: (a) => !!a.space.pool },
      { key: "fireplace", label: "Fireplace", points: 0.5, check: (a) => !!a.appliances.fireplace },
      { key: "water_softener", label: "Water Softener", points: 0.5, check: (a) => !!a.appliances.water_softener },
      { key: "outdoor", label: "Outdoor Space", points: 1, check: (a) => !!a.space.outdoor_space },
      { key: "parking", label: "Parking", points: 1, check: (a) => !!a.space.parking },
      { key: "heating", label: "Heating", points: 0.5, check: (a) => !!a.amenities.heating },
      { key: "storage", label: "Storage", points: 0.5, check: (a) => !!a.amenities.storage },
      { key: "transit", label: "Near Transit", points: 0.5, check: (a) => !!a.amenities.near_transit },
      { key: "community", label: "Community Amenities", points: 1, check: (a) => (a.amenities.community_amenities?.length || 0) > 0 },
      { key: "grocery", label: "Nearby Grocery (2+)", points: 1, check: (a) => (a.location.nearest_grocery?.length || 0) >= 2 },
    ],
    description: "Points for available amenities and nearby conveniences. Capped at 10.",
  },
  {
    key: "pets",
    name: "Pet Friendly",
    type: "binary",
    check: (a) => a.rules.pets_allowed,
    trueLabel: "Allowed",
    falseLabel: "Not allowed",
    description: "Whether the listing allows pets. Important if you have a dog or cat.",
  },
  {
    key: "move_in",
    name: "Move-in Cost",
    type: "bracket",
    direction: "lower",
    getValue: (a) => moveInCost(a),
    formatValue: (v) => `$${v.toLocaleString()}`,
    unit: "$",
    defaultBrackets: [5000, 7000, 9000, 11000],
    description: "First month rent + security deposit + application fee + cleaning fee.",
  },
  {
    key: "remote_work",
    name: "Remote Work",
    type: "scale",
    getScore: (a) => Math.min((a.remote_work?.score || 3) * REMOTE_WORK_SCALE_FACTOR, 10),
    formatValue: (a) => `${a.remote_work?.score || "?"}/5`,
    description: "Self-assessed 1-5 score (doubled to 0-10) based on WiFi, quiet environment, dedicated workspace.",
  },
];

// --- Default weights (sum to 100) ---
export const DEFAULT_WEIGHTS = {
  monthly_cost: 20,
  cost_per_person: 15,
  proximity: 15,
  space: 12,
  amenities: 13,
  pets: 5,
  move_in: 10,
  remote_work: 10,
};

// --- Scoring functions ---

// Score a bracket criterion against thresholds
// direction "lower": value ≤ bracket[0] → 10, ≤ bracket[1] → 8, etc.
// direction "higher": value ≥ bracket[0] → 10, ≥ bracket[1] → 8, etc.
export function scoreBracket(value, brackets, direction) {
  for (let i = 0; i < brackets.length; i++) {
    if (direction === "lower" ? value <= brackets[i] : value >= brackets[i]) {
      return BRACKET_SCORES[i];
    }
  }
  return BRACKET_FLOOR;
}

// Score a checklist criterion — sum item points, cap at 10
export function scoreChecklist(apartment, items) {
  const raw = items.reduce((sum, item) => sum + (item.check(apartment) ? item.points : 0), 0);
  return Math.min(raw, CHECKLIST_CAP);
}

// Get the detail string for a checklist (which items pass)
export function checklistDetail(apartment, items) {
  const passing = items.filter((item) => item.check(apartment));
  if (passing.length === 0) return "None";
  return passing.map((item) => item.label).join(", ");
}

// Score any criterion with optional custom brackets
export function scoreCriterion(criterion, apartment, customBrackets) {
  switch (criterion.type) {
    case "bracket": {
      const brackets = customBrackets?.[criterion.key] || criterion.defaultBrackets;
      return scoreBracket(criterion.getValue(apartment), brackets, criterion.direction);
    }
    case "checklist":
      return scoreChecklist(apartment, criterion.items);
    case "binary":
      return criterion.check(apartment) ? 10 : 0;
    case "scale":
      return criterion.getScore(apartment);
    default:
      return 0;
  }
}

// Get human-readable detail for any criterion
export function criterionDetail(criterion, apartment) {
  switch (criterion.type) {
    case "bracket":
      return criterion.formatValue(criterion.getValue(apartment));
    case "checklist":
      return checklistDetail(apartment, criterion.items);
    case "binary":
      return criterion.check(apartment) ? criterion.trueLabel : criterion.falseLabel;
    case "scale":
      return criterion.formatValue(apartment);
    default:
      return "";
  }
}

// Cost per person = total monthly / bedrooms (min 1)
export function costPerPerson(a) {
  const beds = Math.max(a.space.bedrooms || 1, 1);
  return Math.round(totalMonthlyCost(a) / beds);
}

// Calculate overall score with optional custom weights and brackets
export function calcOverallScore(a, weights = DEFAULT_WEIGHTS, brackets = null) {
  return CRITERIA.reduce((sum, c) => {
    const w = weights[c.key] ?? 0;
    return sum + (scoreCriterion(c, a, brackets) / 10) * w;
  }, 0);
}

// Bracket labels for display: "≤4000 → 10 pts, ≤4500 → 8 pts, ..."
export function bracketLabels(criterion, customBrackets) {
  if (criterion.type !== "bracket") return [];
  const brackets = customBrackets?.[criterion.key] || criterion.defaultBrackets;
  const scores = [...BRACKET_SCORES, BRACKET_FLOOR];
  const op = criterion.direction === "lower" ? "≤" : "≥";
  const labels = brackets.map((b, i) => ({
    threshold: b,
    score: scores[i],
    label: `${op} ${b.toLocaleString()} → ${scores[i]} pts`,
  }));
  labels.push({
    threshold: null,
    score: BRACKET_FLOOR,
    label: `Otherwise → ${BRACKET_FLOOR} pts`,
  });
  return labels;
}
