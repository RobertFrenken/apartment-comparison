// Shared cost calculation utilities.
// Used by: ComparisonTable, CostBreakdown, SummaryCards, ScoreCard, AddListing

import {
  MS_PER_DAY, DAYS_PER_MONTH, DEFAULT_STAY_DAYS,
  GAS_RATE_PER_MILE, WORKDAYS_PER_MONTH, ROUND_TRIP_MULTIPLIER,
} from "./constants.js";

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
  if (!a.lease.available_from || !a.lease.available_until) return DEFAULT_STAY_DAYS;
  return Math.round((new Date(a.lease.available_until) - new Date(a.lease.available_from)) / MS_PER_DAY);
}

export function totalStayCost(a) {
  const monthly = totalMonthlyCost(a) + (a.commute?.est_monthly_gas || 0);
  const months = stayDays(a) / DAYS_PER_MONTH;
  return moveInCost(a) + monthly * (months - 1);
}

export function gasEstimate(miles) {
  return Math.round(miles * ROUND_TRIP_MULTIPLIER * WORKDAYS_PER_MONTH * GAS_RATE_PER_MILE * 100) / 100;
}
