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

      const mappedRequest = mapDatabaseMaintenanceRequestToFrontend(data as any);
      
      // Add related data
      mappedRequest.propertyName = (data as any).properties?.title;
      mappedRequest.roomName = (data as any).rooms?.name;
      mappedRequest.tenantName = (data as any).tenants ? 
        `${(data as any).tenants.first_name} ${(data as any).tenants.last_name}` : 
        undefined;
      mappedRequest.categoryName = (data as any).maintenance_categories?.name;
      mappedRequest.priorityName = (data as any).maintenance_priorities?.name;
      mappedRequest.priorityColor = (data as any).maintenance_priorities?.color;
      mappedRequest.assignedToName = (data as any).users?.email;
      
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
      // Convert frontend request to database format, ensuring no extra fields
      const cleanRequestData = {
        title: requestData.title,
        description: requestData.description,
        tenantId: requestData.tenantId,
        propertyId: requestData.propertyId,
        roomId: requestData.roomId,
        categoryId: requestData.categoryId,
        priorityId: requestData.priorityId,
        status: requestData.status,
        reportedDate: requestData.reportedDate,
        assignedDate: requestData.assignedDate,
        assignedTo: requestData.assignedTo,
        scheduledDate: requestData.scheduledDate,
        completedDate: requestData.completedDate,
        isEmergency: requestData.isEmergency,
        permissionToEnter: requestData.permissionToEnter,
        tenantAvailableTimes: requestData.tenantAvailableTimes,
        images: requestData.images
      };
      
      const dbRequest = mapFrontendMaintenanceRequestToDatabase(cleanRequestData);
      
      // Debug: Check if role field exists anywhere in the data flow
      console.log('=== DEBUGGING ROLE FIELD ===');
      console.log('Original requestData has role?', 'role' in requestData);
      console.log('CleanRequestData has role?', 'role' in cleanRequestData);
      console.log('DbRequest has role?', 'role' in dbRequest);
      console.log('DbRequest keys:', Object.keys(dbRequest));
      if ('role' in dbRequest) {
        console.log('FOUND ROLE IN dbRequest:', (dbRequest as any).role);
      }
      
      // Remove any potential 'role' field and other unwanted properties
      const { role, ...cleanDbRequest } = dbRequest as any;
      console.log('After removing role, keys:', Object.keys(cleanDbRequest));
      
      // Final sanitized request with only valid database columns
      const sanitizedDbRequest = {
        title: cleanDbRequest.title,
        description: cleanDbRequest.description,
        tenant_id: cleanDbRequest.tenant_id,
        property_id: cleanDbRequest.property_id,
        room_id: cleanDbRequest.room_id,
        category_id: cleanDbRequest.category_id,
        priority_id: cleanDbRequest.priority_id,
        status: cleanDbRequest.status,
        reported_date: cleanDbRequest.reported_date,
        assigned_date: cleanDbRequest.assigned_date,
        assigned_to: cleanDbRequest.assigned_to,
        scheduled_date: cleanDbRequest.scheduled_date,
        completed_date: cleanDbRequest.completed_date,
        is_emergency: cleanDbRequest.is_emergency,
        permission_to_enter: cleanDbRequest.permission_to_enter,
        tenant_available_times: cleanDbRequest.tenant_available_times,
        images: cleanDbRequest.images
      };
      
      console.log('Final sanitized object keys:', Object.keys(sanitizedDbRequest));
      
      // Use RPC function to bypass any client-side issues with role field
      const { data: insertedId, error } = await (supabase as any).rpc('insert_maintenance_request', {
        p_title: sanitizedDbRequest.title,
        p_description: sanitizedDbRequest.description,
        p_property_id: sanitizedDbRequest.property_id,
        p_category_id: sanitizedDbRequest.category_id,
        p_priority_id: sanitizedDbRequest.priority_id,
        p_tenant_id: sanitizedDbRequest.tenant_id,
        p_room_id: sanitizedDbRequest.room_id,
        p_status: sanitizedDbRequest.status,
        p_reported_date: sanitizedDbRequest.reported_date,
        p_assigned_date: sanitizedDbRequest.assigned_date,
        p_assigned_to: sanitizedDbRequest.assigned_to,
        p_scheduled_date: sanitizedDbRequest.scheduled_date,
        p_completed_date: sanitizedDbRequest.completed_date,
        p_is_emergency: sanitizedDbRequest.is_emergency,
        p_permission_to_enter: sanitizedDbRequest.permission_to_enter,
        p_tenant_available_times: sanitizedDbRequest.tenant_available_times,
        p_images: sanitizedDbRequest.images
      });

      if (error) {
        console.error('Error creating maintenance request via RPC:', error);
        throw error;
      }

      // Now fetch the created record with all relations
      const { data, error: fetchError } = await supabase
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
        .eq('id', insertedId)
        .single();

      if (fetchError) {
        console.error('Error fetching created maintenance request:', fetchError);
        throw fetchError;
      }

      if (error) {
        console.error('Error creating maintenance request:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from maintenance request creation');
      }

      // Add history record for the new request
      const { error: historyError } = await supabase
        .from('maintenance_history')
        .insert({
          request_id: (data as any).id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'status_change',
          details: { from: null, to: 'new', note: 'Request created' }
        } as any);

      if (historyError) {
        console.error('Error creating maintenance history record:', historyError);
      }

      const mappedRequest = mapDatabaseMaintenanceRequestToFrontend(data as any);
      
      // Add related data
      mappedRequest.propertyName = (data as any).properties?.title;
      mappedRequest.roomName = (data as any).rooms?.name;
      mappedRequest.tenantName = (data as any).tenants ? 
        `${(data as any).tenants.first_name} ${(data as any).tenants.last_name}` : 
        undefined;
      mappedRequest.categoryName = (data as any).maintenance_categories?.name;
      mappedRequest.priorityName = (data as any).maintenance_priorities?.name;
      mappedRequest.priorityColor = (data as any).maintenance_priorities?.color;
      mappedRequest.assignedToName = (data as any).users?.email;
      
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
      
      // Use any casting to bypass Supabase's overly strict TypeScript inference
      const supabaseQuery = supabase.from('maintenance_requests') as any;
      const { data, error } = await supabaseQuery
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
          } as any);

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
            details: { note, status: request.status || (data as any).status }
          } as any);

        if (noteHistoryError) {
          console.error('Error creating note history record:', noteHistoryError);
        }
      }
      
      if (request.assignedTo && !(data as any).assigned_to) {
        const { error: historyError } = await supabase
          .from('maintenance_history')
          .insert({
            request_id: id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action: 'assigned',
            details: { assignedTo: request.assignedTo }
          } as any);

        if (historyError) {
          console.error('Error creating maintenance history record:', historyError);
        }
      }

      if (!data) {
        throw new Error('No data returned from maintenance request update');
      }

      const updatedRequest = mapDatabaseMaintenanceRequestToFrontend(data as any);
      
      // Add related data
      updatedRequest.propertyName = (data as any).properties?.title;
      updatedRequest.roomName = (data as any).rooms?.name;
      updatedRequest.tenantName = (data as any).tenants ? 
        `${(data as any).tenants.first_name} ${(data as any).tenants.last_name}` : 
        undefined;
      updatedRequest.categoryName = (data as any).maintenance_categories?.name;
      updatedRequest.priorityName = (data as any).maintenance_priorities?.name;
      updatedRequest.priorityColor = (data as any).maintenance_priorities?.color;
      updatedRequest.assignedToName = (data as any).users?.email;
      
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
