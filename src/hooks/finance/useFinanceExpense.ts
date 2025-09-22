/**
 * Finance Expense hooks for managing expense data
 * Provides React Query hooks for CRUD operations on finance expenses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integration/supabase/client';
import {
  FinanceExpense,
  FrontendFinanceExpense,
  mapDatabaseFinanceExpenseToFrontend,
  mapFrontendFinanceExpenseToDatabase
} from '../../integration/supabase/types/finance';
import { toast } from 'sonner';

// Query Keys
const QUERY_KEYS = {
  EXPENSES: 'finance-expenses',
  EXPENSE: 'finance-expense',
  EXPENSES_BY_COMPANY: 'finance-expenses-by-company',
  EXPENSES_BY_CATEGORY: 'finance-expenses-by-category',
  EXPENSES_BY_DATE_RANGE: 'finance-expenses-by-date-range'
} as const;

/**
 * API Functions
 */

/**
 * Fetch all finance expenses (no limit to ensure all data is retrieved)
 */
export const fetchFinanceExpenses = async (): Promise<FrontendFinanceExpense[]> => {
  let allData: any[] = [];
  let from = 0;
  const limit = 1000; // Supabase's default limit
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('finance_expenses')
      .select('*')
      .order('date', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      console.error('Error fetching finance expenses:', error);
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += limit;
      hasMore = data.length === limit; // Continue if we got a full batch
    } else {
      hasMore = false;
    }
  }

  return allData?.map(mapDatabaseFinanceExpenseToFrontend) || [];
};

/**
 * Fetch finance expense by ID
 */
export const fetchFinanceExpenseById = async (id: string): Promise<FrontendFinanceExpense | null> => {
  const { data, error } = await supabase
    .from('finance_expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching finance expense:', error);
    throw new Error(error.message);
  }

  return data ? mapDatabaseFinanceExpenseToFrontend(data) : null;
};

/**
 * Create new finance expense
 */
export const createFinanceExpense = async (
  expense: Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FrontendFinanceExpense> => {
  const dbExpense = mapFrontendFinanceExpenseToDatabase(expense);
  
  // @ts-ignore - Bypassing Supabase type inference issues
  const { data, error } = await supabase
    .from('finance_expenses')
    .insert(dbExpense as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating finance expense:', error);
    throw new Error(error.message);
  }

  return mapDatabaseFinanceExpenseToFrontend(data);
};

/**
 * Update finance expense
 */
export const updateFinanceExpense = async (
  id: string,
  expense: Partial<Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<FrontendFinanceExpense> => {
  const dbExpense = mapFrontendFinanceExpenseToDatabase(expense as any);
  
  // @ts-ignore - Bypassing Supabase type inference issues
  const { data, error } = await (supabase as any)
    .from('finance_expenses')
    .update(dbExpense)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating finance expense:', error);
    throw new Error(error.message);
  }

  return mapDatabaseFinanceExpenseToFrontend(data);
};

/**
 * Delete finance expense
 */
export const deleteFinanceExpense = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('finance_expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting finance expense:', error);
    throw new Error(error.message);
  }
};

/**
 * Bulk create finance expenses (for Excel upload)
 */
export const bulkCreateFinanceExpenses = async (
  expenses: Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<FrontendFinanceExpense[]> => {
  const dbExpenses = expenses.map(mapFrontendFinanceExpenseToDatabase);
  
  // @ts-ignore - Bypassing Supabase type inference issues
  const { data, error } = await supabase
    .from('finance_expenses')
    .insert(dbExpenses as any)
    .select();

  if (error) {
    console.error('Error bulk creating finance expenses:', error);
    throw new Error(error.message);
  }

  return data?.map(mapDatabaseFinanceExpenseToFrontend) || [];
};

/**
 * Fetch expenses by company
 */
export const fetchFinanceExpensesByCompany = async (company: string): Promise<FrontendFinanceExpense[]> => {
  const { data, error } = await supabase
    .from('finance_expenses')
    .select('*')
    .eq('company', company)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching finance expenses by company:', error);
    throw new Error(error.message);
  }

  return data?.map(mapDatabaseFinanceExpenseToFrontend) || [];
};

/**
 * Fetch expenses by category
 */
export const fetchFinanceExpensesByCategory = async (category: string): Promise<FrontendFinanceExpense[]> => {
  const { data, error } = await supabase
    .from('finance_expenses')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching finance expenses by category:', error);
    throw new Error(error.message);
  }

  return data?.map(mapDatabaseFinanceExpenseToFrontend) || [];
};

/**
 * Fetch expenses by date range
 */
export const fetchFinanceExpensesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<FrontendFinanceExpense[]> => {
  const { data, error } = await supabase
    .from('finance_expenses')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching finance expenses by date range:', error);
    throw new Error(error.message);
  }

  return data?.map(mapDatabaseFinanceExpenseToFrontend) || [];
};

/**
 * React Query Hooks
 */

/**
 * Hook to fetch all finance expenses
 */
export const useFinanceExpenses = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENSES],
    queryFn: fetchFinanceExpenses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch finance expense by ID
 */
export const useFinanceExpense = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENSE, id],
    queryFn: () => fetchFinanceExpenseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create finance expense
 */
export const useCreateFinanceExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFinanceExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES] });
      toast.success('Finance expense created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating finance expense:', error);
      toast.error(`Failed to create finance expense: ${error.message}`);
    },
  });
};

/**
 * Hook to update finance expense
 */
export const useUpdateFinanceExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, expense }: { 
      id: string; 
      expense: Partial<Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'>> 
    }) => updateFinanceExpense(id, expense),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSE, data.id] });
      toast.success('Finance expense updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating finance expense:', error);
      toast.error(`Failed to update finance expense: ${error.message}`);
    },
  });
};

/**
 * Hook to delete finance expense
 */
export const useDeleteFinanceExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFinanceExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES] });
      toast.success('Finance expense deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting finance expense:', error);
      toast.error(`Failed to delete finance expense: ${error.message}`);
    },
  });
};

/**
 * Hook to bulk create finance expenses
 */
export const useBulkCreateFinanceExpenses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateFinanceExpenses,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES] });
      toast.success(`Successfully uploaded ${data.length} finance expenses`);
    },
    onError: (error: Error) => {
      console.error('Error bulk creating finance expenses:', error);
      toast.error(`Failed to upload finance expenses: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch expenses by company
 */
export const useFinanceExpensesByCompany = (company: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENSES_BY_COMPANY, company],
    queryFn: () => fetchFinanceExpensesByCompany(company),
    enabled: !!company,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch expenses by category
 */
export const useFinanceExpensesByCategory = (category: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENSES_BY_CATEGORY, category],
    queryFn: () => fetchFinanceExpensesByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch expenses by date range
 */
export const useFinanceExpensesByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENSES_BY_DATE_RANGE, startDate, endDate],
    queryFn: () => fetchFinanceExpensesByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
