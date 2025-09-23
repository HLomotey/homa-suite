import { useMemo } from 'react';
import { useFinanceAnalytics as useFinanceAnalyticsCore } from '@/hooks/analytics/useFinanceAnalytics';

// Minimal performance analytics derived from finance analytics to satisfy UI needs
export interface PerformanceAnalyticsData {
  kpis: Array<{ label: string; value: number; unit?: string }>;
}

export function usePerformanceAnalytics(year?: number, month?: number) {
  const now = new Date();
  const y = typeof year === 'number' ? year : now.getFullYear();
  const m = typeof month === 'number' ? month : now.getMonth() + 1;

  const { data: finance, isLoading, error } = useFinanceAnalyticsCore(y, m);

  const data: PerformanceAnalyticsData | null = useMemo(() => {
    if (!finance) return { kpis: [] };
    const metrics = finance.metrics;
    return {
      kpis: [
        { label: 'Total Revenue', value: metrics.totalRevenue },
        { label: 'Total Invoices', value: metrics.totalInvoices },
        { label: 'Collection Rate', value: metrics.collectionRate, unit: '%' },
        { label: 'Avg Invoice', value: metrics.averageInvoiceValue },
      ],
    };
  }, [finance]);

  return { data, isLoading, error };
}
