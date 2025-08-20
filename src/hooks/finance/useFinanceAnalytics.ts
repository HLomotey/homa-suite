/**
 * Finance Analytics Hook - Fetches real data from finance_invoices table
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase/client';

export interface FinanceMetrics {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  sentInvoices: number;
  averageInvoiceValue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    invoices: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  topClients: Array<{
    client_name: string;
    total_revenue: number;
    invoice_count: number;
  }>;
}

export const useFinanceAnalytics = () => {
  return useQuery({
    queryKey: ['finance-analytics'],
    queryFn: async (): Promise<FinanceMetrics> => {
      // Get basic metrics
      const { data: invoices, error } = await supabase
        .from('finance_invoices')
        .select('*');

      if (error) throw error;

      const totalInvoices = invoices.length;
      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.line_total), 0);
      
      const statusCounts = invoices.reduce((acc, inv) => {
        acc[inv.invoice_status] = (acc[inv.invoice_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Monthly revenue aggregation
      const monthlyData = invoices.reduce((acc, inv) => {
        const month = new Date(inv.date_issued).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!acc[month]) {
          acc[month] = { revenue: 0, invoices: 0 };
        }
        
        acc[month].revenue += parseFloat(inv.line_total);
        acc[month].invoices += 1;
        
        return acc;
      }, {} as Record<string, { revenue: number; invoices: number }>);

      const monthlyRevenue = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: (data as { revenue: number; invoices: number }).revenue,
          invoices: (data as { revenue: number; invoices: number }).invoices
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      // Status distribution with percentages
      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
        percentage: ((count as number) / totalInvoices) * 100
      }));

      // Top clients by revenue
      const clientData = invoices.reduce((acc, inv) => {
        const client = inv.client_name;
        if (!acc[client]) {
          acc[client] = { total_revenue: 0, invoice_count: 0 };
        }
        acc[client].total_revenue += parseFloat(inv.line_total);
        acc[client].invoice_count += 1;
        return acc;
      }, {} as Record<string, { total_revenue: number; invoice_count: number }>);

      const topClients = Object.entries(clientData)
        .map(([client_name, data]) => ({
          client_name,
          total_revenue: (data as { total_revenue: number; invoice_count: number }).total_revenue,
          invoice_count: (data as { total_revenue: number; invoice_count: number }).invoice_count
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10);

      return {
        totalRevenue,
        totalInvoices,
        paidInvoices: statusCounts.paid || 0,
        pendingInvoices: statusCounts.pending || 0,
        overdueInvoices: statusCounts.overdue || 0,
        sentInvoices: statusCounts.sent || 0,
        averageInvoiceValue: totalRevenue / totalInvoices,
        monthlyRevenue,
        statusDistribution,
        topClients
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Additional hook for real-time revenue trends
export const useRevenueMetrics = () => {
  return useQuery({
    queryKey: ['revenue-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_invoices')
        .select('line_total, date_issued, invoice_status')
        .order('date_issued', { ascending: true });

      if (error) throw error;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthRevenue = data
        .filter(inv => {
          const invDate = new Date(inv.date_issued);
          return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.line_total), 0);

      const lastMonthRevenue = data
        .filter(inv => {
          const invDate = new Date(inv.date_issued);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return invDate.getMonth() === lastMonth && invDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.line_total), 0);

      const growthRate = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      return {
        thisMonthRevenue,
        lastMonthRevenue,
        growthRate,
        totalRevenue: data.reduce((sum, inv) => sum + parseFloat(inv.line_total), 0)
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
