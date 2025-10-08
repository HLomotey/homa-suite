import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase/client';

// Database view interfaces
interface FinanceMonthlySummary {
  year: number;
  month: number;
  month_start: string;
  total_invoices: number;
  paid_invoices: number;
  sent_invoices: number;
  overdue_invoices: number;
  cancelled_invoices: number;
  total_invoiced: number;
  total_revenue: number;
  outstanding_revenue: number;
  average_invoice_value: number;
  average_paid_invoice: number;
  collection_rate: number;
  unique_clients: number;
}

interface FinanceAnalyticsRecord {
  id: string;
  client_name: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date_paid: string | null;
  line_total: number;
  currency: string;
  issue_year: number;
  issue_month: number;
  days_to_payment: number | null;
  days_overdue: number | null;
  status_category: string;
  recognized_revenue: number;
  outstanding_amount: number;
  age_bucket: string;
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
  cancelledInvoices: number;
  cancelledInvoicesChange: number;
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

export function useFinanceAnalytics(year: number, month: number) {
  return useQuery({
    queryKey: ['finance-analytics', year, month],
    queryFn: async (): Promise<FinanceAnalyticsData> => {
      try {
        // Fetch current month summary
        const { data: currentSummary, error: currentError } = await supabase
          .from('finance_monthly_summary')
          .select('*')
          .eq('year', year)
          .eq('month', month)
          .single();

        if (currentError && currentError.code !== 'PGRST116') {
          console.warn('Finance monthly summary view error:', currentError);
          // Don't throw - return fallback data instead
        }

        // Fetch previous month for comparison
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        
        const { data: prevSummary, error: prevError } = await supabase
          .from('finance_monthly_summary')
          .select('*')
          .eq('year', prevYear)
          .eq('month', prevMonth)
          .single();

        if (prevError && prevError.code !== 'PGRST116') {
          console.warn('Previous month finance summary error:', prevError);
        }

        // Fetch last 6 months for trends
        const { data: trendData, error: trendError } = await supabase
          .from('finance_monthly_summary')
          .select('*')
          .gte('month_start', new Date(year, month - 7, 1).toISOString())
          .lte('month_start', new Date(year, month, 0).toISOString())
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (trendError) console.warn('Finance trends error:', trendError);

        // Fetch current month invoices for detailed data
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('finance_analytics_view')
          .select('*')
          .eq('issue_year', year)
          .eq('issue_month', month)
          .order('date_issued', { ascending: false });

        if (invoicesError) console.warn('Finance analytics view error:', invoicesError);

        // Calculate metrics with comparison
        const current = currentSummary as FinanceMonthlySummary | null;
        const previous = prevSummary as FinanceMonthlySummary | null;

        const calculateChange = (current: number, previous: number): number => {
          if (!previous || previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const metrics: FinanceMetrics = {
          totalRevenue: current?.total_revenue || 0,
          totalRevenueChange: calculateChange(
            current?.total_revenue || 0,
            previous?.total_revenue || 0
          ),
          totalInvoices: current?.total_invoices || 0,
          totalInvoicesChange: calculateChange(
            current?.total_invoices || 0,
            previous?.total_invoices || 0
          ),
          paidInvoices: current?.paid_invoices || 0,
          paidInvoicesChange: calculateChange(
            current?.paid_invoices || 0,
            previous?.paid_invoices || 0
          ),
          outstanding: current?.outstanding_revenue || 0,
          outstandingChange: calculateChange(
            current?.outstanding_revenue || 0,
            previous?.outstanding_revenue || 0
          ),
          overdue: current?.overdue_invoices || 0,
          overdueChange: calculateChange(
            current?.overdue_invoices || 0,
            previous?.overdue_invoices || 0
          ),
          pending: current?.sent_invoices || 0,
          pendingChange: calculateChange(
            current?.sent_invoices || 0,
            previous?.sent_invoices || 0
          ),
          cancelledInvoices: current?.cancelled_invoices || 0,
          cancelledInvoicesChange: calculateChange(
            current?.cancelled_invoices || 0,
            previous?.cancelled_invoices || 0
          ),
          collectionRate: current?.collection_rate || 0,
          collectionRateChange: calculateChange(
            current?.collection_rate || 0,
            previous?.collection_rate || 0
          ),
          averageInvoiceValue: current?.average_invoice_value || 0,
        };

        // Generate trend data
        const trends: TrendData[] = (trendData as FinanceMonthlySummary[] || []).map(item => ({
          month: `${item.year}-${String(item.month).padStart(2, '0')}`,
          revenue: item.total_revenue,
          invoices: item.total_invoices,
          paidInvoices: item.paid_invoices,
        }));

        // Generate top clients from current month invoices
        const clientMap = new Map<string, { revenue: number; invoices: number }>();
        (invoicesData as FinanceAnalyticsRecord[] || []).forEach(invoice => {
          const existing = clientMap.get(invoice.client_name) || { revenue: 0, invoices: 0 };
          clientMap.set(invoice.client_name, {
            revenue: existing.revenue + invoice.line_total,
            invoices: existing.invoices + 1,
          });
        });

        const topClients: TopClientData[] = Array.from(clientMap.entries())
          .map(([client_name, data]) => ({ client_name, ...data }))
          .sort((a, b) => b.revenue - a.revenue);

        // Generate recent payments
        const recentPayments: RecentPaymentData[] = (invoicesData as FinanceAnalyticsRecord[] || [])
          .filter(invoice => invoice.invoice_status === 'paid' && invoice.date_paid)
          .sort((a, b) => new Date(b.date_paid!).getTime() - new Date(a.date_paid!).getTime())
          .map(invoice => ({
            id: invoice.id,
            client_name: invoice.client_name,
            invoice_number: invoice.invoice_number,
            amount: invoice.line_total,
            date_paid: invoice.date_paid!,
          }));

        // Convert to invoice format
        const invoices: InvoiceData[] = (invoicesData as FinanceAnalyticsRecord[] || []).map(record => ({
          id: record.id,
          client_name: record.client_name,
          invoice_number: record.invoice_number,
          amount: record.line_total,
          status: record.invoice_status,
          date_issued: record.date_issued,
          date_paid: record.date_paid,
          item_name: '', // Not available in analytics view
        }));

        return {
          metrics,
          trends,
          topClients,
          recentPayments,
          invoices,
        };
      } catch (error) {
        console.error('Error fetching finance analytics:', error);
        throw new Error('Failed to fetch finance analytics');
      }
    },
  });
}
