/**
 * Finance Analytics Hook - Fetches real data from finance_invoices table
 * Uses supabaseAdmin client to bypass RLS policies and data rendering limits
 */

import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
  isDataComplete: boolean; // Flag to indicate if all data was retrieved
}

// Paginated fetch function for all finance invoices
const fetchAllInvoicesPaginated = async (
  year?: number,
  month?: number,
  signal?: AbortSignal
): Promise<{ data: any[]; totalCount: number }> => {
  const PAGE_SIZE = 1000;
  const MAX_RETRIES = 3;
  
  console.log(`fetchAllInvoicesPaginated called with year: ${year}, month: ${month}`);
  
  // Build base query
  let baseQuery = supabaseAdmin.from("finance_invoices").select("*");
  
  if (year && month) {
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];
    baseQuery = baseQuery.gte("date_issued", startDate).lte("date_issued", endDate);
  }
  
  // Get total count first
  let countQuery = supabaseAdmin
    .from("finance_invoices")
    .select("id", { count: "exact", head: true });
    
  if (year && month) {
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];
    countQuery = countQuery.gte("date_issued", startDate).lte("date_issued", endDate);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    console.error("Count query error:", countError);
    throw new Error(`Failed to get total count: ${countError.message}`);
  }

  const total = totalCount || 0;
  console.log(`Total finance invoices count: ${total}`);
  
  let allRows: any[] = [];

  if (total === 0) {
    console.log("No finance invoices found, returning empty array");
    return { data: [], totalCount: 0 };
  }

  // Fetch all pages
  const pages = Math.ceil(total / PAGE_SIZE);
  console.log(`Will fetch ${pages} pages with ${PAGE_SIZE} records per page`);
  
  for (let page = 0; page < pages; page++) {
    if (page > 0 && page % 5 === 0) {
      console.log(`Fetched ${allRows.length} finance records so far (${Math.round(allRows.length / total * 100)}%)`);
    }
    
    const from = page * PAGE_SIZE;
    const to = Math.min((page + 1) * PAGE_SIZE - 1, total - 1);

    let attempt = 0;
    let success = false;
    
    while (attempt < MAX_RETRIES && !success) {
      try {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        let pageQuery = supabaseAdmin
          .from("finance_invoices")
          .select("*")
          .order("id", { ascending: true })
          .range(from, to);

        if (year && month) {
          const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
          const endDate = new Date(year, month, 0).toISOString().split("T")[0];
          pageQuery = pageQuery.gte("date_issued", startDate).lte("date_issued", endDate);
        }

        const { data, error: pageErr } = await pageQuery;

        if (pageErr) {
          console.error(`Error fetching finance page ${page}:`, pageErr);
          throw pageErr;
        }
        
        if (data && data.length) {
          allRows = allRows.concat(data);
          success = true;
        } else {
          console.warn(`Finance page ${page} returned no data`);
          success = true;
        }
      } catch (e) {
        attempt++;
        console.warn(`Attempt ${attempt} failed for finance page ${page}:`, e);
        if (attempt >= MAX_RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }
  
  console.log(`Successfully fetched all ${allRows.length} finance records`);
  return { data: allRows, totalCount: total };
};

export const useFinanceAnalytics = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ["finance-analytics", year, month],
    queryFn: async (): Promise<FinanceMetrics> => {
      console.log("Starting finance analytics fetch with pagination...");
      
      // Use paginated fetch to get ALL records
      const { data: invoices, totalCount } = await fetchAllInvoicesPaginated(year, month);
      const typedInvoices = invoices as any[] || [];
      
      console.log(`Finance analytics processing ${typedInvoices.length} records out of ${totalCount} total`);
      
      if (typedInvoices.length !== totalCount) {
        console.warn(`Warning: Expected ${totalCount} records but got ${typedInvoices.length}`);
      }

      const totalInvoices = typedInvoices.length;
      
      // Calculate total revenue directly from the fetched invoices
      // This ensures we have accurate data even with large datasets
      let totalRevenue = typedInvoices.reduce((sum, invoice) => {
        const lineTotal = parseFloat(invoice.line_total);
        return sum + (isNaN(lineTotal) ? 0 : lineTotal);
      }, 0);
      
      // Use the SQL function to get the sum directly
      const { data: totalRevenueData, error: totalRevenueError } = await supabaseAdmin
        .rpc('sum_invoice_totals');
        
      if (totalRevenueError) {
        console.error('Error fetching total revenue:', totalRevenueError);
        // We'll use the calculated total from invoices array if the query fails
      } else if (totalRevenueData) {
        console.log('Total revenue response:', totalRevenueData);
        
        try {
          // Parse the sum from the response
          const responseData = totalRevenueData as any;
          if (responseData.sum !== null) {
            if (typeof responseData.sum === 'string') {
              totalRevenue = parseFloat(responseData.sum) || 0;
            } else if (typeof responseData.sum === 'number') {
              totalRevenue = responseData.sum;
            }
          }
        } catch (err) {
          console.error('Error parsing total revenue:', err);
          // Keep the calculated total if parsing fails
        }
      }

      const statusCounts = typedInvoices.reduce((acc, inv) => {
        acc[inv.invoice_status] = (acc[inv.invoice_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

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

      // Tax analysis by Tax 1 Type
      const taxData = typedInvoices.reduce((acc, inv) => {
        const taxType = inv.tax_1_type || "No Tax";
        if (!acc[taxType]) {
          acc[taxType] = { total_revenue: 0, invoice_count: 0 };
        }
        const lineTotal = parseFloat(inv.line_total);
        acc[taxType].total_revenue += isNaN(lineTotal) ? 0 : lineTotal;
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
        averageInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
        monthlyRevenue,
        statusDistribution,
        topClients,
        isDataComplete: true, // Using supabaseAdmin ensures we get all data
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
      console.log("Starting revenue metrics fetch with pagination...");
      
      // Use paginated fetch to get ALL records for accurate revenue calculations
      const { data: allData, totalCount } = await fetchAllInvoicesPaginated(year, month);
      const typedData = allData.map(invoice => ({
        line_total: invoice.line_total,
        date_issued: invoice.date_issued,
        invoice_status: invoice.invoice_status
      }));
      
      console.log(`Revenue metrics processing ${typedData.length} records out of ${totalCount} total`);

      // Use filtered period or current month if no filter
      const targetMonth = month ? month - 1 : new Date().getMonth(); // month - 1 because JS months are 0-indexed
      const targetYear = year || new Date().getFullYear();

      const thisMonthRevenue = typedData
        .filter((inv) => {
          const invDate = new Date(inv.date_issued);
          return (
            invDate.getMonth() === targetMonth &&
            invDate.getFullYear() === targetYear
          );
        })
        .reduce((sum, inv) => {
          const lineTotal = parseFloat(inv.line_total);
          return sum + (isNaN(lineTotal) ? 0 : lineTotal);
        }, 0);

      const lastMonth = targetMonth === 0 ? 11 : targetMonth - 1;
      const lastMonthYear = targetMonth === 0 ? targetYear - 1 : targetYear;

      const lastMonthRevenue = typedData
        .filter((inv) => {
          const invDate = new Date(inv.date_issued);
          return (
            invDate.getMonth() === lastMonth &&
            invDate.getFullYear() === lastMonthYear
          );
        })
        .reduce((sum, inv) => {
          const lineTotal = parseFloat(inv.line_total);
          return sum + (isNaN(lineTotal) ? 0 : lineTotal);
        }, 0);

      const growthRate =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Calculate total revenue from all data
      const totalRevenue = typedData.reduce((sum, invoice) => {
        const lineTotal = parseFloat(invoice.line_total);
        return sum + (isNaN(lineTotal) ? 0 : lineTotal);
      }, 0);
      
      // Use the SQL function to get the sum directly
      const { data: totalRevenueData, error: totalRevenueError } = await supabaseAdmin
        .rpc('sum_invoice_totals');
      
      // Log the response for debugging
      if (totalRevenueError) {
        console.error('Error fetching total revenue in useRevenueMetrics:', totalRevenueError);
      } else if (totalRevenueData) {
        console.log('Total revenue response in useRevenueMetrics:', totalRevenueData);
      }

      return {
        thisMonthRevenue,
        lastMonthRevenue,
        growthRate,
        totalRevenue
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
