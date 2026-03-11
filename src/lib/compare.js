// Generic comparator factories for best/worst highlighting in tables.
// Replaces separate lowerIsBetter, higherIsBetter, boolTrueIsBetter functions.

export function numericBest(valueFn, direction = "lower") {
  return (apartments) => {
    const entries = apartments
      .map((a) => ({ id: a.id, v: valueFn(a) }))
      .filter((e) => e.v != null && isFinite(e.v));
    if (entries.length < 2) return {};
    const min = Math.min(...entries.map((e) => e.v));
    const max = Math.max(...entries.map((e) => e.v));
    if (min === max) return {};
    const bestVal = direction === "lower" ? min : max;
    const worstVal = direction === "lower" ? max : min;
    return {
      bestIds: new Set(entries.filter((e) => e.v === bestVal).map((e) => e.id)),
      worstIds: new Set(entries.filter((e) => e.v === worstVal).map((e) => e.id)),
    };
  };
}

export function boolBest(valueFn) {
  return (apartments) => {
    const entries = apartments
      .map((a) => ({ id: a.id, v: valueFn(a) }))
      .filter((e) => e.v != null);
    const hasTrue = entries.some((e) => e.v === true);
    const hasFalse = entries.some((e) => e.v === false);
    if (!hasTrue || !hasFalse) return {};
    return {
      bestIds: new Set(entries.filter((e) => e.v === true).map((e) => e.id)),
      worstIds: new Set(entries.filter((e) => e.v === false).map((e) => e.id)),
    };
  };
}
