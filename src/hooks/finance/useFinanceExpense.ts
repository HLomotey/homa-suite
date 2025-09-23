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
