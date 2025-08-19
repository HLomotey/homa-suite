import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  MaintenanceRequest, 
  FrontendMaintenanceRequest,
  MaintenanceStatus,
  mapDatabaseMaintenanceRequestToFrontend,
  mapFrontendMaintenanceRequestToDatabase
} from '@/integration/supabase/types/maintenance';
import { toast } from 'sonner';

/**
 * Hook to fetch all maintenance requests
 */
export const useMaintenanceRequests = (filters?: {
  propertyId?: string;
  roomId?: string;
  tenantId?: string;
  status?: MaintenanceStatus | MaintenanceStatus[];
  categoryId?: string;
  priorityId?: string;
  assignedTo?: string;
  isEmergency?: boolean;
}) => {
  return useQuery({
    queryKey: ['maintenanceRequests', filters],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties:property_id (title),
          rooms:room_id (name),
          tenants:tenant_id (first_name, last_name),
          maintenance_categories:category_id (name),
          maintenance_priorities:priority_id (name, color),
          users:assigned_to (email)
        `);

      // Apply filters if provided
      if (filters?.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }
      
      if (filters?.roomId) {
        query = query.eq('room_id', filters.roomId);
      }
      
      if (filters?.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }
      
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }
      
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      if (filters?.priorityId) {
        query = query.eq('priority_id', filters.priorityId);
      }
      
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      
      if (filters?.isEmergency !== undefined) {
        query = query.eq('is_emergency', filters.isEmergency);
      }

      // Order by reported date descending (newest first)
      query = query.order('reported_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching maintenance requests:', error);
        throw error;
      }

      return data.map((item: any) => {
        const mappedItem = mapDatabaseMaintenanceRequestToFrontend(item);
        
        // Add related data
        mappedItem.propertyName = item.properties?.title;
        mappedItem.roomName = item.rooms?.name;
        mappedItem.tenantName = item.tenants ? 
          `${item.tenants.first_name} ${item.tenants.last_name}` : 
          undefined;
        mappedItem.categoryName = item.maintenance_categories?.name;
        mappedItem.priorityName = item.maintenance_priorities?.name;
        mappedItem.priorityColor = item.maintenance_priorities?.color;
        mappedItem.assignedToName = item.users?.email;
        
        return mappedItem;
      });
    }
  });
};

/**
 * Hook to fetch a single maintenance request by ID
 */
export const useMaintenanceRequest = (id: string) => {
  return useQuery({
    queryKey: ['maintenanceRequests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties:property_id (title),
          rooms:room_id (name),
          tenants:tenant_id (first_name, last_name),
          maintenance_categories:category_id (name),
          maintenance_priorities:priority_id (name, color),
          users:assigned_to (email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching maintenance request with ID ${id}:`, error);
        throw error;
      }

      const mappedRequest = mapDatabaseMaintenanceRequestToFrontend(data);
      
      // Add related data
      mappedRequest.propertyName = data.properties?.title;
      mappedRequest.roomName = data.rooms?.name;
      mappedRequest.tenantName = data.tenants ? 
        `${data.tenants.first_name} ${data.tenants.last_name}` : 
        undefined;
      mappedRequest.categoryName = data.maintenance_categories?.name;
      mappedRequest.priorityName = data.maintenance_priorities?.name;
      mappedRequest.priorityColor = data.maintenance_priorities?.color;
      mappedRequest.assignedToName = data.users?.email;
      
      return mappedRequest;
    },
    enabled: !!id
  });
};

/**
 * Hook to create a new maintenance request
 */
export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData: Omit<FrontendMaintenanceRequest, 'id'>) => {
      // Convert frontend request to database format
      const dbRequest = mapFrontendMaintenanceRequestToDatabase(requestData);
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert(dbRequest)
        .select(`
          *,
          properties:property_id (title),
          rooms:room_id (name),
          tenants:tenant_id (first_name, last_name),
          maintenance_categories:category_id (name),
          maintenance_priorities:priority_id (name, color),
          users:assigned_to (email)
        `)
        .single();

      if (error) {
        console.error('Error creating maintenance request:', error);
        throw error;
      }

      // Add history record for the new request
      const { error: historyError } = await supabase
        .from('maintenance_history')
        .insert({
          request_id: data.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'status_change',
          details: { from: null, to: 'new', note: 'Request created' }
        });

      if (historyError) {
        console.error('Error creating maintenance history record:', historyError);
      }

      const mappedRequest = mapDatabaseMaintenanceRequestToFrontend(data);
      
      // Add related data
      mappedRequest.propertyName = data.properties?.title;
      mappedRequest.roomName = data.rooms?.name;
      mappedRequest.tenantName = data.tenants ? 
        `${data.tenants.first_name} ${data.tenants.last_name}` : 
        undefined;
      mappedRequest.categoryName = data.maintenance_categories?.name;
      mappedRequest.priorityName = data.maintenance_priorities?.name;
      mappedRequest.priorityColor = data.maintenance_priorities?.color;
      mappedRequest.assignedToName = data.users?.email;
      
      return mappedRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
      toast.success('Maintenance request created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create maintenance request: ${error.message}`);
    }
  });
};

/**
 * Hook to update an existing maintenance request
 */
export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      request,
      previousStatus,
      note
    }: { 
      id: string, 
      request: Partial<Omit<FrontendMaintenanceRequest, 'id'>>,
      previousStatus?: MaintenanceStatus,
      note?: string
    }) => {
      // Convert frontend request to database format
      const updateData: Partial<MaintenanceRequest> = {};
      
      if (request.title !== undefined) updateData.title = request.title;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.tenantId !== undefined) updateData.tenant_id = request.tenantId;
      if (request.propertyId !== undefined) updateData.property_id = request.propertyId;
      if (request.roomId !== undefined) updateData.room_id = request.roomId;
      if (request.categoryId !== undefined) updateData.category_id = request.categoryId;
      if (request.priorityId !== undefined) updateData.priority_id = request.priorityId;
      if (request.status !== undefined) updateData.status = request.status;
      if (request.reportedDate !== undefined) updateData.reported_date = request.reportedDate;
      if (request.assignedDate !== undefined) updateData.assigned_date = request.assignedDate;
      if (request.assignedTo !== undefined) updateData.assigned_to = request.assignedTo;
      if (request.scheduledDate !== undefined) updateData.scheduled_date = request.scheduledDate;
      if (request.completedDate !== undefined) updateData.completed_date = request.completedDate;
      if (request.isEmergency !== undefined) updateData.is_emergency = request.isEmergency;
      if (request.permissionToEnter !== undefined) updateData.permission_to_enter = request.permissionToEnter;
      if (request.tenantAvailableTimes !== undefined) updateData.tenant_available_times = request.tenantAvailableTimes;
      if (request.images !== undefined) updateData.images = request.images;
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          properties:property_id (title),
          rooms:room_id (name),
          tenants:tenant_id (first_name, last_name),
          maintenance_categories:category_id (name),
          maintenance_priorities:priority_id (name, color),
          users:assigned_to (email)
        `)
        .single();

      if (error) {
        console.error(`Error updating maintenance request with ID ${id}:`, error);
        throw error;
      }

      // Add history record if status changed
      if (request.status && previousStatus && request.status !== previousStatus) {
        const { error: historyError } = await supabase
          .from('maintenance_history')
          .insert({
            request_id: id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action: 'status_change',
            details: { from: previousStatus, to: request.status }
          });

        if (historyError) {
          console.error('Error creating maintenance history record:', historyError);
        }
      }

      // Add history record if assigned to someone
      // Add history record if note is provided
      if (note) {
        const { error: noteHistoryError } = await supabase
          .from('maintenance_history')
          .insert({
            request_id: id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action: 'note_added',
            details: { note, status: request.status || data.status }
          });

        if (noteHistoryError) {
          console.error('Error creating note history record:', noteHistoryError);
        }
      }
      
      if (request.assignedTo && !data.assigned_to) {
        const { error: historyError } = await supabase
          .from('maintenance_history')
          .insert({
            request_id: id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action: 'assigned',
            details: { assignedTo: request.assignedTo }
          });

        if (historyError) {
          console.error('Error creating maintenance history record:', historyError);
        }
      }

      const updatedRequest = mapDatabaseMaintenanceRequestToFrontend(data);
      
      // Add related data
      updatedRequest.propertyName = data.properties?.title;
      updatedRequest.roomName = data.rooms?.name;
      updatedRequest.tenantName = data.tenants ? 
        `${data.tenants.first_name} ${data.tenants.last_name}` : 
        undefined;
      updatedRequest.categoryName = data.maintenance_categories?.name;
      updatedRequest.priorityName = data.maintenance_priorities?.name;
      updatedRequest.priorityColor = data.maintenance_priorities?.color;
      updatedRequest.assignedToName = data.users?.email;
      
      return updatedRequest;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests', variables.id] });
      toast.success('Maintenance request updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update maintenance request: ${error.message}`);
    }
  });
};

/**
 * Hook to delete a maintenance request
 */
export const useDeleteMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance request with ID ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
      queryClient.removeQueries({ queryKey: ['maintenanceRequests', id] });
      toast.success('Maintenance request deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete maintenance request: ${error.message}`);
    }
  });
};
