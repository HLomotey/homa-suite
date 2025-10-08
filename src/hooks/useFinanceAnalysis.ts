import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { CompanyAccount } from '@/components/finance/CompanyAccountFilter';
import { DateRange } from '@/components/finance/DateRangeFilter';
import { PnLData } from '@/components/finance/PnLAnalysis';

export interface FinanceAnalysisFilters {
  companyAccountId: number | null;
  dateRange: DateRange;
}

export function useFinanceAnalysis(filters: FinanceAnalysisFilters) {
  const [loading, setLoading] = useState(false);
  const [companyAccounts, setCompanyAccounts] = useState<CompanyAccount[]>([]);
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch company accounts
  useEffect(() => {
    const fetchCompanyAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from('company_accounts')
          .select('id, name')
          .order('id');

        if (error) throw error;
        setCompanyAccounts(data || []);
      } catch (err) {
        console.error('Error fetching company accounts:', err);
        setError('Failed to load company accounts');
      }
    };

    fetchCompanyAccounts();
  }, []);

  // Fetch financial data based on filters
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!filters.dateRange.from || !filters.dateRange.to) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Format dates for SQL queries
        const fromDate = filters.dateRange.from.toISOString().split('T')[0];
        const toDate = filters.dateRange.to.toISOString().split('T')[0];

        // Get company name for filtering expenses
        let companyName = '';
        if (filters.companyAccountId) {
          const company = companyAccounts.find(c => c.id === filters.companyAccountId);
          companyName = company?.name || '';
        }

        // Fetch invoices (revenue)
        let invoiceQuery = supabase
          .from('finance_invoices')
          .select('*')
          .gte('date_issued', fromDate)
          .lte('date_issued', toDate);

        if (filters.companyAccountId) {
          invoiceQuery = invoiceQuery.eq('company_account_id', filters.companyAccountId);
        }

        const { data: invoices, error: invoiceError } = await invoiceQuery;
        if (invoiceError) throw invoiceError;

        // Fetch expenses
        let expenseQuery = supabase
          .from('finance_expenses')
          .select('*')
          .gte('"Date"', fromDate)
          .lte('"Date"', toDate);

        if (filters.companyAccountId && companyName) {
          expenseQuery = expenseQuery.eq('"Company"', companyName);
        }

        const { data: expenses, error: expenseError } = await expenseQuery;
        if (expenseError) throw expenseError;

        // Calculate P&L data with type assertions
        const totalRevenue = (invoices || []).reduce((sum, invoice: any) => sum + (Number(invoice.line_total) || 0), 0);
        const totalExpenses = (expenses || []).reduce((sum, expense: any) => sum + (Number(expense.Total) || 0), 0);
        const netIncome = totalRevenue - totalExpenses;
        const grossMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100) : 0;

        // Group revenue by client
        const revenueByClient = (invoices || []).reduce((acc: Record<string, number>, invoice: any) => {
          const client = invoice.client_name || 'Unknown Client';
          acc[client] = (acc[client] || 0) + (Number(invoice.line_total) || 0);
          return acc;
        }, {});

        const revenueByClientArray = Object.entries(revenueByClient)
          .map(([client, amount]) => ({
            client,
            amount: Number(amount),
            percentage: totalRevenue > 0 ? (Number(amount) / totalRevenue) * 100 : 0
          }))
          .sort((a, b) => b.amount - a.amount);

        // Group expenses by category
        const expensesByCategory = (expenses || []).reduce((acc: Record<string, number>, expense: any) => {
          const category = expense.Category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + (Number(expense.Total) || 0);
          return acc;
        }, {});

        const expensesByCategoryArray = Object.entries(expensesByCategory)
          .map(([category, amount]) => ({
            category,
            amount: Number(amount),
            percentage: totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0
          }))
          .sort((a, b) => b.amount - a.amount);

        // Calculate monthly trend
        const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

        (invoices || []).forEach((invoice: any) => {
          const month = new Date(invoice.date_issued).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
          monthlyData[month].revenue += Number(invoice.line_total) || 0;
        });

        (expenses || []).forEach((expense: any) => {
          const month = new Date(expense.Date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
          monthlyData[month].expenses += Number(expense.Total) || 0;
        });

        const monthlyTrend = Object.entries(monthlyData)
          .map(([month, data]) => ({
            month,
            revenue: data.revenue,
            expenses: data.expenses,
            netIncome: data.revenue - data.expenses
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        const pnlData: PnLData = {
          totalRevenue,
          totalExpenses,
          netIncome,
          grossMargin,
          revenueByClient: revenueByClientArray,
          expensesByCategory: expensesByCategoryArray,
          monthlyTrend
        };

        setPnlData(pnlData);
      } catch (err) {
        console.error('useFinanceAnalysis: Error fetching financial data:', err);
        setError('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [filters.companyAccountId, filters.dateRange.from, filters.dateRange.to, companyAccounts]);

  return {
    loading,
    companyAccounts,
    pnlData,
    error
  };
}
