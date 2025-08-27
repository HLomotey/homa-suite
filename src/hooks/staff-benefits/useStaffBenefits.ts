import { useState, useEffect } from 'react';
import { 
  FrontendStaffBenefit, 
  CreateStaffBenefit, 
  UpdateStaffBenefit,
  StaffBenefitStats,
  BenefitStatus,
  BenefitType 
} from '@/integration/supabase/types/staff-benefits';
import {
  fetchStaffBenefits,
  fetchStaffBenefitById,
  createStaffBenefit,
  updateStaffBenefit,
  deleteStaffBenefit,
  approveStaffBenefit,
  suspendStaffBenefit,
  fetchStaffLocations,
  fetchStaffBenefitsStats
} from './api';
import { toast } from 'sonner';

export interface UseStaffBenefitsReturn {
  benefits: FrontendStaffBenefit[];
  loading: boolean;
  error: string | null;
  stats: StaffBenefitStats;
  staffLocations: Array<{ id: string; location_code: string; location_description: string }>;
  
  // Actions
  fetchBenefits: (filters?: {
    status?: BenefitStatus;
    benefit_type?: BenefitType;
    staff_id?: string;
    staff_location_id?: string;
  }) => Promise<void>;
  getBenefitById: (id: string) => Promise<FrontendStaffBenefit | null>;
  createBenefit: (benefit: CreateStaffBenefit) => Promise<FrontendStaffBenefit | null>;
  updateBenefit: (id: string, updates: UpdateStaffBenefit) => Promise<FrontendStaffBenefit | null>;
  deleteBenefit: (id: string) => Promise<boolean>;
  approveBenefit: (id: string) => Promise<FrontendStaffBenefit | null>;
  suspendBenefit: (id: string) => Promise<FrontendStaffBenefit | null>;
  refreshStats: () => Promise<void>;
  refreshLocations: () => Promise<void>;
}

export function useStaffBenefits(): UseStaffBenefitsReturn {
  const [benefits, setBenefits] = useState<FrontendStaffBenefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StaffBenefitStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    suspended: 0,
    housingBenefits: 0,
    transportationBenefits: 0
  });
  const [staffLocations, setStaffLocations] = useState<Array<{ id: string; location_code: string; location_description: string }>>([]);

  const fetchBenefits = async (filters?: {
    status?: BenefitStatus;
    benefit_type?: BenefitType;
    staff_id?: string;
    staff_location_id?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStaffBenefits(filters);
      setBenefits(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff benefits';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getBenefitById = async (id: string): Promise<FrontendStaffBenefit | null> => {
    try {
      setError(null);
      return await fetchStaffBenefitById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff benefit';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const createBenefit = async (benefit: CreateStaffBenefit): Promise<FrontendStaffBenefit | null> => {
    try {
      setError(null);
      const newBenefit = await createStaffBenefit(benefit);
      setBenefits(prev => [newBenefit, ...prev]);
      toast.success('Staff benefit created successfully');
      await refreshStats(); // Refresh stats after creation
      return newBenefit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff benefit';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const updateBenefit = async (id: string, updates: UpdateStaffBenefit): Promise<FrontendStaffBenefit | null> => {
    try {
      setError(null);
      const updatedBenefit = await updateStaffBenefit(id, updates);
      setBenefits(prev => prev.map(benefit => 
        benefit.id === id ? updatedBenefit : benefit
      ));
      toast.success('Staff benefit updated successfully');
      await refreshStats(); // Refresh stats after update
      return updatedBenefit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff benefit';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteBenefit = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteStaffBenefit(id);
      setBenefits(prev => prev.filter(benefit => benefit.id !== id));
      toast.success('Staff benefit deleted successfully');
      await refreshStats(); // Refresh stats after deletion
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete staff benefit';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const approveBenefit = async (id: string): Promise<FrontendStaffBenefit | null> => {
    try {
      setError(null);
      const approvedBenefit = await approveStaffBenefit(id);
      setBenefits(prev => prev.map(benefit => 
        benefit.id === id ? approvedBenefit : benefit
      ));
      toast.success('Staff benefit approved successfully');
      await refreshStats(); // Refresh stats after approval
      return approvedBenefit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve staff benefit';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const suspendBenefit = async (id: string): Promise<FrontendStaffBenefit | null> => {
    try {
      setError(null);
      const suspendedBenefit = await suspendStaffBenefit(id);
      setBenefits(prev => prev.map(benefit => 
        benefit.id === id ? suspendedBenefit : benefit
      ));
      toast.success('Staff benefit suspended successfully');
      await refreshStats(); // Refresh stats after suspension
      return suspendedBenefit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to suspend staff benefit';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const refreshStats = async () => {
    try {
      const newStats = await fetchStaffBenefitsStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const refreshLocations = async () => {
    try {
      const locations = await fetchStaffLocations();
      setStaffLocations(locations);
    } catch (err) {
      console.error('Failed to refresh locations:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBenefits();
    refreshStats();
    refreshLocations();
  }, []);

  return {
    benefits,
    loading,
    error,
    stats,
    staffLocations,
    fetchBenefits,
    getBenefitById,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    approveBenefit,
    suspendBenefit,
    refreshStats,
    refreshLocations
  };
}
