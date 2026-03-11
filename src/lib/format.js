// Shared formatting utilities.

import { DAYS_PER_MONTH } from "./constants.js";

export function fmt(n) {
  return n != null ? `$${n.toLocaleString()}` : "N/A";
}

export function formatDate(d) {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}

export function formatDays(days) {
  return `${days} days (~${(days / DAYS_PER_MONTH).toFixed(1)} months)`;
}
