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

// Re-export finance expense API functions
export {
  fetchFinanceExpenses,
  fetchFinanceExpenseById,
  createFinanceExpense,
  updateFinanceExpense,
  deleteFinanceExpense,
  bulkCreateFinanceExpenses,
  fetchFinanceExpensesByCompany,
  fetchFinanceExpensesByCategory,
  fetchFinanceExpensesByDateRange
} from './useFinanceExpense';

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

// Re-export finance expense hooks
export {
  useFinanceExpenses,
  useFinanceExpense,
  useCreateFinanceExpense,
  useUpdateFinanceExpense,
  useDeleteFinanceExpense,
  useBulkCreateFinanceExpenses,
  useFinanceExpensesByCompany,
  useFinanceExpensesByCategory,
  useFinanceExpensesByDateRange
} from './useFinanceExpense';
