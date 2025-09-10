import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { useFinanceAnalytics } from "./useFinanceAnalytics";

export interface ExpenditureMetrics {
  totalExpenditure: number;
  projectedExpenditure: number;
  actualExpenditure: number;
  expenditureRate: number; // Percentage of revenue spent
  profitMargin: number;
  totalProfit: number;
  monthlyExpenditure: Array<{
    month: string;
    expenditure: number;
    revenue: number;
    profit: number;
  }>;
  expenditureBreakdown: {
    wages_salaries: number;
    payroll_taxes: number;
    admin_cost: number;
    management_expenses: number;
    health_insurance: number;
    employee_engagement: number;
    travel: number;
    other_benefits: number;
    other: number;
  };
  expenditureByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface DateRange {
  year: number;
  month: number;
}

export function useExpenditureAnalytics(dateRanges?: DateRange[]) {
  // Get revenue data from finance analytics
  const { data: financeData, isLoading: financeLoading } = useFinanceAnalytics(dateRanges);

  return useQuery({
    queryKey: ["expenditure-analytics", dateRanges],
    queryFn: async (): Promise<ExpenditureMetrics> => {
      try {
        console.log("Starting expenditure analytics calculation...");

        // Fetch projection data for expenditure calculations
        const { data: projections, error } = await supabase
          .from("projections")
          .select("*")
          .eq("status", "ACTIVE");

        if (error) {
          console.error("Error fetching projections:", error);
          throw error;
        }

        const activeProjections = projections || [];
        console.log(`Found ${activeProjections.length} active projections`);

        // Calculate baseline expenditure as 80% of revenue
        const totalRevenue = financeData?.totalRevenue || 0;
        const expectedRevenue = financeData?.expectedRevenue || 0;
        const baselineExpenditureRate = 0.80; // 80% baseline

        // Calculate projected expenditure from projections data
        let projectedExpenditure = 0;
        const expenditureBreakdown = {
          wages_salaries: 0,
          payroll_taxes: 0,
          admin_cost: 0,
          management_expenses: 0,
          health_insurance: 0,
          employee_engagement: 0,
          travel: 0,
          other_benefits: 0,
          other: 0,
        };

        activeProjections.forEach((projection: any) => {
          const projectionRevenue = projection.expected_revenue || 0;
          
          // Calculate expenditure components based on projection data or defaults
          const wages = projection.monthly_gross_wages_salaries || (projectionRevenue * 0.68);
          const payrollTaxes = projection.payroll_taxes || (wages * 0.08);
          const adminCost = projection.admin_cost || (wages * 0.10);
          const managementExpenses = projection.management_payroll_expenses || (wages * 0.03);
          const healthInsurance = projection.health_insurance_benefits || (wages * 0.06);
          const employeeEngagement = projection.employee_engagement || (wages * 0.02);
          const travel = projection.travel || (wages * 0.015);
          const otherBenefits = projection.other_benefits || (wages * 0.02);
          const other = projection.estimated_other || 0;

          expenditureBreakdown.wages_salaries += wages;
          expenditureBreakdown.payroll_taxes += payrollTaxes;
          expenditureBreakdown.admin_cost += adminCost;
          expenditureBreakdown.management_expenses += managementExpenses;
          expenditureBreakdown.health_insurance += healthInsurance;
          expenditureBreakdown.employee_engagement += employeeEngagement;
          expenditureBreakdown.travel += travel;
          expenditureBreakdown.other_benefits += otherBenefits;
          expenditureBreakdown.other += other;

          projectedExpenditure += wages + payrollTaxes + adminCost + managementExpenses + 
                                 healthInsurance + employeeEngagement + travel + otherBenefits + other;
        });

        // If no projection data, use 80% baseline
        const actualExpenditure = projectedExpenditure > 0 ? projectedExpenditure : (totalRevenue * baselineExpenditureRate);
        const totalExpenditure = Math.max(actualExpenditure, expectedRevenue * baselineExpenditureRate);

        // Calculate metrics
        const expenditureRate = totalRevenue > 0 ? (actualExpenditure / totalRevenue) * 100 : 80;
        const totalProfit = totalRevenue - actualExpenditure;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 20;

        // Generate monthly expenditure data based on revenue trends
        const monthlyExpenditure = financeData?.monthlyRevenue.map(month => {
          const monthlyExp = month.revenue * (expenditureRate / 100);
          return {
            month: month.month,
            expenditure: monthlyExp,
            revenue: month.revenue,
            profit: month.revenue - monthlyExp
          };
        }) || [];

        // Create expenditure by category
        const totalCategoryExpenditure = Object.values(expenditureBreakdown).reduce((sum, val) => sum + val, 0);
        const expenditureByCategory = [
          {
            category: "Wages & Salaries",
            amount: expenditureBreakdown.wages_salaries,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.wages_salaries / totalCategoryExpenditure) * 100 : 68
          },
          {
            category: "Payroll Taxes",
            amount: expenditureBreakdown.payroll_taxes,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.payroll_taxes / totalCategoryExpenditure) * 100 : 5.4
          },
          {
            category: "Admin Costs",
            amount: expenditureBreakdown.admin_cost,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.admin_cost / totalCategoryExpenditure) * 100 : 6.8
          },
          {
            category: "Health Insurance",
            amount: expenditureBreakdown.health_insurance,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.health_insurance / totalCategoryExpenditure) * 100 : 4.1
          },
          {
            category: "Management",
            amount: expenditureBreakdown.management_expenses,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.management_expenses / totalCategoryExpenditure) * 100 : 2.0
          },
          {
            category: "Employee Engagement",
            amount: expenditureBreakdown.employee_engagement,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.employee_engagement / totalCategoryExpenditure) * 100 : 1.4
          },
          {
            category: "Travel",
            amount: expenditureBreakdown.travel,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.travel / totalCategoryExpenditure) * 100 : 1.0
          },
          {
            category: "Other Benefits",
            amount: expenditureBreakdown.other_benefits,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.other_benefits / totalCategoryExpenditure) * 100 : 1.4
          },
          {
            category: "Other",
            amount: expenditureBreakdown.other,
            percentage: totalCategoryExpenditure > 0 ? (expenditureBreakdown.other / totalCategoryExpenditure) * 100 : 0
          }
        ].filter(category => category.amount > 0 || category.percentage > 0);

        console.log(`Expenditure Analytics: Total Revenue: ${totalRevenue}, Total Expenditure: ${actualExpenditure}, Profit: ${totalProfit}`);

        return {
          totalExpenditure,
          projectedExpenditure,
          actualExpenditure,
          expenditureRate,
          profitMargin,
          totalProfit,
          monthlyExpenditure,
          expenditureBreakdown,
          expenditureByCategory
        };

      } catch (error) {
        console.error('Error in useExpenditureAnalytics:', error);
        // Return safe default values
        return {
          totalExpenditure: 0,
          projectedExpenditure: 0,
          actualExpenditure: 0,
          expenditureRate: 80,
          profitMargin: 20,
          totalProfit: 0,
          monthlyExpenditure: [],
          expenditureBreakdown: {
            wages_salaries: 0,
            payroll_taxes: 0,
            admin_cost: 0,
            management_expenses: 0,
            health_insurance: 0,
            employee_engagement: 0,
            travel: 0,
            other_benefits: 0,
            other: 0,
          },
          expenditureByCategory: []
        };
      }
    },
    enabled: !financeLoading && !!financeData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
