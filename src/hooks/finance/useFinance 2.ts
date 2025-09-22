/**
 * Finance hooks for Supabase integration
 * These hooks provide data fetching and state management for finance data
 */

import { useState, useEffect, useCallback } from "react";
import {
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
  BudgetStatus
} from "../../integration/supabase/types";
import * as financeApi from "./api";

/**
 * Hook for fetching all transactions
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<FrontendTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchTransactions();
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single transaction by ID
 * @param id Transaction ID
 * @returns Object containing transaction data, loading state, error state, and refetch function
 */
export const useTransaction = (id: string) => {
  const [transaction, setTransaction] = useState<FrontendTransaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchTransactionById(id);
      setTransaction(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transaction, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new transaction
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdTransaction, setCreatedTransaction] = useState<FrontendTransaction | null>(null);

  const create = useCallback(
    async (transactionData: Omit<FrontendTransaction, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await financeApi.createTransaction(transactionData);
        setCreatedTransaction(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdTransaction };
};

/**
 * Hook for updating a transaction
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedTransaction, setUpdatedTransaction] = useState<FrontendTransaction | null>(null);

  const update = useCallback(
    async (
      id: string,
      transactionData: Partial<Omit<FrontendTransaction, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await financeApi.updateTransaction(id, transactionData);
        setUpdatedTransaction(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedTransaction };
};

/**
 * Hook for deleting a transaction
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await financeApi.deleteTransaction(id);
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteTransaction, loading, error, isDeleted };
};

/**
 * Hook for fetching transactions by type
 * @param type Transaction type to filter by
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useTransactionsByType = (type: TransactionType) => {
  const [transactions, setTransactions] = useState<FrontendTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchTransactionsByType(type);
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching transactions by status
 * @param status Transaction status to filter by
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useTransactionsByStatus = (status: TransactionStatus) => {
  const [transactions, setTransactions] = useState<FrontendTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchTransactionsByStatus(status);
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching all budgets
 * @returns Object containing budgets data, loading state, error state, and refetch function
 */
export const useBudgets = () => {
  const [budgets, setBudgets] = useState<FrontendBudget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchBudgets();
      setBudgets(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { budgets, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single budget by ID
 * @param id Budget ID
 * @returns Object containing budget data, loading state, error state, and refetch function
 */
export const useBudget = (id: number) => {
  const [budget, setBudget] = useState<FrontendBudget | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchBudgetById(id);
      setBudget(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { budget, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching budgets by status
 * @param status Budget status to filter by
 * @returns Object containing budgets data, loading state, error state, and refetch function
 */
export const useBudgetsByStatus = (status: BudgetStatus) => {
  const [budgets, setBudgets] = useState<FrontendBudget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchBudgetsByStatus(status);
      setBudgets(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { budgets, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching revenue metrics
 * @returns Object containing revenue metrics data, loading state, error state, and refetch function
 */
export const useRevenueMetrics = () => {
  const [revenueMetrics, setRevenueMetrics] = useState<FrontendRevenueMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchRevenueMetrics();
      setRevenueMetrics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { revenueMetrics, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching expense categories
 * @returns Object containing expense categories data, loading state, error state, and refetch function
 */
export const useExpenseCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState<FrontendExpenseCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchExpenseCategories();
      setExpenseCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { expenseCategories, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching client revenue data
 * @returns Object containing client revenue data, loading state, error state, and refetch function
 */
export const useClientRevenue = () => {
  const [clientRevenue, setClientRevenue] = useState<FrontendClientRevenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchClientRevenue();
      setClientRevenue(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { clientRevenue, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching financial metrics
 * @returns Object containing financial metrics data, loading state, error state, and refetch function
 */
export const useFinancialMetrics = () => {
  const [financialMetrics, setFinancialMetrics] = useState<FrontendFinancialMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchFinancialMetrics();
      setFinancialMetrics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { financialMetrics, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching cash flow data
 * @returns Object containing cash flow data, loading state, error state, and refetch function
 */
export const useCashFlow = () => {
  const [cashFlow, setCashFlow] = useState<FrontendCashFlow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchCashFlow();
      setCashFlow(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { cashFlow, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching revenue profit data
 * @returns Object containing revenue profit data, loading state, error state, and refetch function
 */
export const useRevenueProfitData = () => {
  const [revenueProfitData, setRevenueProfitData] = useState<FrontendRevenueProfitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.fetchRevenueProfitData();
      setRevenueProfitData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { revenueProfitData, loading, error, refetch: fetchData };
};
