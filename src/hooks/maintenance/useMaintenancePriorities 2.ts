import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  MaintenancePriority, 
  FrontendMaintenancePriority,
  mapDatabaseMaintenancePriorityToFrontend 
} from '@/integration/supabase/types/maintenance';
import { toast } from 'sonner';

/**
 * Hook to fetch all maintenance priorities
 */
export const useMaintenancePriorities = () => {
  return useQuery({
    queryKey: ['maintenancePriorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_priorities')
        .select('*')
        .order('sla_hours');

      if (error) {
        console.error('Error fetching maintenance priorities:', error);
        throw error;
      }

      return data.map(mapDatabaseMaintenancePriorityToFrontend);
    }
  });
};

/**
 * Hook to fetch a single maintenance priority by ID
 */
export const useMaintenancePriority = (id: string) => {
  return useQuery({
    queryKey: ['maintenancePriorities', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_priorities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching maintenance priority with ID ${id}:`, error);
        throw error;
      }

      return mapDatabaseMaintenancePriorityToFrontend(data);
    },
    enabled: !!id
  });
};

/**
 * Hook to create a new maintenance priority
 */
export const useCreateMaintenancePriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (priority: Omit<FrontendMaintenancePriority, 'id'>) => {
      const { data, error } = await supabase
        .from('maintenance_priorities')
        .insert({
          name: priority.name,
          description: priority.description,
          color: priority.color,
          sla_hours: priority.slaHours,
          is_active: priority.isActive
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance priority:', error);
        throw error;
      }

      return mapDatabaseMaintenancePriorityToFrontend(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenancePriorities'] });
      toast.success('Maintenance priority created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create maintenance priority: ${error.message}`);
    }
  });
};

/**
 * Hook to update an existing maintenance priority
 */
export const useUpdateMaintenancePriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      priority 
    }: { 
      id: string, 
      priority: Omit<FrontendMaintenancePriority, 'id'> 
    }) => {
      const { data, error } = await supabase
        .from('maintenance_priorities')
        .update({
          name: priority.name,
          description: priority.description,
          color: priority.color,
          sla_hours: priority.slaHours,
          is_active: priority.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating maintenance priority with ID ${id}:`, error);
        throw error;
      }

      return mapDatabaseMaintenancePriorityToFrontend(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenancePriorities'] });
      queryClient.invalidateQueries({ queryKey: ['maintenancePriorities', variables.id] });
      toast.success('Maintenance priority updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update maintenance priority: ${error.message}`);
    }
  });
};

/**
 * Hook to delete a maintenance priority
 */
export const useDeleteMaintenancePriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_priorities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance priority with ID ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['maintenancePriorities'] });
      queryClient.removeQueries({ queryKey: ['maintenancePriorities', id] });
      toast.success('Maintenance priority deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete maintenance priority: ${error.message}`);
    }
  });
};
