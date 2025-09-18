import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  FrontendMaintenanceHistory,
  mapDatabaseMaintenanceHistoryToFrontend 
} from '@/integration/supabase/types/maintenance';

/**
 * Hook to fetch history for a specific maintenance request
 */
export const useMaintenanceHistory = (requestId: string) => {
  return useQuery({
    queryKey: ['maintenanceHistory', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_history')
        .select(`
          *,
          users:user_id (email, first_name, last_name)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching history for maintenance request ${requestId}:`, error);
        throw error;
      }

      return data.map((item: any) => {
        const history = mapDatabaseMaintenanceHistoryToFrontend(item);
        
        // Add user info
        if (item.users) {
          history.userName = item.users.first_name && item.users.last_name ? 
            `${item.users.first_name} ${item.users.last_name}` : 
            item.users.email;
        }
        
        return history;
      });
    },
    enabled: !!requestId
  });
};
