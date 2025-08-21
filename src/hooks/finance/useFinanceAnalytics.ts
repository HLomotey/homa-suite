/**
 * Finance Analytics Hook - Fetches real data from finance_invoices table
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";

// Function to invalidate finance analytics cache after batch uploads
export const invalidateFinanceCache = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["finance-analytics"] });
  queryClient.invalidateQueries({ queryKey: ["revenue-metrics"] });
};

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

export const useFinanceAnalytics = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ["finance-analytics", year, month],
    queryFn: async (): Promise<FinanceMetrics> => {
      // Get basic metrics with optional date filtering
      let query = supabase.from("finance_invoices").select("*");

      if (year && month) {
        const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
        const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Last day of month
        query = query.gte("date_issued", startDate).lte("date_issued", endDate);
      }

      const { data: invoices, error } = await query;
      if (error) throw error;

      const totalInvoices = invoices.length;
      const totalRevenue = invoices.reduce(
        (sum, inv) => sum + parseFloat(inv.line_total),
        0
      );

      const statusCounts = invoices.reduce((acc, inv) => {
        acc[inv.invoice_status] = (acc[inv.invoice_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Monthly revenue aggregation
      const monthlyData = invoices.reduce((acc, inv) => {
        const month = new Date(inv.date_issued).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
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
          invoices: (data as { revenue: number; invoices: number }).invoices,
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );

      // Status distribution with percentages
      const statusDistribution = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count: count as number,
          percentage: ((count as number) / totalInvoices) * 100,
        })
      );

      // Tax analysis by Tax 1 Type
      const taxData = invoices.reduce((acc, inv) => {
        const taxType = inv.tax_1_type || "No Tax";
        if (!acc[taxType]) {
          acc[taxType] = { total_revenue: 0, invoice_count: 0 };
        }
        acc[taxType].total_revenue += parseFloat(inv.line_total);
        acc[taxType].invoice_count += 1;
        return acc;
      }, {} as Record<string, { total_revenue: number; invoice_count: number }>);

      const topClients = Object.entries(taxData)
        .map(([client_name, data]) => ({
          client_name,
          total_revenue: (
            data as { total_revenue: number; invoice_count: number }
          ).total_revenue,
          invoice_count: (
            data as { total_revenue: number; invoice_count: number }
          ).invoice_count,
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
        topClients,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

// Additional hook for real-time revenue trends
export const useRevenueMetrics = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ["revenue-metrics", year, month],
    queryFn: async () => {
      let query = supabase
        .from("finance_invoices")
        .select("line_total, date_issued, invoice_status")
        .order("date_issued", { ascending: true });

      if (year && month) {
        const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
        const endDate = new Date(year, month, 0).toISOString().split("T")[0];
        query = query.gte("date_issued", startDate).lte("date_issued", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Use filtered period or current month if no filter
      const targetMonth = month ? month - 1 : new Date().getMonth(); // month - 1 because JS months are 0-indexed
      const targetYear = year || new Date().getFullYear();

      const thisMonthRevenue = data
        .filter((inv) => {
          const invDate = new Date(inv.date_issued);
          return (
            invDate.getMonth() === targetMonth &&
            invDate.getFullYear() === targetYear
          );
        })
        .reduce((sum, inv) => sum + parseFloat(inv.line_total), 0);

      const lastMonth = targetMonth === 0 ? 11 : targetMonth - 1;
      const lastMonthYear = targetMonth === 0 ? targetYear - 1 : targetYear;

      const lastMonthRevenue = data
        .filter((inv) => {
          const invDate = new Date(inv.date_issued);
          return (
            invDate.getMonth() === lastMonth &&
            invDate.getFullYear() === lastMonthYear
          );
        })
        .reduce((sum, inv) => sum + parseFloat(inv.line_total), 0);

      const growthRate =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      return {
        thisMonthRevenue,
        lastMonthRevenue,
        growthRate,
        totalRevenue: data.reduce(
          (sum, inv) => sum + parseFloat(inv.line_total),
          0
        ),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
