/**
 * Expense Analytics Hook - Fetches and processes expense data from finance_expenses table
 * Provides comprehensive expense analysis, categorization, and trend data
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseAdmin } from "@/integration/supabase/client";

// Function to invalidate expense analytics cache
export const invalidateExpenseCache = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["expense-analytics"] });
  queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
  queryClient.invalidateQueries({ queryKey: ["expense-trends"] });
};

export interface ExpenseMetrics {
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  rejectedExpenses: number;
  expenseCount: number;
  averageExpenseAmount: number;
  monthlyExpenses: Array<{
    month: string;
    amount: number;
    count: number;
    approvedAmount: number;
    pendingAmount: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
    averageAmount: number;
    monthOverMonthChange: number;
  }>;
  expensesByDepartment: Array<{
    department: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  topPayees: Array<{
    payee: string;
    amount: number;
    count: number;
    categories: string[];
  }>;
  approvalMetrics: {
    approvalRate: number;
    avgApprovalTime: number;
    pendingCount: number;
    rejectedCount: number;
  };
  isDataComplete: boolean;
}

interface DateRange {
  year: number;
  month: number;
}

// Fetch expense data from finance_expenses table
const fetchExpenseData = async (
  dateRanges?: DateRange[],
  signal?: AbortSignal
): Promise<{ data: any[]; totalCount: number }> => {
  const PAGE_SIZE = 1000;
  
  console.log('fetchExpenseData called with dateRanges:', dateRanges);

  let query = supabaseAdmin
    .from("finance_expenses")
    .select("*", { count: "exact" });

  // Apply date filters if specified
  if (dateRanges && dateRanges.length > 0) {
    if (dateRanges.length === 1) {
      const range = dateRanges[0];
      const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
      const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
      query = query.gte('Date', startDate).lte('Date', endDate);
    } else {
      // Multiple date ranges - use OR conditions
      const orConditions = dateRanges.map(range => {
        const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
        const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
        return `and(Date.gte.${startDate},Date.lte.${endDate})`;
      }).join(",");
      query = query.or(orConditions);
    }
  }

  const { data, error, count } = await query
    .order("Date", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error("Error fetching expense data:", error);
    throw new Error(`Failed to fetch expense data: ${error.message}`);
  }

  return { 
    data: data || [], 
    totalCount: count || 0 
  };
};

export function useExpenseAnalytics(dateRanges?: DateRange[]) {
  return useQuery({
    queryKey: ["expense-analytics", dateRanges],
    queryFn: async (): Promise<ExpenseMetrics> => {
      try {
        console.log("Starting expense analytics fetch...");

        const result = await fetchExpenseData(dateRanges);
        const expenses = result.data || [];
        const totalCount = result.totalCount;
        const expenseCount = expenses.length;

        console.log(`Processing ${expenseCount} expense records out of ${totalCount} total`);

        // Calculate total expenses from finance_expenses table
        const totalExpenses = expenses.reduce((sum, expense) => {
          const amount = parseFloat(expense.Total) || 0;
          return sum + amount;
        }, 0);

        // All expenses in finance_expenses are considered approved (no approval workflow)
        const approvedExpenses = totalExpenses;
        const pendingExpenses = 0;
        const rejectedExpenses = 0;

        const averageExpenseAmount = expenseCount > 0 ? totalExpenses / expenseCount : 0;

        // Monthly expense aggregation from finance_expenses
        const monthlyData = expenses.reduce((acc, expense) => {
          const month = new Date(expense.Date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!acc[month]) {
            acc[month] = { 
              amount: 0, 
              count: 0, 
              approvedAmount: 0, 
              pendingAmount: 0 
            };
          }

          const amount = parseFloat(expense.Total) || 0;
          acc[month].amount += amount;
          acc[month].count += 1;
          acc[month].approvedAmount += amount; // All expenses are considered approved

          return acc;
        }, {} as Record<string, { amount: number; count: number; approvedAmount: number; pendingAmount: number }>);

        const monthlyExpenses = Object.entries(monthlyData)
          .map(([month, data]) => ({
            month,
            amount: data.amount,
            count: data.count,
            approvedAmount: data.approvedAmount,
            pendingAmount: data.pendingAmount,
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        // Category analysis from finance_expenses
        const categoryData = expenses.reduce((acc, expense) => {
          const category = expense.Category || 'other';
          const month = new Date(expense.Date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!acc[category]) {
            acc[category] = { amount: 0, count: 0, monthlyAmounts: {} };
          }

          const amount = parseFloat(expense.Total) || 0;
          acc[category].amount += amount;
          acc[category].count += 1;

          // Track monthly amounts for MoM calculation
          if (!acc[category].monthlyAmounts[month]) {
            acc[category].monthlyAmounts[month] = 0;
          }
          acc[category].monthlyAmounts[month] += amount;

          return acc;
        }, {} as Record<string, { amount: number; count: number; monthlyAmounts: Record<string, number> }>);

        const expensesByCategory = Object.entries(categoryData)
          .map(([category, data]) => {
            // Calculate month-over-month change
            const monthlyAmounts = Object.values(data.monthlyAmounts);
            const currentMonth = monthlyAmounts[monthlyAmounts.length - 1] || 0;
            const previousMonth = monthlyAmounts[monthlyAmounts.length - 2] || 0;
            const monthOverMonthChange = previousMonth > 0 
              ? ((currentMonth - previousMonth) / previousMonth) * 100 
              : 0;

            return {
              category,
              amount: data.amount,
              count: data.count,
              percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
              averageAmount: data.count > 0 ? data.amount / data.count : 0,
              monthOverMonthChange,
            };
          })
          .sort((a, b) => b.amount - a.amount);

        // Department analysis (using Company as department)
        const departmentData = expenses.reduce((acc, expense) => {
          const department = expense.Company || 'Unassigned';
          if (!acc[department]) {
            acc[department] = { amount: 0, count: 0 };
          }

          const amount = parseFloat(expense.Total) || 0;
          acc[department].amount += amount;
          acc[department].count += 1;

          return acc;
        }, {} as Record<string, { amount: number; count: number }>);

        const expensesByDepartment = Object.entries(departmentData)
          .map(([department, data]) => ({
            department,
            amount: data.amount,
            count: data.count,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
          }))
          .sort((a, b) => b.amount - a.amount);

        // Top payees analysis
        const payeeData = expenses.reduce((acc, expense) => {
          const payee = expense.Payee || 'Unknown';
          if (!acc[payee]) {
            acc[payee] = { amount: 0, count: 0, categories: new Set() };
          }

          const amount = parseFloat(expense.Total) || 0;
          acc[payee].amount += amount;
          acc[payee].count += 1;
          acc[payee].categories.add(expense.Category || 'other');

          return acc;
        }, {} as Record<string, { amount: number; count: number; categories: Set<string> }>);

        const topPayees = Object.entries(payeeData)
          .map(([payee, data]) => ({
            payee,
            amount: data.amount,
            count: data.count,
            categories: Array.from(data.categories),
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        // Approval metrics (all expenses in finance_expenses are considered approved)
        const approvedCount = expenseCount;
        const pendingCount = 0;
        const rejectedCount = 0;
        const approvalRate = 100; // All expenses are approved

        // No approval workflow, so no approval time
        const avgApprovalTime = 0;

        return {
          totalExpenses: isNaN(totalExpenses) ? 0 : totalExpenses,
          approvedExpenses: isNaN(approvedExpenses) ? 0 : approvedExpenses,
          pendingExpenses: isNaN(pendingExpenses) ? 0 : pendingExpenses,
          rejectedExpenses: isNaN(rejectedExpenses) ? 0 : rejectedExpenses,
          expenseCount: expenseCount || 0,
          averageExpenseAmount: isNaN(averageExpenseAmount) ? 0 : averageExpenseAmount,
          monthlyExpenses: monthlyExpenses || [],
          expensesByCategory: expensesByCategory || [],
          expensesByDepartment: expensesByDepartment || [],
          topPayees: topPayees || [],
          approvalMetrics: {
            approvalRate: isNaN(approvalRate) ? 0 : approvalRate,
            avgApprovalTime: isNaN(avgApprovalTime) ? 0 : avgApprovalTime,
            pendingCount: pendingCount || 0,
            rejectedCount: rejectedCount || 0,
          },
          isDataComplete: expenseCount === totalCount,
        };
      } catch (error) {
        console.error('Error in useExpenseAnalytics:', error);
        return {
          totalExpenses: 0,
          approvedExpenses: 0,
          pendingExpenses: 0,
          rejectedExpenses: 0,
          expenseCount: 0,
          averageExpenseAmount: 0,
          monthlyExpenses: [],
          expensesByCategory: [],
          expensesByDepartment: [],
          topPayees: [],
          approvalMetrics: {
            approvalRate: 0,
            avgApprovalTime: 0,
            pendingCount: 0,
            rejectedCount: 0,
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