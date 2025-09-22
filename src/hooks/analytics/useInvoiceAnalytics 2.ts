/**
 * Invoice analytics hooks
 * Provides data processing and analytics for invoice data
 */

import { useState, useEffect, useMemo } from "react";
import { useInvoices } from "../finance/useInvoice";
import { FrontendInvoice, InvoiceStatus } from "../../integration/supabase/types/finance";

/**
 * Interface for invoice summary statistics
 */
export interface InvoiceSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  averageInvoiceValue: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  cancelledCount: number;
  currencyBreakdown: Record<string, number>;
  clientBreakdown: Record<string, number>;
}

/**
 * Interface for invoice time series data
 */
export interface InvoiceTimeSeries {
  labels: string[];
  invoiced: number[];
  paid: number[];
}

/**
 * Hook for invoice summary analytics
 * @returns Object containing invoice summary data and loading state
 */
export const useInvoiceSummary = () => {
  const { invoices, loading, error } = useInvoices();
  const [summary, setSummary] = useState<InvoiceSummary>({
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    averageInvoiceValue: 0,
    invoiceCount: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    cancelledCount: 0,
    currencyBreakdown: {},
    clientBreakdown: {},
  });

  useEffect(() => {
    if (loading || error || !invoices.length) return;

    // Calculate summary statistics
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.lineTotal, 0);
    const paidInvoices = invoices.filter(inv => inv.invoiceStatus === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.invoiceStatus === 'pending');
    const overdueInvoices = invoices.filter(inv => inv.invoiceStatus === 'overdue');
    const cancelledInvoices = invoices.filter(inv => inv.invoiceStatus === 'cancelled');
    
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.lineTotal, 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.lineTotal, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.lineTotal, 0);
    
    // Currency breakdown
    const currencyBreakdown: Record<string, number> = {};
    invoices.forEach(inv => {
      if (!currencyBreakdown[inv.currency]) {
        currencyBreakdown[inv.currency] = 0;
      }
      currencyBreakdown[inv.currency] += inv.lineTotal;
    });
    
    // Client breakdown
    const clientBreakdown: Record<string, number> = {};
    invoices.forEach(inv => {
      if (!clientBreakdown[inv.clientName]) {
        clientBreakdown[inv.clientName] = 0;
      }
      clientBreakdown[inv.clientName] += inv.lineTotal;
    });

    setSummary({
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      averageInvoiceValue: totalInvoiced / invoices.length,
      invoiceCount: invoices.length,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      overdueCount: overdueInvoices.length,
      cancelledCount: cancelledInvoices.length,
      currencyBreakdown,
      clientBreakdown,
    });
  }, [invoices, loading, error]);

  return { summary, loading, error };
};

/**
 * Hook for invoice time series analytics
 * @param timeframe - 'weekly', 'monthly', or 'quarterly'
 * @param periods - Number of periods to include
 * @returns Object containing invoice time series data and loading state
 */
export const useInvoiceTimeSeries = (
  timeframe: 'weekly' | 'monthly' | 'quarterly' = 'monthly',
  periods: number = 6
) => {
  const { invoices, loading, error } = useInvoices();
  const [timeSeries, setTimeSeries] = useState<InvoiceTimeSeries>({
    labels: [],
    invoiced: [],
    paid: [],
  });

  useEffect(() => {
    if (loading || error || !invoices.length) return;

    const now = new Date();
    const labels: string[] = [];
    const invoicedData: number[] = [];
    const paidData: number[] = [];
    
    // Generate time periods
    for (let i = periods - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;
      
      if (timeframe === 'weekly') {
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - (i * 7));
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        label = `Week ${periods - i}`;
      } else if (timeframe === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        label = periodStart.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else { // quarterly
        const quarter = Math.floor((now.getMonth() - (i * 3)) / 3) % 4;
        const year = now.getFullYear() - Math.floor((i * 3 + now.getMonth()) / 12);
        periodStart = new Date(year, quarter * 3, 1);
        periodEnd = new Date(year, quarter * 3 + 3, 0);
        label = `Q${quarter + 1} ${year}`;
      }
      
      // Filter invoices for this period
      const periodInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.dateIssued);
        return invDate >= periodStart && invDate <= periodEnd;
      });
      
      const periodPaidInvoices = periodInvoices.filter(inv => 
        inv.invoiceStatus === 'paid'
      );
      
      // Calculate totals
      const periodTotal = periodInvoices.reduce((sum, inv) => sum + inv.lineTotal, 0);
      const periodPaidTotal = periodPaidInvoices.reduce((sum, inv) => sum + inv.lineTotal, 0);
      
      labels.push(label);
      invoicedData.push(periodTotal);
      paidData.push(periodPaidTotal);
    }
    
    setTimeSeries({
      labels,
      invoiced: invoicedData,
      paid: paidData,
    });
  }, [invoices, loading, error, timeframe, periods]);

  return { timeSeries, loading, error };
};

/**
 * Hook for invoice status distribution analytics
 * @returns Object containing invoice status distribution data and loading state
 */
export const useInvoiceStatusDistribution = () => {
  const { invoices, loading, error } = useInvoices();
  
  const statusDistribution = useMemo(() => {
    if (loading || error || !invoices.length) {
      return {
        labels: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
        data: [0, 0, 0, 0],
        percentages: [0, 0, 0, 0],
      };
    }

    const paidCount = invoices.filter(inv => inv.invoiceStatus === 'paid').length;
    const pendingCount = invoices.filter(inv => inv.invoiceStatus === 'pending').length;
    const overdueCount = invoices.filter(inv => inv.invoiceStatus === 'overdue').length;
    const cancelledCount = invoices.filter(inv => inv.invoiceStatus === 'cancelled').length;
    
    const total = invoices.length;
    
    return {
      labels: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
      data: [paidCount, pendingCount, overdueCount, cancelledCount],
      percentages: [
        Math.round((paidCount / total) * 100),
        Math.round((pendingCount / total) * 100),
        Math.round((overdueCount / total) * 100),
        Math.round((cancelledCount / total) * 100),
      ],
    };
  }, [invoices, loading, error]);

  return { statusDistribution, loading, error };
};

/**
 * Hook for top clients analytics
 * @param limit - Number of top clients to include
 * @returns Object containing top clients data and loading state
 */
export const useTopClients = (limit: number = 5) => {
  const { invoices, loading, error } = useInvoices();
  
  const topClients = useMemo(() => {
    if (loading || error || !invoices.length) {
      return [];
    }

    // Group invoices by client
    const clientMap: Record<string, { total: number, count: number }> = {};
    
    invoices.forEach(inv => {
      if (!clientMap[inv.clientName]) {
        clientMap[inv.clientName] = { total: 0, count: 0 };
      }
      clientMap[inv.clientName].total += inv.lineTotal;
      clientMap[inv.clientName].count += 1;
    });
    
    // Convert to array and sort
    return Object.entries(clientMap)
      .map(([clientName, data]) => ({
        clientName,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }, [invoices, loading, error, limit]);

  return { topClients, loading, error };
};
