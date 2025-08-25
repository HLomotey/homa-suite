import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { ExternalStaff, FrontendExternalStaff, CreateExternalStaff, UpdateExternalStaff } from '@/integration/supabase/types/external-staff';
import { toast } from 'sonner';

export type StaffStatus = 'active' | 'terminated' | 'all';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface StaffStats {
  totalCount: number;
  activeCount: number;
  terminatedCount: number;
  recentHiresCount: number;
  topDepartments: Array<{ department: string; count: number }>;
}

export interface UseExternalStaffReturn {
  externalStaff: FrontendExternalStaff[];
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  totalCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  status: StaffStatus;
  setStatus: (status: StaffStatus) => void;
  stats: StaffStats;
  fetchExternalStaff: () => Promise<void>;
  fetchAllExternalStaff: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createExternalStaff: (staff: Partial<FrontendExternalStaff>) => Promise<FrontendExternalStaff | null>;
  updateExternalStaff: (id: string, updates: Partial<FrontendExternalStaff>) => Promise<FrontendExternalStaff | null>;
  deleteExternalStaff: (id: string) => Promise<boolean>;
  bulkCreateExternalStaff: (staffList: Partial<FrontendExternalStaff>[]) => Promise<FrontendExternalStaff[]>;
}

export function useExternalStaff(): UseExternalStaffReturn {
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [status, setStatus] = useState<StaffStatus>('all');
  const [stats, setStats] = useState<StaffStats>({
    totalCount: 0,
    activeCount: 0,
    terminatedCount: 0,
    recentHiresCount: 0,
    topDepartments: [],
  });

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

  const fetchAllExternalStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('external_staff')
        .select('*')
        .order('created_at', { ascending: false });

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
      setTotalCount(data?.length || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch all external staff';
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
      // Also refresh stats
      await fetchStats();
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
      
      // Refresh stats if termination status might have changed
      if (updates['TERMINATION DATE'] !== undefined) {
        await fetchStats();
      }
      
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
      // Refresh stats after deletion
      await fetchStats();
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
      
      // Refresh stats after bulk creation
      await fetchStats();
      toast.success(`${newStaffList.length} external staff members created successfully`);
      return newStaffList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create external staff members';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setError(null);

      // Get total count
      const { count: totalCount, error: totalError } = await supabase
        .from('external_staff')
        .select('id', { count: 'exact' });

      if (totalError) throw totalError;

      // Get active count
      const { count: activeCount, error: activeError } = await supabase
        .from('external_staff')
        .select('id', { count: 'exact' })
        .is('TERMINATION DATE', null);

      if (activeError) throw activeError;

      // Get terminated count
      const { count: terminatedCount, error: terminatedError } = await supabase
        .from('external_staff')
        .select('id', { count: 'exact' })
        .not('TERMINATION DATE', 'is', null);

      if (terminatedError) throw terminatedError;

      // Get recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { count: recentHiresCount, error: recentError } = await supabase
        .from('external_staff')
        .select('id', { count: 'exact' })
        .gte('HIRE DATE', thirtyDaysAgoStr);

      if (recentError) throw recentError;

      // Get department distribution (active staff only)
      const { data: departmentsData, error: deptError } = await supabase
        .from('external_staff')
        .select('"HOME DEPARTMENT"')
        .not('HOME DEPARTMENT', 'is', null)
        .is('TERMINATION DATE', null); // Only include active staff

      if (deptError) throw deptError;

      // Count departments
      const departmentCounts: Record<string, number> = {};
      departmentsData?.forEach((staff) => {
        const department = staff['HOME DEPARTMENT'] || 'Unassigned';
        departmentCounts[department] = (departmentCounts[department] || 0) + 1;
      });

      // Sort departments by count
      const topDepartments = Object.entries(departmentCounts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setStats({
        totalCount: totalCount || 0,
        activeCount: activeCount || 0,
        terminatedCount: terminatedCount || 0,
        recentHiresCount: recentHiresCount || 0,
        topDepartments,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchExternalStaff();
  }, [pagination.pageIndex, pagination.pageSize, status]);

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    externalStaff,
    loading,
    statsLoading,
    error,
    totalCount,
    pagination,
    setPagination,
    status,
    setStatus,
    stats,
    fetchExternalStaff,
    fetchAllExternalStaff,
    fetchStats,
    createExternalStaff,
    updateExternalStaff,
    deleteExternalStaff,
    bulkCreateExternalStaff,
  };
}
