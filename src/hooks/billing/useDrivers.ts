/**
 * React hook for fetching and managing driver staff data
 */

import { useState, useEffect, useCallback } from 'react';
import { getDrivers } from './staffApi';
import { FrontendBillingStaff } from '@/integration/supabase/types/billing';

interface UseDriversReturn {
  drivers: FrontendBillingStaff[];
  loading: boolean;
  error: Error | null;
  refreshDrivers: () => Promise<void>;
}

/**
 * Hook for fetching and managing driver staff data
 * @param autoFetch Whether to automatically fetch drivers on mount (default: true)
 * @returns Object containing drivers data, loading state, error state, and refresh function
 */
export const useDrivers = (autoFetch = true): UseDriversReturn => {
  const [drivers, setDrivers] = useState<FrontendBillingStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error('Error in useDrivers hook:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch drivers'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh function that can be called manually
  const refreshDrivers = useCallback(async () => {
    await fetchDrivers();
  }, [fetchDrivers]);

  // Fetch drivers on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchDrivers();
    }
  }, [autoFetch, fetchDrivers]);

  return {
    drivers,
    loading,
    error,
    refreshDrivers
  };
};

export default useDrivers;
