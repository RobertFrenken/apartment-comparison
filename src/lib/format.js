// Shared formatting utilities.

export function fmt(n) {
  return n != null ? `$${n.toLocaleString()}` : "N/A";
}
