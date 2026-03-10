// Shared cost calculation utilities.
// Used by: ComparisonTable, CostBreakdown, SummaryCards, ScoreCard

export function totalMonthlyCost(a) {
  return a.financials.monthly_rent + (a.financials.est_monthly_utilities || 0);
}

export function moveInCost(a) {
  return a.financials.monthly_rent
    + a.financials.security_deposit
    + (a.financials.application_fee || 0)
    + (a.financials.cleaning_fee || 0);
}

export function stayDays(a) {
  if (!a.lease.available_from || !a.lease.available_until) return 90;
  return Math.round((new Date(a.lease.available_until) - new Date(a.lease.available_from)) / 86400000);
}

export function totalStayCost(a) {
  const monthly = totalMonthlyCost(a) + (a.commute?.est_monthly_gas || 0);
  const months = stayDays(a) / 30;
  return moveInCost(a) + monthly * (months - 1);
}

export function gasEstimate(miles) {
  return Math.round(miles * 2 * 22 * 0.21 * 100) / 100;
}
