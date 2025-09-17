/**
 * Profit & Loss Analytics Hook - Combines revenue, expenses, and projections data
 * Provides comprehensive P&L analysis with trends and forecasting
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseAdmin } from "@/integration/supabase/client";

// Function to invalidate P&L analytics cache
export const invalidateProfitLossCache = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["profit-loss-analytics"] });
  queryClient.invalidateQueries({ queryKey: ["profit-loss-trends"] });
  queryClient.invalidateQueries({ queryKey: ["profit-loss-forecast"] });
};

export interface ProfitLossMetrics {
  currentPeriod: {
    revenue: number;
    expenses: number;
    projectedRevenue: number;
    projectedExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    projectedProfitMargin: number;
  };
  monthlyTrends: Array<{
    period: string;
    revenue: number;
    expenses: number;
    projectedRevenue: number;
    projectedExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    expenseGrowth: number;
  }>;
  yearOverYear: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
    marginImprovement: number;
  };
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    budgetVariance: number;
    projectedAmount: number;
  }>;
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
    growth: number;
  }>;
  keyMetrics: {
    totalRevenue: number;
    totalExpenses: number;
    totalProjectedRevenue: number;
    totalProjectedExpenses: number;
    operatingMargin: number;
    cashFlow: number;
    burnRate: number;
    runway: number; // months
  };
  isDataComplete: boolean;
}

interface DateRange {
  year: number;
  month: number;
}

// Fetch revenue data from finance_invoices
const fetchRevenueData = async (dateRanges?: DateRange[]) => {
  let query = supabaseAdmin
    .from("finance_invoices")
    .select("*");

  // Apply date filters - use date_paid for cash basis accounting
  if (dateRanges && dateRanges.length > 0) {
    if (dateRanges.length === 1) {
      const range = dateRanges[0];
      const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
      const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
      query = query.gte('date_paid', startDate).lte('date_paid', endDate).not('date_paid', 'is', null);
    } else {
      const orConditions = dateRanges.map(range => {
        const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
        const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
        return `and(date_paid.gte.${startDate},date_paid.lte.${endDate},not.date_paid.is.null)`;
      }).join(",");
      query = query.or(orConditions);
    }
  }

  const { data, error } = await query.order('date_paid', { ascending: false });
  
  if (error) {
    console.error("Error fetching revenue data:", error);
    throw error;
  }

  return data || [];
};

// Fetch expense data from finance_expenses table
const fetchExpenseData = async (dateRanges?: DateRange[]) => {
  let query = supabaseAdmin
    .from("finance_expenses")
    .select("*");

  if (dateRanges && dateRanges.length > 0) {
    if (dateRanges.length === 1) {
      const range = dateRanges[0];
      const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
      const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
      query = query.gte('Date', startDate).lte('Date', endDate);
    } else {
      const orConditions = dateRanges.map(range => {
        const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
        const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
        return `and(Date.gte.${startDate},Date.lte.${endDate})`;
      }).join(",");
      query = query.or(orConditions);
    }
  }

  const { data, error } = await query.order('Date', { ascending: false });
  
  if (error) {
    console.error("Error fetching expense data:", error);
    throw error;
  }

  return data || [];
};

// Fetch projection data
const fetchProjectionData = async (dateRanges?: DateRange[]) => {
  let query = supabaseAdmin
    .from("projections")
    .select("*")
    .in('status', ['active', 'draft']); // Only active and draft projections

  if (dateRanges && dateRanges.length > 0) {
    if (dateRanges.length === 1) {
      const range = dateRanges[0];
      const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
      const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
      query = query.gte('projection_date', startDate).lte('projection_date', endDate);
    }
  }

  const { data, error } = await query.order('projection_date', { ascending: false });
  
  if (error) {
    console.error("Error fetching projection data:", error);
    throw error;
  }

  return data || [];
};

// Process P&L data
const processProfitLossData = (
  revenueData: any[], 
  expenseData: any[], 
  projectionData: any[]
): ProfitLossMetrics => {
  
  // Calculate current period totals
  const totalRevenue = revenueData
    .filter(invoice => invoice.invoice_status === 'paid' && invoice.date_paid)
    .reduce((sum, invoice) => sum + (parseFloat(invoice.line_total) || 0), 0);

  const totalExpenses = expenseData.reduce((sum, expense) => {
    return sum + (parseFloat(expense.Total) || 0);
  }, 0);

  const totalProjectedRevenue = projectionData
    .reduce((sum, proj) => sum + (parseFloat(proj.expected_revenue) || 0), 0);

  // Calculate projected expenses from projections (sum of all expenditure fields)
  const totalProjectedExpenses = projectionData.reduce((sum, proj) => {
    const expenses = 
      (parseFloat(proj.monthly_gross_wages_salaries) || 0) +
      (parseFloat(proj.payroll_taxes) || 0) +
      (parseFloat(proj.admin_cost) || 0) +
      (parseFloat(proj.management_payroll_expenses) || 0) +
      (parseFloat(proj.estimated_other) || 0) +
      (parseFloat(proj.employee_engagement) || 0) +
      (parseFloat(proj.health_insurance_benefits) || 0) +
      (parseFloat(proj.travel) || 0) +
      (parseFloat(proj.other_benefits) || 0);
    return sum + expenses;
  }, 0);

  const grossProfit = totalRevenue - totalExpenses;
  const netProfit = grossProfit; // Assuming no other deductions for now
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const projectedProfitMargin = totalProjectedRevenue > 0 
    ? ((totalProjectedRevenue - totalProjectedExpenses) / totalProjectedRevenue) * 100 
    : 0;

  // Monthly trends analysis
  const monthlyRevenueData = revenueData.reduce((acc, invoice) => {
    if (invoice.invoice_status === 'paid' && invoice.date_paid) {
      const month = new Date(invoice.date_paid).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      if (!acc[month]) acc[month] = 0;
      acc[month] += parseFloat(invoice.line_total) || 0;
    }
    return acc;
  }, {} as Record<string, number>);

  const monthlyExpenseData = expenseData.reduce((acc, expense) => {
    const month = new Date(expense.Date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!acc[month]) acc[month] = 0;
    acc[month] += parseFloat(expense.Total) || 0;
    return acc;
  }, {} as Record<string, number>);

  const monthlyProjectedRevenue = projectionData.reduce((acc, proj) => {
    const month = new Date(proj.projection_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!acc[month]) acc[month] = 0;
    acc[month] += parseFloat(proj.expected_revenue) || 0;
    return acc;
  }, {} as Record<string, number>);

  // Combine monthly data
  const allMonths = new Set([
    ...Object.keys(monthlyRevenueData),
    ...Object.keys(monthlyExpenseData),
    ...Object.keys(monthlyProjectedRevenue)
  ]);

  const monthlyTrends = Array.from(allMonths)
    .map(month => {
      const revenue = monthlyRevenueData[month] || 0;
      const expenses = monthlyExpenseData[month] || 0;
      const projectedRevenue = monthlyProjectedRevenue[month] || 0;
      const projectedExpenses = 0; // Would need monthly projection expense breakdown
      const grossProfit = revenue - expenses;
      const netProfit = grossProfit;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return {
        period: month,
        revenue,
        expenses,
        projectedRevenue,
        projectedExpenses,
        grossProfit,
        netProfit,
        profitMargin,
        revenueGrowth: 0, // Would calculate with previous month data
        expenseGrowth: 0, // Would calculate with previous month data
      };
    })
    .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

  // Calculate growth rates
  for (let i = 1; i < monthlyTrends.length; i++) {
    const current = monthlyTrends[i];
    const previous = monthlyTrends[i - 1];
    
    current.revenueGrowth = previous.revenue > 0 
      ? ((current.revenue - previous.revenue) / previous.revenue) * 100 
      : 0;
    
    current.expenseGrowth = previous.expenses > 0 
      ? ((current.expenses - previous.expenses) / previous.expenses) * 100 
      : 0;
  }

  // Expense breakdown by category from finance_expenses
  const expensesByCategory = expenseData.reduce((acc, expense) => {
    const category = expense.Category || 'other';
    if (!acc[category]) acc[category] = 0;
    acc[category] += parseFloat(expense.Total) || 0;
    return acc;
  }, {} as Record<string, number>);

  const expenseBreakdown = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      budgetVariance: 0, // Would need budget data to calculate
      projectedAmount: 0, // Would need projected expense breakdown
    }))
    .sort((a, b) => b.amount - a.amount);

  // Revenue breakdown by client
  const revenueByClient = revenueData
    .filter(invoice => invoice.invoice_status === 'paid' && invoice.date_paid)
    .reduce((acc, invoice) => {
      const client = invoice.client_name || 'Unknown';
      if (!acc[client]) acc[client] = 0;
      acc[client] += parseFloat(invoice.line_total) || 0;
      return acc;
    }, {} as Record<string, number>);

  const revenueBreakdown = Object.entries(revenueByClient)
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
      growth: 0, // Would calculate with historical data
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // Top 10 clients

  // Year-over-year calculations (simplified - would need historical data)
  const yearOverYear = {
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
    marginImprovement: 0,
  };

  // Key metrics
  const operatingMargin = profitMargin; // Simplified
  const cashFlow = netProfit; // Simplified cash flow calculation
  const burnRate = totalExpenses; // Monthly burn rate
  const runway = burnRate > 0 ? totalRevenue / burnRate : 0; // Months of runway

  return {
    currentPeriod: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      projectedRevenue: totalProjectedRevenue,
      projectedExpenses: totalProjectedExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      projectedProfitMargin,
    },
    monthlyTrends,
    yearOverYear,
    expenseBreakdown,
    revenueBreakdown,
    keyMetrics: {
      totalRevenue,
      totalExpenses,
      totalProjectedRevenue,
      totalProjectedExpenses,
      operatingMargin,
      cashFlow,
      burnRate,
      runway,
    },
    isDataComplete: true,
  };
};

export function useProfitLoss(dateRanges?: DateRange[]) {
  return useQuery({
    queryKey: ["profit-loss-analytics", dateRanges],
    queryFn: async (): Promise<ProfitLossMetrics> => {
      try {
        console.log("Starting profit & loss analytics fetch...");

        // Fetch data from all three sources
        const [revenueData, expenseData, projectionData] = await Promise.all([
          fetchRevenueData(dateRanges),
          fetchExpenseData(dateRanges),
          fetchProjectionData(dateRanges),
        ]);

        console.log(`P&L Data: ${revenueData.length} invoices, ${expenseData.length} expenses, ${projectionData.length} projections`);

        const processedData = processProfitLossData(revenueData, expenseData, projectionData);

        console.log(`P&L processed: Revenue $${processedData.currentPeriod.revenue.toFixed(2)}, Expenses $${processedData.currentPeriod.expenses.toFixed(2)}, Profit $${processedData.currentPeriod.netProfit.toFixed(2)}`);

        return processedData;
      } catch (error) {
        console.error('Error in useProfitLoss:', error);
        // Return safe default values
        return {
          currentPeriod: {
            revenue: 0,
            expenses: 0,
            projectedRevenue: 0,
            projectedExpenses: 0,
            grossProfit: 0,
            netProfit: 0,
            profitMargin: 0,
            projectedProfitMargin: 0,
          },
          monthlyTrends: [],
          yearOverYear: {
            revenueGrowth: 0,
            expenseGrowth: 0,
            profitGrowth: 0,
            marginImprovement: 0,
          },
          expenseBreakdown: [],
          revenueBreakdown: [],
          keyMetrics: {
            totalRevenue: 0,
            totalExpenses: 0,
            totalProjectedRevenue: 0,
            totalProjectedExpenses: 0,
            operatingMargin: 0,
            cashFlow: 0,
            burnRate: 0,
            runway: 0,
          },
          isDataComplete: false,
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for P&L comparison between periods
export function useProfitLossComparison(
  currentPeriod?: DateRange[],
  comparisonPeriod?: DateRange[]
) {
  return useQuery({
    queryKey: ["profit-loss-comparison", currentPeriod, comparisonPeriod],
    queryFn: async () => {
      try {
        const [currentData, comparisonData] = await Promise.all([
          Promise.all([
            fetchRevenueData(currentPeriod),
            fetchExpenseData(currentPeriod),
            fetchProjectionData(currentPeriod),
          ]),
          Promise.all([
            fetchRevenueData(comparisonPeriod),
            fetchExpenseData(comparisonPeriod),
            fetchProjectionData(comparisonPeriod),
          ]),
        ]);

        const current = processProfitLossData(...currentData);
        const comparison = processProfitLossData(...comparisonData);

        return {
          current: current.currentPeriod,
          comparison: comparison.currentPeriod,
          changes: {
            revenueChange: comparison.currentPeriod.revenue > 0 
              ? ((current.currentPeriod.revenue - comparison.currentPeriod.revenue) / comparison.currentPeriod.revenue) * 100 
              : 0,
            expenseChange: comparison.currentPeriod.expenses > 0 
              ? ((current.currentPeriod.expenses - comparison.currentPeriod.expenses) / comparison.currentPeriod.expenses) * 100 
              : 0,
            profitChange: comparison.currentPeriod.netProfit !== 0 
              ? ((current.currentPeriod.netProfit - comparison.currentPeriod.netProfit) / Math.abs(comparison.currentPeriod.netProfit)) * 100 
              : 0,
            marginChange: current.currentPeriod.profitMargin - comparison.currentPeriod.profitMargin,
          },
        };
      } catch (error) {
        console.error('Error in useProfitLossComparison:', error);
        return null;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!(currentPeriod && comparisonPeriod),
  });
}