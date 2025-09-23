/**
 * Hooks for staff termination workflow
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase/client';
import { toast } from 'sonner';
import {
  StaffTerminationView,
  StaffForTermination,
  ManagerForLocation,
  TerminationRequest,
  TerminationRequestCreate,
  TerminationRequestUpdate,
  TerminationStatus
} from '@/integration/supabase/types/staff-termination';

// Query keys
const QUERY_KEYS = {
  STAFF_TERMINATION_VIEW: 'staff-termination-view',
  STAFF_FOR_TERMINATION: 'staff-for-termination',
  MANAGERS_FOR_LOCATION: 'managers-for-location',
  TERMINATION_REQUESTS: 'termination-requests',
  TERMINATION_REQUEST: 'termination-request',
} as const;

// Fetch all staff with termination view data
export const useStaffTerminationView = (filters?: {
  companyCode?: string;
  location?: string;
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STAFF_TERMINATION_VIEW, filters],
    queryFn: async (): Promise<StaffTerminationView[]> => {
      let query = supabase.from('staff_termination_view').select('*');

      if (filters?.companyCode) {
        query = query.ilike('company_code', `%${filters.companyCode}%`);
      }

      if (filters?.location) {
        query = query.ilike('location_name', `%${filters.location}%`);
      }

      if (filters?.activeOnly) {
        query = query.eq('eligible_for_termination', true);
      }

      const { data, error } = await query.order('full_name');

      if (error) {
        console.error('Error fetching staff termination view:', error);
        throw new Error(`Failed to fetch staff data: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch staff eligible for termination using the database function
export const useStaffForTermination = (filters?: {
  companyCode?: string;
  location?: string;
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STAFF_FOR_TERMINATION, filters],
    queryFn: async (): Promise<StaffForTermination[]> => {
      const { data, error } = await supabase.rpc('get_staff_for_termination', {
        p_company_code: filters?.companyCode || null,
        p_location: filters?.location || null,
        p_active_only: filters?.activeOnly ?? true,
      });

      if (error) {
        console.error('Error fetching staff for termination:', error);
        throw new Error(`Failed to fetch staff for termination: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch managers for a specific location
export const useManagersForLocation = (locationCode?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MANAGERS_FOR_LOCATION, locationCode],
    queryFn: async (): Promise<ManagerForLocation[]> => {
      const { data, error } = await supabase.rpc('get_managers_for_location', {
        p_location_code: locationCode || null,
      });

      if (error) {
        console.error('Error fetching managers for location:', error);
        throw new Error(`Failed to fetch managers: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!locationCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch all termination requests
export const useTerminationRequests = (filters?: {
  status?: string;
  staffId?: string;
  managerId?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TERMINATION_REQUESTS, filters],
    queryFn: async () => {
      let query = supabase.from('termination_requests_detailed').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.staffId) {
        query = query.eq('staff_id', filters.staffId);
      }

      if (filters?.managerId) {
        query = query.eq('manager_id', filters.managerId);
      }

      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching termination requests:', error);
        throw new Error(`Failed to fetch termination requests: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch a single termination request
export const useTerminationRequest = (requestId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TERMINATION_REQUEST, requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('termination_requests_detailed')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) {
        console.error('Error fetching termination request:', error);
        throw new Error(`Failed to fetch termination request: ${error.message}`);
      }

      return data;
    },
    enabled: !!requestId,
  });
};

// Submit a new termination request
export const useSubmitTerminationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: TerminationRequestCreate): Promise<string> => {
      const { data, error } = await supabase.rpc('submit_termination_request', {
        p_staff_id: request.staff_id,
        p_manager_id: request.manager_id,
        p_effective_termination_date: request.effective_termination_date,
        p_last_day_worked: request.last_day_worked,
        p_separation_type: request.separation_type,
        p_reason_for_leaving: request.reason_for_leaving,
        p_eligible_for_rehire: request.eligible_for_rehire,
        p_direct_deposit_instruction: request.direct_deposit_instruction,
        p_additional_notes: request.additional_notes || null,
      });

      if (error) {
        console.error('Error submitting termination request:', error);
        throw new Error(`Failed to submit termination request: ${error.message}`);
      }

      return data;
    },
    onSuccess: (requestId) => {
      toast.success('Termination request submitted successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TERMINATION_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STAFF_FOR_TERMINATION] });
    },
    onError: (error) => {
      console.error('Error submitting termination request:', error);
      toast.error(`Failed to submit termination request: ${error.message}`);
    },
  });
};

// Process a termination request (approve/reject/complete)
export const useProcessTerminationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      processingNotes,
    }: {
      requestId: string;
      status: 'approved' | 'rejected' | 'processed';
      processingNotes?: string;
    }): Promise<boolean> => {
      const { data, error } = await supabase.rpc('process_termination_request', {
        p_request_id: requestId,
        p_new_status: status,
        p_processing_notes: processingNotes || null,
      });

      if (error) {
        console.error('Error processing termination request:', error);
        throw new Error(`Failed to process termination request: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      const statusMessages = {
        approved: 'Termination request approved',
        rejected: 'Termination request rejected',
        processed: 'Termination request processed and staff terminated',
      };
      
      toast.success(statusMessages[variables.status]);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TERMINATION_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TERMINATION_REQUEST, variables.requestId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STAFF_TERMINATION_VIEW] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STAFF_FOR_TERMINATION] });
    },
    onError: (error) => {
      console.error('Error processing termination request:', error);
      toast.error(`Failed to process termination request: ${error.message}`);
    },
  });
};

// Update a termination request
export const useUpdateTerminationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      updates,
    }: {
      requestId: string;
      updates: TerminationRequestUpdate;
    }): Promise<TerminationRequest> => {
      const { data, error } = await supabase
        .from('termination_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating termination request:', error);
        throw new Error(`Failed to update termination request: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Termination request updated successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TERMINATION_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TERMINATION_REQUEST, variables.requestId] });
    },
    onError: (error) => {
      console.error('Error updating termination request:', error);
      toast.error(`Failed to update termination request: ${error.message}`);
    },
  });
};

// Delete a termination request (only if pending)
export const useDeleteTerminationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      const { error } = await supabase
        .from('termination_requests')
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending'); // Only allow deletion of pending requests

      if (error) {
        console.error('Error deleting termination request:', error);
        throw new Error(`Failed to delete termination request: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success('Termination request deleted successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TERMINATION_REQUESTS] });
    },
    onError: (error) => {
      console.error('Error deleting termination request:', error);
      toast.error(`Failed to delete termination request: ${error.message}`);
    },
  });
};

// Get termination statistics
export const useTerminationStats = () => {
  return useQuery({
    queryKey: ['termination-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('termination_requests')
        .select('status, separation_type, created_at');

      if (error) {
        console.error('Error fetching termination stats:', error);
        throw new Error(`Failed to fetch termination stats: ${error.message}`);
      }

      const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        approved: data.filter(r => r.status === 'approved').length,
        rejected: data.filter(r => r.status === 'rejected').length,
        processed: data.filter(r => r.status === 'processed').length,
        byType: data.reduce((acc, r) => {
          acc[r.separation_type] = (acc[r.separation_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        thisMonth: data.filter(r => {
          const created = new Date(r.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};