// Termination management hook
// Created: 2025-09-17

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthProvider';
import { TerminationStatus, getNextStatus } from '../lib/termination';

export interface TerminationRequest {
  id: string;
  employee_associate_id: string;
  employee_name: string;
  employee_email?: string;
  employee_department?: string;
  employee_job_title?: string;
  manager_associate_id?: string;
  manager_name?: string;
  effective_date: string;
  last_day_worked: string;
  separation_type: string;
  reason_for_leaving: string;
  rehire_eligible: string;
  direct_deposit_action: string;
  status: TerminationStatus;
  manager_approved_at?: string;
  manager_approved_by?: string;
  hr_approved_at?: string;
  hr_approved_by?: string;
  adp_processed: boolean;
  adp_processed_at?: string;
  adp_processed_by?: string;
  notes?: string;
  manager_comments?: string;
  hr_comments?: string;
  rejection_reason?: string;
  initiated_by: string;
  initiated_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTerminationData {
  employee_associate_id: string;
  employee_name: string;
  employee_email?: string;
  employee_department?: string;
  employee_job_title?: string;
  manager_associate_id?: string;
  manager_name?: string;
  effective_date: string;
  last_day_worked: string;
  separation_type: string;
  reason_for_leaving: string;
  rehire_eligible: string;
  direct_deposit_action: string;
  notes?: string;
  manager_comments?: string;
  hr_comments?: string;
}

export interface ExternalStaff {
  id: string;
  "ASSOCIATE ID": string;
  "PAYROLL FIRST NAME": string;
  "PAYROLL LAST NAME": string;
  "WORK E-MAIL": string;
  "PERSONAL E-MAIL": string;
  "JOB TITLE": string;
  "HOME DEPARTMENT": string;
  "LOCATION": string;
  "POSITION STATUS": string;
  "HIRE DATE": string;
  "TERMINATION DATE": string;
}

export const useTermination = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all employees from external_staff (active only)
  const getEmployees = useCallback(async (): Promise<ExternalStaff[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('external_staff')
        .select('*')
        .is('TERMINATION DATE', null) // Only active employees
        .order('PAYROLL LAST NAME', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      console.error('Error fetching employees:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all termination requests
  const getTerminations = useCallback(async (filters?: {
    status?: TerminationStatus;
    employee_associate_id?: string;
    initiated_by?: string;
  }): Promise<TerminationRequest[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('termination_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employee_associate_id) {
        query = query.eq('employee_associate_id', filters.employee_associate_id);
      }
      if (filters?.initiated_by) {
        query = query.eq('initiated_by', filters.initiated_by);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch terminations';
      setError(errorMessage);
      console.error('Error fetching terminations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single termination request
  const getTermination = useCallback(async (id: string): Promise<TerminationRequest | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('termination_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch termination';
      setError(errorMessage);
      console.error('Error fetching termination:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create termination request
  const createTermination = useCallback(async (data: CreateTerminationData): Promise<TerminationRequest | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser?.user?.user_metadata?.associate_id) {
        throw new Error('User associate ID not found');
      }

      const terminationData = {
        ...data,
        initiated_by: currentUser.user.user_metadata.associate_id,
        initiated_by_name: `${currentUser.user.user_metadata.first_name} ${currentUser.user.user_metadata.last_name}`,
        status: 'draft' as TerminationStatus
      };

      const { data: result, error } = await supabase
        .from('termination_requests')
        .insert([terminationData])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create termination';
      setError(errorMessage);
      console.error('Error creating termination:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Update termination request
  const updateTermination = useCallback(async (
    id: string, 
    updates: Partial<CreateTerminationData>
  ): Promise<TerminationRequest | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('termination_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update termination';
      setError(errorMessage);
      console.error('Error updating termination:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve termination (manager or HR)
  const approveTermination = useCallback(async (
    id: string,
    role: 'manager' | 'hr',
    comments?: string
  ): Promise<TerminationRequest | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser?.user?.user_metadata?.associate_id) {
        throw new Error('User associate ID not found');
      }

      const now = new Date().toISOString();
      const approverName = `${currentUser.user.user_metadata.first_name} ${currentUser.user.user_metadata.last_name}`;

      let updates: any = {};

      if (role === 'manager') {
        updates = {
          manager_approved_at: now,
          manager_approved_by: currentUser.user.user_metadata.associate_id,
          manager_comments: comments || null,
          status: 'pending_hr_approval'
        };
      } else if (role === 'hr') {
        updates = {
          hr_approved_at: now,
          hr_approved_by: currentUser.user.user_metadata.associate_id,
          hr_comments: comments || null,
          status: 'approved'
        };
      }

      const { data, error } = await supabase
        .from('termination_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve termination';
      setError(errorMessage);
      console.error('Error approving termination:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Mark ADP as processed
  const markADPProcessed = useCallback(async (id: string): Promise<TerminationRequest | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser?.user?.user_metadata?.associate_id) {
        throw new Error('User associate ID not found');
      }

      const updates = {
        adp_processed: true,
        adp_processed_at: new Date().toISOString(),
        adp_processed_by: currentUser.user.user_metadata.associate_id,
        status: 'completed' as TerminationStatus
      };

      const { data, error } = await supabase
        .from('termination_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark ADP processed';
      setError(errorMessage);
      console.error('Error marking ADP processed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Reject termination
  const rejectTermination = useCallback(async (
    id: string,
    reason: string
  ): Promise<TerminationRequest | null> => {
    try {
      setLoading(true);
      setError(null);

      const updates = {
        status: 'rejected' as TerminationStatus,
        rejection_reason: reason
      };

      const { data, error } = await supabase
        .from('termination_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject termination';
      setError(errorMessage);
      console.error('Error rejecting termination:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete termination request (only for drafts)
  const deleteTermination = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('termination_requests')
        .delete()
        .eq('id', id)
        .eq('status', 'draft'); // Only allow deletion of drafts

      if (error) throw error;
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete termination';
      setError(errorMessage);
      console.error('Error deleting termination:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getEmployees,
    getTerminations,
    getTermination,
    createTermination,
    updateTermination,
    approveTermination,
    markADPProcessed,
    rejectTermination,
    deleteTermination
  };
};
