/**
 * Staff hooks for Supabase integration
 * These hooks provide data management for staff operations
 */

import { useState, useCallback, useEffect } from "react";
import { FrontendBillingStaff } from "../../integration/supabase/types/billing";
import * as staffApi from "./staffApi";

/**
 * Hook for creating a new staff member
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateStaff = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdStaff, setCreatedStaff] = useState<FrontendBillingStaff | null>(null);

  const create = useCallback(
    async (staffData: Omit<FrontendBillingStaff, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await staffApi.createStaff(staffData);
        setCreatedStaff(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdStaff };
};

/**
 * Hook for updating a staff member
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateStaff = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedStaff, setUpdatedStaff] = useState<FrontendBillingStaff | null>(null);

  const update = useCallback(
    async (id: string, staffData: Partial<Omit<FrontendBillingStaff, "id">>) => {
      try {
        setLoading(true);
        setError(null);
        const data = await staffApi.updateStaff(id, staffData);
        setUpdatedStaff(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedStaff };
};

/**
 * Hook for deleting a staff member
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteStaff = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteStaff = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await staffApi.deleteStaff(id);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteStaff, loading, error };
};

/**
 * Hook for fetching all staff members
 * @returns Object containing staff array, loading state, error state, and refetch function
 */
export const useStaff = () => {
  const [staff, setStaff] = useState<FrontendBillingStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffApi.getAllStaff();
      setStaff(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return { staff, loading, error, refetch: fetchStaff };
};
