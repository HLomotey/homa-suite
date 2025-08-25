import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { ExternalStaff, FrontendExternalStaff, CreateExternalStaff, UpdateExternalStaff } from '@/integration/supabase/types/external-staff';
import { toast } from 'sonner';

export type StaffStatus = 'active' | 'terminated' | 'all';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface UseExternalStaffReturn {
  externalStaff: FrontendExternalStaff[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  status: StaffStatus;
  setStatus: (status: StaffStatus) => void;
  fetchExternalStaff: () => Promise<void>;
  createExternalStaff: (staff: Partial<FrontendExternalStaff>) => Promise<FrontendExternalStaff | null>;
  updateExternalStaff: (id: string, updates: Partial<FrontendExternalStaff>) => Promise<FrontendExternalStaff | null>;
  deleteExternalStaff: (id: string) => Promise<boolean>;
  bulkCreateExternalStaff: (staffList: Partial<FrontendExternalStaff>[]) => Promise<FrontendExternalStaff[]>;
}

export function useExternalStaff(): UseExternalStaffReturn {
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [status, setStatus] = useState<StaffStatus>('all');

  const fetchExternalStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the total count
      const countQuery = supabase
        .from('external_staff')
        .select('id', { count: 'exact' });
      
      // Apply status filter if not 'all'
      if (status === 'active') {
        countQuery.is('TERMINATION DATE', null);
      } else if (status === 'terminated') {
        countQuery.not('TERMINATION DATE', 'is', null);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      setTotalCount(count || 0);

      // Then fetch the paginated data
      const from = pagination.pageIndex * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      let query = supabase
        .from('external_staff')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply status filter if not 'all'
      if (status === 'active') {
        query = query.is('TERMINATION DATE', null);
      } else if (status === 'terminated') {
        query = query.not('TERMINATION DATE', 'is', null);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // No mapping needed as we're using the same interface
      setExternalStaff(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch external staff';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createExternalStaff = async (staff: Partial<FrontendExternalStaff>): Promise<FrontendExternalStaff | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('external_staff')
        .insert([staff])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Refresh the data to ensure we have the correct pagination and count
      await fetchExternalStaff();
      toast.success('External staff created successfully');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create external staff';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateExternalStaff = async (id: string, updates: Partial<FrontendExternalStaff>): Promise<FrontendExternalStaff | null> => {
    try {
      setError(null);
      
      // No mapping needed as we're using the same interface
      const { data, error: updateError } = await supabase
        .from('external_staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // No mapping needed
      setExternalStaff(prev => prev.map(staff => staff.id === id ? data : staff));
      
      toast.success('External staff member updated successfully');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update external staff';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteExternalStaff = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('external_staff')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setExternalStaff(prev => prev.filter(staff => staff.id !== id));
      toast.success('External staff member deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete external staff';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const bulkCreateExternalStaff = async (staffList: Partial<FrontendExternalStaff>[]): Promise<FrontendExternalStaff[]> => {
    try {
      setError(null);
      
      // No mapping needed as we're using the same interface
      const { data, error: createError } = await supabase
        .from('external_staff')
        .insert(staffList)
        .select();

      if (createError) {
        throw createError;
      }

      // No mapping needed
      const newStaffList = data || [];
      setExternalStaff(prev => [...newStaffList, ...prev]);
      
      toast.success(`${newStaffList.length} external staff members created successfully`);
      return newStaffList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create external staff members';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  useEffect(() => {
    fetchExternalStaff();
  }, [pagination.pageIndex, pagination.pageSize, status]);

  return {
    externalStaff,
    loading,
    error,
    totalCount,
    pagination,
    setPagination,
    status,
    setStatus,
    fetchExternalStaff,
    createExternalStaff,
    updateExternalStaff,
    deleteExternalStaff,
    bulkCreateExternalStaff,
  };
}
