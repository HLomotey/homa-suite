import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase/client';
import {
  FinanceExpense,
  FrontendFinanceExpense,
  mapDatabaseFinanceExpenseToFrontend,
} from '@/integration/supabase/types/finance';

const QUERY_KEY = ['finance-expenses'];

export function useFinanceExpenses() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<FrontendFinanceExpense[]> => {
      // First get the count to determine if we need pagination
      const { count } = await supabase
        .from('finance_expenses' as any)
        .select('*', { count: 'exact', head: true });

      // If we have more than 1000 records, we need to fetch all pages
      if (count && count > 1000) {
        const allData: any[] = [];
        let from = 0;
        const pageSize = 1000;
        
        while (from < count) {
          const { data: pageData, error: pageError } = await supabase
            .from('finance_expenses' as any)
            .select('*')
            .order('date', { ascending: false })
            .range(from, from + pageSize - 1);
            
          if (pageError) throw pageError;
          if (pageData) allData.push(...pageData);
          from += pageSize;
        }
        
        const rows = allData as unknown as FinanceExpense[];
        return rows.map(mapDatabaseFinanceExpenseToFrontend);
      } else {
        // For smaller datasets, fetch normally
        const { data, error } = await supabase
          .from('finance_expenses' as any)
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching finance expenses:', error);
          throw new Error(error.message || 'Failed to fetch finance expenses');
        }

        const rows = (data || []) as unknown as FinanceExpense[];
        return rows.map(mapDatabaseFinanceExpenseToFrontend);
      }
    },
  });
}

export function useDeleteFinanceExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('finance_expenses' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting finance expense:', error);
        throw new Error(error.message || 'Failed to delete finance expense');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
