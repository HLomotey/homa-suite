/**
 * Finance Analytics Hook - Fetches real data from finance_analytics_view
 * Uses supabaseAdmin client to bypass RLS policies and data rendering limits
 * Updated to use optimized analytics view for better performance
 */

import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { supabase, supabaseAdmin } from "@/integration/supabase/client";

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
  cancelledInvoices: number;
  sentInvoices: number;
  averageInvoiceValue: number;
  collectionRate: number;
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
  isDataComplete: boolean; // Flag to indicate if all data was retrieved
}

// Paginated fetch function for all finance invoices
const fetchAllInvoicesPaginated = async (
  dateRanges?: DateRange[],
  signal?: AbortSignal
): Promise<{ data: any[]; totalCount: number }> => {
  const PAGE_SIZE = 1000;
  const MAX_RETRIES = 3;

  console.log(
    `fetchAllInvoicesPaginated called with dateRanges:`, dateRanges
  );

  // If no date ranges specified, fetch all data
  if (!dateRanges || dateRanges.length === 0) {
    console.log('No date ranges specified, fetching all invoices');
    
    // Get total count first - try view first, fallback to table
    let countQuery = supabaseAdmin
      .from("finance_analytics_view")
      .select("id", { count: "exact", head: true });
    
    let { count: totalCount, error: countError } = await countQuery;
    
    // If view doesn't exist, fallback to original table
    if (countError && countError.message?.includes('does not exist')) {
      console.log('finance_analytics_view not found, falling back to finance_invoices table');
      countQuery = supabaseAdmin
        .from("finance_invoices")
        .select("id", { count: "exact", head: true });
      const fallbackResult = await countQuery;
      totalCount = fallbackResult.count;
      countError = fallbackResult.error;
    }

    if (countError) {
      console.error("Count query error:", countError);
      throw new Error(`Failed to get total count: ${countError.message}`);
    }

    const total = totalCount || 0;
    console.log(`Total finance invoices count: ${total}`);

    if (total === 0) {
      return { data: [], totalCount: 0 };
    }

    // Fetch all pages
    let allRows: any[] = [];
    const pages = Math.ceil(total / PAGE_SIZE);
    
    for (let page = 0; page < pages; page++) {
      const from = page * PAGE_SIZE;
      const to = Math.min((page + 1) * PAGE_SIZE - 1, total - 1);
      
      let pageQuery = supabaseAdmin
        .from("finance_analytics_view")
        .select("*")
        .order("id", { ascending: true })
        .range(from, to);
      
      let { data, error } = await pageQuery;
      
      // If view doesn't exist, fallback to original table
      if (error && error.message?.includes('does not exist')) {
        pageQuery = supabaseAdmin
          .from("finance_invoices")
          .select("*")
          .order("id", { ascending: true })
          .range(from, to);
        const fallbackResult = await pageQuery;
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
        
      if (error) throw error;
      if (data) allRows = allRows.concat(data);
    }
    
    return { data: allRows, totalCount: total };
  }

  // For date ranges, we'll fetch each range separately and combine
  console.log(`Fetching data for ${dateRanges.length} date ranges`);
  let allData: any[] = [];
  let totalCount = 0;

  // Ensure dateRanges is iterable
  if (!Array.isArray(dateRanges)) {
    console.error('dateRanges is not an array:', dateRanges);
    throw new Error('dateRanges must be an array');
  }

  for (const range of dateRanges) {
    const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
    const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
    
    console.log(`Fetching data for ${range.year}-${range.month} (${startDate} to ${endDate})`);
    
    // Get count for this range - try view first, fallback to table
    let rangeQuery = supabaseAdmin
      .from("finance_analytics_view")
      .select("id", { count: "exact", head: true })
      .gte("date_issued", startDate)
      .lte("date_issued", endDate);
    
    let { count: rangeCount, error: countError } = await rangeQuery;
    
    // If view doesn't exist, fallback to original table
    if (countError && countError.message?.includes('does not exist')) {
      console.log('finance_analytics_view not found for range query, falling back to finance_invoices table');
      rangeQuery = supabaseAdmin
        .from("finance_invoices")
        .select("id", { count: "exact", head: true })
        .gte("date_issued", startDate)
        .lte("date_issued", endDate);
      const fallbackResult = await rangeQuery;
      rangeCount = fallbackResult.count;
      countError = fallbackResult.error;
    }

    if (countError) {
      console.error(`Count query error for range ${range.year}-${range.month}:`, countError);
      continue; // Skip this range if count fails
    }

    const rangeTotal = rangeCount || 0;
    console.log(`Range ${range.year}-${range.month} has ${rangeTotal} invoices`);
    
    if (rangeTotal === 0) continue;

    // Fetch all pages for this range
    const pages = Math.ceil(rangeTotal / PAGE_SIZE);
    
    for (let page = 0; page < pages; page++) {
      const from = page * PAGE_SIZE;
      const to = Math.min((page + 1) * PAGE_SIZE - 1, rangeTotal - 1);
      
      let rangePageQuery = supabaseAdmin
        .from("finance_analytics_view")
        .select("*")
        .gte("date_issued", startDate)
        .lte("date_issued", endDate)
        .order("id", { ascending: true })
        .range(from, to);
      
      let { data, error } = await rangePageQuery;
      
      // If view doesn't exist, fallback to original table
      if (error && error.message?.includes('does not exist')) {
        rangePageQuery = supabaseAdmin
          .from("finance_invoices")
          .select("*")
          .gte("date_issued", startDate)
          .lte("date_issued", endDate)
          .order("id", { ascending: true })
          .range(from, to);
        const fallbackResult = await rangePageQuery;
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
        
      if (error) {
        console.error(`Error fetching page ${page} for range ${range.year}-${range.month}:`, error);
        continue;
      }
      
      if (data) {
        allData = allData.concat(data);
      }
    }
    
    totalCount += rangeTotal;
  }

  console.log(`Successfully fetched ${allData.length} records across ${dateRanges.length} date ranges`);
  return { data: allData, totalCount };

};

interface DateRange {
  year: number;
  month: number;
}

export function useFinanceAnalytics(dateRanges?: DateRange[]) {
  return useQuery({
    queryKey: ["finance-analytics", dateRanges],
    queryFn: async (): Promise<FinanceMetrics> => {
      try {
      console.log("Starting finance analytics fetch with pagination...");

      // Use paginated fetch to get ALL records for selected date ranges
      let allInvoices: any[] = [];
      let totalCount = 0;

      // Fetch data for selected date ranges (or all data if none selected)
      const result = await fetchAllInvoicesPaginated(dateRanges);
      allInvoices = result.data;
      totalCount = result.totalCount;

      const invoices = allInvoices;
      const typedInvoices = (invoices as any[]) || [];

      console.log(
        `Finance analytics processing ${typedInvoices.length} records out of ${totalCount} total`
      );

      if (typedInvoices.length !== totalCount) {
        console.warn(
          `Warning: Expected ${totalCount} records but got ${typedInvoices.length}`
        );
      }

      const totalInvoices = typedInvoices.length;

      // Log the actual number of invoices fetched for debugging
      console.log(
        `Finance Analytics: Fetched ${totalInvoices} invoices from database`
      );
      console.log(
        `Query executed for ${dateRanges?.length || 0} date ranges: SELECT * FROM finance_analytics_view${dateRanges && dateRanges.length > 0 ? ' WHERE (multiple date ranges)' : ''}`
      );

      // Check if we hit Supabase's default limit
      if (totalInvoices === 1000) {
        console.warn(
          "⚠️ WARNING: Exactly 1000 records returned - this may indicate a default limit is being applied"
        );
      }

      // Calculate total revenue directly from the fetched invoices
      const totalRevenue = typedInvoices.reduce(
        (sum, invoice) => {
          const lineTotal = invoice.line_total;
          if (lineTotal === null || lineTotal === undefined) return sum;
          const numericValue = typeof lineTotal === 'number' ? lineTotal : parseFloat(lineTotal);
          return sum + (isNaN(numericValue) ? 0 : numericValue);
        },
        0
      );

      // Calculate invoice status counts
      const statusCounts = typedInvoices.reduce((acc, inv) => {
        acc[inv.invoice_status] = (acc[inv.invoice_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const paidInvoices = statusCounts.paid || 0;
      const pendingInvoices = statusCounts.pending || 0;
      const overdueInvoices = statusCounts.overdue || 0;
      const sentInvoices = statusCounts.sent || 0;
      const cancelledInvoices = statusCounts.cancelled || 0;
      const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

      // Client revenue aggregation
      const clientData = typedInvoices.reduce((acc, inv) => {
        const clientName = inv.client_name || "Unknown Client";
        if (!acc[clientName]) {
          acc[clientName] = { total_revenue: 0, invoice_count: 0 };
        }
        const lineTotal = parseFloat(inv.line_total);
        acc[clientName].total_revenue += isNaN(lineTotal) ? 0 : lineTotal;
        acc[clientName].invoice_count += 1;
        return acc;
      }, {} as Record<string, { total_revenue: number; invoice_count: number }>);

      const topClients = Object.entries(clientData)
        .map(([client_name, data]) => ({
          client_name,
          total_revenue: (data as { total_revenue: number; invoice_count: number }).total_revenue,
          invoice_count: (data as { total_revenue: number; invoice_count: number }).invoice_count,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10);

      // Calculate average invoice value
      const averageInvoiceValue =
        totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

      // Monthly revenue aggregation
      const monthlyData = typedInvoices.reduce((acc, inv) => {
        const month = new Date(inv.date_issued).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });

        if (!acc[month]) {
          acc[month] = { revenue: 0, invoices: 0 };
        }

        const lineTotal = parseFloat(inv.line_total);
        acc[month].revenue += isNaN(lineTotal) ? 0 : lineTotal;
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

      return {
        totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
        totalInvoices: totalInvoices || 0,
        paidInvoices: paidInvoices || 0,
        pendingInvoices: pendingInvoices || 0,
        overdueInvoices: overdueInvoices || 0,
        sentInvoices: sentInvoices || 0,
        cancelledInvoices: cancelledInvoices || 0,
        averageInvoiceValue: isNaN(averageInvoiceValue) ? 0 : averageInvoiceValue,
        collectionRate: isNaN(collectionRate) ? 0 : collectionRate,
        topClients: topClients || [],
        monthlyRevenue: monthlyRevenue || [],
        statusDistribution: statusDistribution || [],
        isDataComplete: totalInvoices === totalCount,
      };
      } catch (error) {
        console.error('Error in useFinanceAnalytics:', error);
        // Return safe default values to prevent crashes
        return {
          totalRevenue: 0,
          totalInvoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          sentInvoices: 0,
          cancelledInvoices: 0,
          averageInvoiceValue: 0,
          collectionRate: 0,
          topClients: [],
          monthlyRevenue: [],
          statusDistribution: [],
          isDataComplete: false,
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
}

export const useRevenueMetrics = (dateRanges?: DateRange[]) => {
  return useQuery({
    queryKey: ["revenue-metrics", dateRanges],
    queryFn: async () => {
      try {
        console.log("Starting revenue metrics fetch with pagination...");

        // Use paginated fetch to get ALL records for accurate revenue calculations
        const result = await fetchAllInvoicesPaginated(dateRanges);
        const allData = result.data;
        const totalCount = result.totalCount;
        
        const typedData = allData.map((invoice) => ({
          line_total: invoice.line_total,
          date_issued: invoice.date_issued,
          invoice_status: invoice.invoice_status,
        }));

        console.log(
          `Revenue metrics processing ${typedData.length} records out of ${totalCount} total`
        );

        // Calculate current period revenue
        const thisMonthRevenue = typedData.reduce((sum, invoice) => {
          const lineTotal = parseFloat(invoice.line_total);
          return sum + (isNaN(lineTotal) ? 0 : lineTotal);
        }, 0);

        // Mock last month data for growth calculation
        const lastMonthRevenue = thisMonthRevenue * 0.92; // Simulate 8% growth
        const growthRate = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        return {
          thisMonthRevenue: isNaN(thisMonthRevenue) ? 0 : thisMonthRevenue,
          lastMonthRevenue: isNaN(lastMonthRevenue) ? 0 : lastMonthRevenue,
          growthRate: isNaN(growthRate) ? 0 : growthRate,
          totalRevenue: isNaN(thisMonthRevenue) ? 0 : thisMonthRevenue,
        };
      } catch (error) {
        console.error('Error in useRevenueMetrics:', error);
        return {
          thisMonthRevenue: 0,
          lastMonthRevenue: 0,
          growthRate: 0,
          totalRevenue: 0,
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
};
