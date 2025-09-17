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

// Fetch expenditure data from projections table
const fetchExpenseData = async (
  dateRanges?: DateRange[],
  signal?: AbortSignal
): Promise<{ data: any[]; totalCount: number }> => {
  const PAGE_SIZE = 1000;
  
  console.log('fetchExpenseData called with dateRanges:', dateRanges);

  let query = supabaseAdmin
    .from("projections")
    .select(`
      id,
      projection_date,
      status,
      monthly_gross_wages_salaries,
      payroll_taxes,
      admin_cost,
      management_payroll_expenses,
      estimated_other,
      employee_engagement,
      health_insurance_benefits,
      travel,
      other_benefits,
      location_id
    `, { count: "exact" })
    .in('status', ['active', 'draft']);

  // Apply date filters if specified
  if (dateRanges && dateRanges.length > 0) {
    if (dateRanges.length === 1) {
      const range = dateRanges[0];
      const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
      const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
      query = query.gte('projection_date', startDate).lte('projection_date', endDate);
    } else {
      // Multiple date ranges - use OR conditions
      const orConditions = dateRanges.map(range => {
        const startDate = `${range.year}-${range.month.toString().padStart(2, "0")}-01`;
        const endDate = new Date(range.year, range.month, 0).toISOString().split("T")[0];
        return `and(projection_date.gte.${startDate},projection_date.lte.${endDate})`;
      }).join(",");
      query = query.or(orConditions);
    }
  }

  const { data, error, count } = await query
    .order("projection_date", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error("Error fetching expenditure data:", error);
    throw new Error(`Failed to fetch expenditure data: ${error.message}`);
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

        // Calculate total expenses from projections expenditure fields
        const calculateProjectionExpenses = (projection: any) => {
          return (
            (parseFloat(projection.monthly_gross_wages_salaries) || 0) +
            (parseFloat(projection.payroll_taxes) || 0) +
            (parseFloat(projection.admin_cost) || 0) +
            (parseFloat(projection.management_payroll_expenses) || 0) +
            (parseFloat(projection.estimated_other) || 0) +
            (parseFloat(projection.employee_engagement) || 0) +
            (parseFloat(projection.health_insurance_benefits) || 0) +
            (parseFloat(projection.travel) || 0) +
            (parseFloat(projection.other_benefits) || 0)
          );
        };

        const totalExpenses = expenses.reduce((sum, projection) => {
          return sum + calculateProjectionExpenses(projection);
        }, 0);

        // For projections, we consider 'active' as approved and 'draft' as pending
        const approvedExpenses = expenses
          .filter(projection => projection.status === 'active')
          .reduce((sum, projection) => sum + calculateProjectionExpenses(projection), 0);

        const pendingExpenses = expenses
          .filter(projection => projection.status === 'draft')
          .reduce((sum, projection) => sum + calculateProjectionExpenses(projection), 0);

        const rejectedExpenses = 0; // Projections don't have rejected status

        const averageExpenseAmount = expenseCount > 0 ? totalExpenses / expenseCount : 0;

        // Monthly expense aggregation from projections
        const monthlyData = expenses.reduce((acc, projection) => {
          const month = new Date(projection.projection_date).toLocaleDateString("en-US", {
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

          const amount = calculateProjectionExpenses(projection);
          acc[month].amount += amount;
          acc[month].count += 1;

          if (projection.status === 'active') {
            acc[month].approvedAmount += amount;
          } else if (projection.status === 'draft') {
            acc[month].pendingAmount += amount;
          }

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

        // Category analysis from projections expenditure fields
        const categoryData = expenses.reduce((acc, projection) => {
          const month = new Date(projection.projection_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          const categories = {
            'wages_salaries': parseFloat(projection.monthly_gross_wages_salaries) || 0,
            'payroll_taxes': parseFloat(projection.payroll_taxes) || 0,
            'admin_cost': parseFloat(projection.admin_cost) || 0,
            'management_payroll': parseFloat(projection.management_payroll_expenses) || 0,
            'estimated_other': parseFloat(projection.estimated_other) || 0,
            'employee_engagement': parseFloat(projection.employee_engagement) || 0,
            'health_insurance': parseFloat(projection.health_insurance_benefits) || 0,
            'travel': parseFloat(projection.travel) || 0,
            'other_benefits': parseFloat(projection.other_benefits) || 0,
          };

          Object.entries(categories).forEach(([category, amount]) => {
            if (amount > 0) {
              if (!acc[category]) {
                acc[category] = { amount: 0, count: 0, monthlyAmounts: {} };
              }

              acc[category].amount += amount;
              acc[category].count += 1;

              // Track monthly amounts for MoM calculation
              if (!acc[category].monthlyAmounts[month]) {
                acc[category].monthlyAmounts[month] = 0;
              }
              acc[category].monthlyAmounts[month] += amount;
            }
          });

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
              category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              amount: data.amount,
              count: data.count,
              percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
              averageAmount: data.count > 0 ? data.amount / data.count : 0,
              monthOverMonthChange,
            };
          })
          .sort((a, b) => b.amount - a.amount);

        // Department analysis (using location_id as department proxy)
        const departmentData = expenses.reduce((acc, projection) => {
          const department = projection.location_id || 'Unassigned';
          if (!acc[department]) {
            acc[department] = { amount: 0, count: 0 };
          }

          const amount = calculateProjectionExpenses(projection);
          acc[department].amount += amount;
          acc[department].count += 1;

          return acc;
        }, {} as Record<string, { amount: number; count: number }>);

        const expensesByDepartment = Object.entries(departmentData)
          .map(([department, data]) => ({
            department: department === 'Unassigned' ? 'Unassigned' : `Location ${department}`,
            amount: data.amount,
            count: data.count,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
          }))
          .sort((a, b) => b.amount - a.amount);

        // Top expense sources (by projection/location)
        const topPayees = expenses
          .map(projection => ({
            payee: `Projection ${projection.id.slice(0, 8)}`,
            amount: calculateProjectionExpenses(projection),
            count: 1,
            categories: ['Operational Expenses'],
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        // Approval metrics (using projection status)
        const approvedCount = expenses.filter(p => p.status === 'active').length;
        const pendingCount = expenses.filter(p => p.status === 'draft').length;
        const rejectedCount = 0; // Projections don't have rejected status
        const approvalRate = expenseCount > 0 ? (approvedCount / expenseCount) * 100 : 0;

        // For projections, we don't have approval timestamps, so we'll use a default
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