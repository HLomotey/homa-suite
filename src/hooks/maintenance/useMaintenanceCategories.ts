import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  MaintenanceCategory, 
  FrontendMaintenanceCategory,
  mapDatabaseMaintenanceCategoryToFrontend 
} from '@/integration/supabase/types/maintenance';
import { toast } from 'sonner';

/**
 * Hook to fetch all maintenance categories
 */
export const useMaintenanceCategories = () => {
  return useQuery({
    queryKey: ['maintenanceCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching maintenance categories:', error);
        throw error;
      }

      return data.map(mapDatabaseMaintenanceCategoryToFrontend);
    }
  });
};

/**
 * Hook to fetch a single maintenance category by ID
 */
export const useMaintenanceCategory = (id: string) => {
  return useQuery({
    queryKey: ['maintenanceCategories', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching maintenance category with ID ${id}:`, error);
        throw error;
      }

      return mapDatabaseMaintenanceCategoryToFrontend(data);
    },
    enabled: !!id
  });
};

/**
 * Hook to create a new maintenance category
 */
export const useCreateMaintenanceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<FrontendMaintenanceCategory, 'id'>) => {
      const { data, error } = await supabase
        .from('maintenance_categories')
        .insert({
          name: category.name,
          description: category.description,
          icon: category.icon,
          is_active: category.isActive
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance category:', error);
        throw error;
      }

      return mapDatabaseMaintenanceCategoryToFrontend(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceCategories'] });
      toast.success('Maintenance category created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create maintenance category: ${error.message}`);
    }
  });
};

/**
 * Hook to update an existing maintenance category
 */
export const useUpdateMaintenanceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      category 
    }: { 
      id: string, 
      category: Omit<FrontendMaintenanceCategory, 'id'> 
    }) => {
      const { data, error } = await supabase
        .from('maintenance_categories')
        .update({
          name: category.name,
          description: category.description,
          icon: category.icon,
          is_active: category.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating maintenance category with ID ${id}:`, error);
        throw error;
      }

      return mapDatabaseMaintenanceCategoryToFrontend(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceCategories'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceCategories', variables.id] });
      toast.success('Maintenance category updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update maintenance category: ${error.message}`);
    }
  });
};

/**
 * Hook to delete a maintenance category
 */
export const useDeleteMaintenanceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance category with ID ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceCategories'] });
      queryClient.removeQueries({ queryKey: ['maintenanceCategories', id] });
      toast.success('Maintenance category deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete maintenance category: ${error.message}`);
    }
  });
};
