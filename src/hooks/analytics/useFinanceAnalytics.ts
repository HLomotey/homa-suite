import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integration/supabase/client';

// Define the finance invoice record interface to match the database schema
interface FinanceInvoiceRecord {
  id: string;
  client_name: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date_paid: string | null;
  item_name: string;
  item_description: string;
  rate: number;
  quantity: number;
  discount_percentage: number;
  line_subtotal: number;
  tax_1_type: string | null;
  tax_1_amount: number;
  tax_2_type: string | null;
  tax_2_amount: number;
  line_total: number;
  currency: string;
  created_at: string;
  updated_at: string | null;
}

export interface FinanceMetrics {
  totalRevenue: number;
  totalRevenueChange: number;
  totalInvoices: number;
  totalInvoicesChange: number;
  paidInvoices: number;
  paidInvoicesChange: number;
  outstanding: number;
  outstandingChange: number;
  overdue: number;
  overdueChange: number;
  pending: number;
  pendingChange: number;
  collectionRate: number;
  collectionRateChange: number;
  averageInvoiceValue: number;
}

export interface InvoiceData {
  id: string;
  client_name: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date_issued: string;
  date_paid: string | null;
  item_name: string;
}

export interface TrendData {
  month: string;
  revenue: number;
  invoices: number;
  paidInvoices: number;
}

export interface TopClientData {
  client_name: string;
  revenue: number;
  invoices: number;
}

export interface RecentPaymentData {
  id: string;
  client_name: string;
  invoice_number: string;
  amount: number;
  date_paid: string;
}

export interface FinanceAnalyticsData {
  metrics: FinanceMetrics;
  trends: TrendData[];
  topClients: TopClientData[];
  recentPayments: RecentPaymentData[];
  invoices: InvoiceData[];
}

const TABLE_NAME = 'finance_invoices';

export function useFinanceAnalytics(year: number, month: number) {
  const [data, setData] = useState<FinanceAnalyticsData>({
    metrics: {
      totalRevenue: 0,
      totalRevenueChange: 0,
      totalInvoices: 0,
      totalInvoicesChange: 0,
      paidInvoices: 0,
      paidInvoicesChange: 0,
      outstanding: 0,
      outstandingChange: 0,
      overdue: 0,
      overdueChange: 0,
      pending: 0,
      pendingChange: 0,
      collectionRate: 0,
      collectionRateChange: 0,
      averageInvoiceValue: 0,
    },
    trends: [],
    topClients: [],
    recentPayments: [],
    invoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchInvoices = useCallback(async (
    startDate: string,
    endDate: string,
    signal?: AbortSignal
  ): Promise<FinanceInvoiceRecord[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .gte('date_issued', startDate)
        .lte('date_issued', endDate)
        .order('date_issued', { ascending: false });

      if (error) throw error;
      return data as FinanceInvoiceRecord[] || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }, []);

  const calculateMetrics = useCallback((records: FinanceInvoiceRecord[], previousRecords: FinanceInvoiceRecord[]): FinanceMetrics => {
    // Current period metrics
    const totalRevenue = records.reduce((sum, record) => sum + record.line_total, 0);
    const totalInvoices = records.length;
    const paidInvoices = records.filter(r => r.invoice_status === 'paid').length;
    const pendingInvoices = records.filter(r => r.invoice_status === 'pending').length;
    const overdueInvoices = records.filter(r => r.invoice_status === 'overdue').length;
    const outstanding = records.filter(r => r.invoice_status !== 'paid').reduce((sum, r) => sum + r.line_total, 0);
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // Previous period metrics for comparison
    const prevTotalRevenue = previousRecords.reduce((sum, record) => sum + record.line_total, 0);
    const prevTotalInvoices = previousRecords.length;
    const prevPaidInvoices = previousRecords.filter(r => r.invoice_status === 'paid').length;
    const prevPendingInvoices = previousRecords.filter(r => r.invoice_status === 'pending').length;
    const prevOverdueInvoices = previousRecords.filter(r => r.invoice_status === 'overdue').length;
    const prevOutstanding = previousRecords.filter(r => r.invoice_status !== 'paid').reduce((sum, r) => sum + r.line_total, 0);
    const prevCollectionRate = prevTotalInvoices > 0 ? (prevPaidInvoices / prevTotalInvoices) * 100 : 0;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalRevenue,
      totalRevenueChange: calculateChange(totalRevenue, prevTotalRevenue),
      totalInvoices,
      totalInvoicesChange: calculateChange(totalInvoices, prevTotalInvoices),
      paidInvoices,
      paidInvoicesChange: calculateChange(paidInvoices, prevPaidInvoices),
      outstanding,
      outstandingChange: calculateChange(outstanding, prevOutstanding),
      overdue: overdueInvoices,
      overdueChange: calculateChange(overdueInvoices, prevOverdueInvoices),
      pending: pendingInvoices,
      pendingChange: calculateChange(pendingInvoices, prevPendingInvoices),
      collectionRate,
      collectionRateChange: calculateChange(collectionRate, prevCollectionRate),
      averageInvoiceValue,
    };
  }, []);

  const generateTrendData = useCallback((records: FinanceInvoiceRecord[]): TrendData[] => {
    const monthlyData = new Map<string, { revenue: number; invoices: number; paidInvoices: number }>();

    records.forEach(record => {
      const date = new Date(record.date_issued);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, invoices: 0, paidInvoices: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.revenue += record.line_total;
      data.invoices += 1;
      if (record.invoice_status === 'paid') {
        data.paidInvoices += 1;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, []);

  const generateTopClients = useCallback((records: FinanceInvoiceRecord[]): TopClientData[] => {
    const clientData = new Map<string, { revenue: number; invoices: number }>();

    records.forEach(record => {
      const clientName = record.client_name;
      
      if (!clientData.has(clientName)) {
        clientData.set(clientName, { revenue: 0, invoices: 0 });
      }
      
      const data = clientData.get(clientName)!;
      data.revenue += record.line_total;
      data.invoices += 1;
    });

    return Array.from(clientData.entries())
      .map(([client_name, data]) => ({
        client_name,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 clients
  }, []);

  const generateRecentPayments = useCallback((records: FinanceInvoiceRecord[]): RecentPaymentData[] => {
    return records
      .filter(record => record.invoice_status === 'paid' && record.date_paid)
      .sort((a, b) => new Date(b.date_paid!).getTime() - new Date(a.date_paid!).getTime())
      .slice(0, 10)
      .map(record => ({
        id: record.id,
        client_name: record.client_name,
        invoice_number: record.invoice_number,
        amount: record.line_total,
        date_paid: record.date_paid!
      }));
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const signal = controller.signal;

      // Current period filter
      const currentStartDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const currentEndDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Previous period filter
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevStartDate = new Date(prevYear, prevMonth - 1, 1).toISOString().split('T')[0];
      const prevEndDate = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];

      // Fetch current period data
      const currentRecords = await fetchInvoices(currentStartDate, currentEndDate, signal);

      // Fetch previous period data for comparison
      const previousRecords = await fetchInvoices(prevStartDate, prevEndDate, signal);

      // Fetch last 6 months for trends
      const sixMonthsAgo = new Date(year, month - 7, 1).toISOString().split('T')[0];
      const currentDate = new Date(year, month, 0).toISOString().split('T')[0];
      const trendRecords = await fetchInvoices(sixMonthsAgo, currentDate, signal);

      // Calculate all analytics
      const metrics = calculateMetrics(currentRecords, previousRecords);
      const trends = generateTrendData(trendRecords);
      const topClients = generateTopClients(currentRecords);
      const recentPayments = generateRecentPayments(currentRecords);

      // Convert records to invoice format
      const invoices: InvoiceData[] = currentRecords.map(record => ({
        id: record.id,
        client_name: record.client_name,
        invoice_number: record.invoice_number,
        amount: record.line_total,
        status: record.invoice_status,
        date_issued: record.date_issued,
        date_paid: record.date_paid,
        item_name: record.item_name
      }));

      setData({
        metrics,
        trends,
        topClients,
        recentPayments,
        invoices
      });

    } catch (err) {
      console.error('Error fetching finance analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch finance analytics');
    } finally {
      setLoading(false);
    }
  }, [year, month, fetchInvoices, calculateMetrics, generateTrendData, generateTopClients, generateRecentPayments]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch
  };
}
