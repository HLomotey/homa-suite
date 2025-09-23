import { useFinanceAnalytics as useFinanceAnalyticsCore } from '@/hooks/analytics/useFinanceAnalytics';

// Wrapper to support legacy imports and optional params
export function useFinanceAnalytics(year?: number, month?: number) {
  const now = new Date();
  const y = typeof year === 'number' ? year : now.getFullYear();
  const m = typeof month === 'number' ? month : now.getMonth() + 1;
  return useFinanceAnalyticsCore(y, m);
}

// Legacy placeholder: some components import useRevenueMetrics alongside finance analytics.
// The current codebase doesn't define a separate revenue metrics hook; return a benign shape.
export function useRevenueMetrics(..._args: any[]) {
  // Accept and ignore optional args (e.g., dateRanges) for compatibility
  return { data: null as any, isLoading: false };
}
