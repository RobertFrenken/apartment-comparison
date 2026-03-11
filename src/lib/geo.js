// Geographic utility functions for distance and shape calculations.

import { EARTH_RADIUS_MILES, KM_PER_MILE, DEG_PER_KM, GEO_CIRCLE_STEPS } from "./constants.js";

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function geoCircle(center, radiusMiles, steps = GEO_CIRCLE_STEPS) {
  const km = radiusMiles * KM_PER_MILE;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const lat = center[1] + (km * Math.sin(angle)) / DEG_PER_KM;
    const lng = center[0] + (km * Math.cos(angle)) / (DEG_PER_KM * Math.cos(center[1] * Math.PI / 180));
    coords.push([lng, lat]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] } };
}
