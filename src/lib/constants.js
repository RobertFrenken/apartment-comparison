// Shared color palette, visual constants, and configuration values.
// Centralizes magic numbers so they can be tuned in one place.

// --- Color palette ---
export const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];
export const GREEN_TINT = "rgba(5, 150, 105, 0.04)";
export const RED_TINT = "rgba(220, 38, 38, 0.04)";

// --- Time constants ---
export const MS_PER_DAY = 86_400_000;
export const DAYS_PER_MONTH = 30;
export const DEFAULT_STAY_DAYS = 90;

// --- Commute / gas estimate ---
export const GAS_RATE_PER_MILE = 0.21;  // IRS standard mileage rate ($/mile)
export const WORKDAYS_PER_MONTH = 22;
export const ROUND_TRIP_MULTIPLIER = 2;

// --- Scoring ---
export const BRACKET_SCORES = [10, 8, 6, 4];
export const BRACKET_FLOOR = 2;
export const CHECKLIST_CAP = 10;
export const REMOTE_WORK_SCALE_FACTOR = 2;  // maps 1-5 scale to 0-10

// --- Map configuration ---
export const MAP_CONFIG = {
  bounds: [[-122.20, 37.45], [-121.50, 37.90]],
  initialZoom: 11.5,
  minZoom: 9,
  maxZoom: 17,
  fitBoundsPadding: 50,
  fitBoundsMaxZoom: 13,
  flyToDuration: 800,
  flyToZoom: 13,
  tileStyle: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

export const MARKER_SIZES = {
  llnl: 20,
  apartment: 18,
  default: 14,
  poi: 10,
};

export const POPUP_OFFSETS = {
  apartment: 12,
  llnl: 12,
  poi: 8,
};

export const CATEGORY_COLORS = {
  apartment: "#2563eb",
  work: "#dc2626",
  grocery: "#059669",
  hospital: "#7c3aed",
  transit: "#d97706",
  restaurant: "#f97316",
  park: "#22c55e",
  gym: "#8b5cf6",
  shopping: "#ec4899",
  area: "#64748b",
  landmark: "#0891b2",
};

export const CATEGORY_LABELS = {
  apartment: "Apartments",
  work: "LLNL",
  grocery: "Grocery",
  restaurant: "Restaurants",
  park: "Parks",
  gym: "Gyms",
  shopping: "Shopping",
  hospital: "Hospital",
  transit: "Transit",
  area: "Areas",
  landmark: "Landmarks",
};

export const FILTERABLE_CATEGORIES = [
  "grocery", "restaurant", "park", "gym", "shopping", "hospital", "transit", "area", "landmark",
];

// --- Radar chart ---
export const RADAR = {
  cx: 200,
  cy: 200,
  radius: 140,
  labelRadius: 168,
  viewBox: "0 0 400 400",
  rings: [0.25, 0.5, 0.75, 1.0],
  minAxes: 3,
  dotRadius: 3,
};

// --- Gantt / Timeline ---
export const GANTT_CONFIG = {
  barHeight: 24,
  padding: 14,
  dateFormat: "YYYY-MM-DD",
  viewMode: "Month",
};

// --- Geographic constants ---
export const EARTH_RADIUS_MILES = 3958.8;
export const KM_PER_MILE = 1.60934;
export const DEG_PER_KM = 111.32;
export const GEO_CIRCLE_STEPS = 64;

// --- Cost color thresholds ---
export const COST_THRESHOLDS = {
  low: 4500,    // below = green
  mid: 5500,    // below = amber, above = red
};

// --- Radius slider ---
export const RADIUS_SLIDER = {
  min: 0.5,
  max: 5,
  step: 0.5,
  default: 2,
};

// --- Weight slider ---
export const WEIGHT_SLIDER = {
  min: 0,
  max: 40,
  step: 1,
};
