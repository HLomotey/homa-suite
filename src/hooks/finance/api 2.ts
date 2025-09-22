/**
 * Finance API functions for Supabase integration
 * These functions handle direct communication with Supabase for finance data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Transaction,
  Budget,
  RevenueMetric,
  ExpenseCategory,
  ClientRevenue,
  FinancialMetric,
  CashFlow,
  RevenueProfitData,
  FrontendTransaction,
  FrontendBudget,
  FrontendRevenueMetric,
  FrontendExpenseCategory,
  FrontendClientRevenue,
  FrontendFinancialMetric,
  FrontendCashFlow,
  FrontendRevenueProfitData,
  TransactionType,
  TransactionStatus,
  BudgetStatus,
  mapDatabaseTransactionToFrontend,
  mapDatabaseBudgetToFrontend,
  mapDatabaseRevenueMetricToFrontend,
  mapDatabaseExpenseCategoryToFrontend,
  mapDatabaseClientRevenueToFrontend,
  mapDatabaseFinancialMetricToFrontend,
  mapDatabaseCashFlowToFrontend,
  mapDatabaseRevenueProfitDataToFrontend
} from "../../integration/supabase/types";

/**
 * Fetch all transactions from Supabase
 * @returns Promise with array of transactions
 */
export const fetchTransactions = async (): Promise<FrontendTransaction[]> => {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error(error.message);
  }

  return (data as Transaction[]).map(mapDatabaseTransactionToFrontend);
};

/**
 * Fetch a single transaction by ID
 * @param id Transaction ID
 * @returns Promise with transaction data
 */
export const fetchTransactionById = async (
  id: string
): Promise<FrontendTransaction> => {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching transaction with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseTransactionToFrontend(data as Transaction);
};

/**
 * Create a new transaction
 * @param transaction Transaction data to create
 * @returns Promise with created transaction data
 */
export const createTransaction = async (
  transaction: Omit<FrontendTransaction, "id">
): Promise<FrontendTransaction> => {
  // Convert frontend transaction to database format
  const dbTransaction = {
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    status: transaction.status,
    category: transaction.category || null,
    client_id: transaction.clientId || null,
    department_id: transaction.departmentId || null
  };

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert(dbTransaction)
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    throw new Error(error.message);
  }

  return mapDatabaseTransactionToFrontend(data as Transaction);
};

/**
 * Update an existing transaction
 * @param id Transaction ID
 * @param transaction Transaction data to update
 * @returns Promise with updated transaction data
 */
export const updateTransaction = async (
  id: string,
  transaction: Partial<Omit<FrontendTransaction, "id">>
): Promise<FrontendTransaction> => {
  // Convert frontend transaction to database format
  const dbTransaction: any = {};
  
  if (transaction.date !== undefined) dbTransaction.date = transaction.date;
  if (transaction.description !== undefined) dbTransaction.description = transaction.description;
  if (transaction.amount !== undefined) dbTransaction.amount = transaction.amount;
  if (transaction.type !== undefined) dbTransaction.type = transaction.type;
  if (transaction.status !== undefined) dbTransaction.status = transaction.status;
  if (transaction.category !== undefined) dbTransaction.category = transaction.category || null;
  if (transaction.clientId !== undefined) dbTransaction.client_id = transaction.clientId || null;
  if (transaction.departmentId !== undefined) dbTransaction.department_id = transaction.departmentId || null;

  const { data, error } = await supabase
    .from("finance_transactions")
    .update(dbTransaction)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating transaction with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseTransactionToFrontend(data as Transaction);
};

/**
 * Delete a transaction
 * @param id Transaction ID
 * @returns Promise with success status
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("finance_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting transaction with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch transactions by type
 * @param type Transaction type to filter by
 * @returns Promise with array of transactions
 */
export const fetchTransactionsByType = async (
  type: TransactionType
): Promise<FrontendTransaction[]> => {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("type", type)
    .order("date", { ascending: false });

  if (error) {
    console.error(`Error fetching transactions with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as Transaction[]).map(mapDatabaseTransactionToFrontend);
};

/**
 * Fetch transactions by status
 * @param status Transaction status to filter by
 * @returns Promise with array of transactions
 */
export const fetchTransactionsByStatus = async (
  status: TransactionStatus
): Promise<FrontendTransaction[]> => {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("status", status)
    .order("date", { ascending: false });

  if (error) {
    console.error(`Error fetching transactions with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Transaction[]).map(mapDatabaseTransactionToFrontend);
};

/**
 * Fetch all budgets from Supabase
 * @returns Promise with array of budgets
 */
export const fetchBudgets = async (): Promise<FrontendBudget[]> => {
  const { data, error } = await supabase
    .from("finance_budgets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching budgets:", error);
    throw new Error(error.message);
  }

  return (data as Budget[]).map(mapDatabaseBudgetToFrontend);
};

/**
 * Fetch a single budget by ID
 * @param id Budget ID
 * @returns Promise with budget data
 */
export const fetchBudgetById = async (
  id: number
): Promise<FrontendBudget> => {
  const { data, error } = await supabase
    .from("finance_budgets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching budget with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseBudgetToFrontend(data as Budget);
};

/**
 * Fetch budgets by status
 * @param status Budget status to filter by
 * @returns Promise with array of budgets
 */
export const fetchBudgetsByStatus = async (
  status: BudgetStatus
): Promise<FrontendBudget[]> => {
  const { data, error } = await supabase
    .from("finance_budgets")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching budgets with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Budget[]).map(mapDatabaseBudgetToFrontend);
};

/**
 * Fetch revenue metrics
 * @returns Promise with array of revenue metrics
 */
export const fetchRevenueMetrics = async (): Promise<FrontendRevenueMetric[]> => {
  const { data, error } = await supabase
    .from("finance_revenue_metrics")
    .select("*")
    .order("month", { ascending: false });

  if (error) {
    console.error("Error fetching revenue metrics:", error);
    throw new Error(error.message);
  }

  return (data as RevenueMetric[]).map(mapDatabaseRevenueMetricToFrontend);
};

/**
 * Fetch expense categories
 * @returns Promise with array of expense categories
 */
export const fetchExpenseCategories = async (): Promise<FrontendExpenseCategory[]> => {
  const { data, error } = await supabase
    .from("finance_expense_categories")
    .select("*")
    .order("amount", { ascending: false });

  if (error) {
    console.error("Error fetching expense categories:", error);
    throw new Error(error.message);
  }

  return (data as ExpenseCategory[]).map(mapDatabaseExpenseCategoryToFrontend);
};

/**
 * Fetch client revenue data
 * @returns Promise with array of client revenue data
 */
export const fetchClientRevenue = async (): Promise<FrontendClientRevenue[]> => {
  const { data, error } = await supabase
    .from("finance_client_revenue")
    .select("*")
    .order("revenue", { ascending: false });

  if (error) {
    console.error("Error fetching client revenue:", error);
    throw new Error(error.message);
  }

  return (data as ClientRevenue[]).map(mapDatabaseClientRevenueToFrontend);
};

/**
 * Fetch financial metrics
 * @returns Promise with array of financial metrics
 */
export const fetchFinancialMetrics = async (): Promise<FrontendFinancialMetric[]> => {
  const { data, error } = await supabase
    .from("finance_metrics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching financial metrics:", error);
    throw new Error(error.message);
  }

  return (data as FinancialMetric[]).map(mapDatabaseFinancialMetricToFrontend);
};

/**
 * Fetch cash flow data
 * @returns Promise with array of cash flow data
 */
export const fetchCashFlow = async (): Promise<FrontendCashFlow[]> => {
  const { data, error } = await supabase
    .from("finance_cash_flow")
    .select("*")
    .order("week", { ascending: true });

  if (error) {
    console.error("Error fetching cash flow data:", error);
    throw new Error(error.message);
  }

  return (data as CashFlow[]).map(mapDatabaseCashFlowToFrontend);
};

/**
 * Fetch revenue profit data
 * @returns Promise with array of revenue profit data
 */
export const fetchRevenueProfitData = async (): Promise<FrontendRevenueProfitData[]> => {
  const { data, error } = await supabase
    .from("finance_revenue_profit")
    .select("*")
    .order("month", { ascending: true });

  if (error) {
    console.error("Error fetching revenue profit data:", error);
    throw new Error(error.message);
  }

  return (data as RevenueProfitData[]).map(mapDatabaseRevenueProfitDataToFrontend);
};
