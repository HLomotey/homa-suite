/**
 * Hook for fetching billing staff specifically for selection dropdowns
 * Optimized for manager selection in forms
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { BillingStaff, FrontendBillingStaff, mapDatabaseBillingStaffToFrontend } from '@/integration/supabase/types/billing';

export interface StaffSelectionOption {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  email: string;
}

export const useStaffForSelection = () => {
  const [staff, setStaff] = useState<StaffSelectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffForSelection = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching staff for selection using RPC...');
      
      // Use the same RPC function as useBillingStaff
      const { data, error: rpcError } = await supabase.rpc('get_billing_staff') as { data: BillingStaff[] | null, error: any };
      
      console.log('Staff selection raw data from RPC:', data);
      
      if (rpcError) {
        console.error('RPC Error fetching staff for selection:', rpcError);
        // Don't throw error, fall back to direct query
      }
      
      // If we got data from RPC, use it
      if (data && Array.isArray(data) && data.length > 0) {
        const activeStaff = (data as BillingStaff[])
          .filter(staff => staff.employment_status === 'Active')
          .map((staff) => ({
            id: staff.id,
            name: staff.legal_name,
            jobTitle: staff.job_title,
            department: staff.department,
            email: staff.email,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Mapped staff options from RPC:', activeStaff);
        setStaff(activeStaff);
        return;
      }
      
      // Fallback to direct table query if RPC doesn't work
      console.log('Falling back to direct table query...');
      const { data: tableData, error: fetchError } = await supabase
        .from('billing_staff')
        .select('id, legal_name, job_title, department, email, employment_status')
        .eq('employment_status', 'Active')
        .order('legal_name', { ascending: true }) as { data: Array<{id: string; legal_name: string; job_title: string; department: string; email: string; employment_status: string}> | null, error: any };

      if (fetchError) {
        console.error('Error fetching staff for selection:', fetchError);
        throw new Error(fetchError.message);
      }

      const staffOptions: StaffSelectionOption[] = (tableData || []).map((staff: any) => ({
        id: staff.id,
        name: staff.legal_name,
        jobTitle: staff.job_title,
        department: staff.department,
        email: staff.email,
      }));

      console.log('Mapped staff options from direct query:', staffOptions);
      setStaff(staffOptions);
    } catch (err) {
      console.error('Exception in fetchStaffForSelection:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffForSelection();
  }, []);

  const searchStaff = (searchTerm: string): StaffSelectionOption[] => {
    if (!searchTerm.trim()) return staff;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return staff.filter(
      (member) =>
        member.name.toLowerCase().includes(lowercaseSearch) ||
        member.jobTitle.toLowerCase().includes(lowercaseSearch) ||
        member.department.toLowerCase().includes(lowercaseSearch) ||
        member.email.toLowerCase().includes(lowercaseSearch)
    );
  };

  return {
    staff,
    loading,
    error,
    refetch: fetchStaffForSelection,
    searchStaff,
  };
};
