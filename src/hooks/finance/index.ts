/**
 * Finance module index file
 * Exports all finance-related API functions and hooks
 */

// Re-export API functions
export {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchTransactionsByType,
  fetchTransactionsByStatus,
  fetchBudgets,
  fetchBudgetById,
  fetchBudgetsByStatus,
  fetchRevenueMetrics,
  fetchExpenseCategories,
  fetchClientRevenue,
  fetchFinancialMetrics,
  fetchCashFlow,
  fetchRevenueProfitData
} from './api';

// Re-export hooks
export {
  useTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useTransactionsByType,
  useTransactionsByStatus,
  useBudgets,
  useBudget,
  useBudgetsByStatus,
  useRevenueMetrics,
  useExpenseCategories,
  useClientRevenue,
  useFinancialMetrics,
  useCashFlow,
  useRevenueProfitData
} from './useFinance';
