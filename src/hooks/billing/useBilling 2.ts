/**
 * Billing hooks for Supabase integration
 * These hooks provide data fetching and state management for billing data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendBill,
  FrontendBillingStaff,
  FrontendBillingStats,
  BillStatus,
  BillType
} from "../../integration/supabase/types";
import * as billingApi from "./api";

/**
 * Hook for fetching all bills
 * @returns Object containing bills data, loading state, error state, and refetch function
 */
export const useBills = () => {
  const [bills, setBills] = useState<FrontendBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBills();
      setBills(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { bills, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single bill by ID
 * @param id Bill ID
 * @returns Object containing bill data, loading state, error state, and refetch function
 */
export const useBill = (id: string) => {
  const [bill, setBill] = useState<FrontendBill | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBillById(id);
      setBill(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { bill, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new bill
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateBill = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdBill, setCreatedBill] = useState<FrontendBill | null>(null);

  const create = useCallback(
    async (billData: Omit<FrontendBill, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await billingApi.createBill(billData);
        setCreatedBill(data);
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

  return { create, loading, error, createdBill };
};

/**
 * Hook for updating a bill
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateBill = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedBill, setUpdatedBill] = useState<FrontendBill | null>(null);

  const update = useCallback(
    async (
      id: string,
      billData: Partial<Omit<FrontendBill, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await billingApi.updateBill(id, billData);
        setUpdatedBill(data);
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

  return { update, loading, error, updatedBill };
};

/**
 * Hook for deleting a bill
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteBill = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteBill = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await billingApi.deleteBill(id);
      setIsDeleted(true);
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

  return { deleteBill, loading, error, isDeleted };
};

/**
 * Hook for fetching bills by status
 * @param status Bill status to filter by
 * @returns Object containing bills data, loading state, error state, and refetch function
 */
export const useBillsByStatus = (status: BillStatus) => {
  const [bills, setBills] = useState<FrontendBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBillsByStatus(status);
      setBills(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { bills, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching bills by type
 * @param type Bill type to filter by
 * @returns Object containing bills data, loading state, error state, and refetch function
 */
export const useBillsByType = (type: BillType) => {
  const [bills, setBills] = useState<FrontendBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBillsByType(type);
      setBills(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { bills, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching bills by staff ID
 * @param staffId Staff ID to filter by
 * @returns Object containing bills data, loading state, error state, and refetch function
 */
export const useBillsByStaff = (staffId: string) => {
  const [bills, setBills] = useState<FrontendBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!staffId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBillsByStaff(staffId);
      setBills(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { bills, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching billing staff
 * @returns Object containing staff data, loading state, error state, and refetch function
 */
export const useBillingStaff = () => {
  const [staff, setStaff] = useState<FrontendBillingStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBillingStaff();
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
    fetchData();
  }, [fetchData]);

  return { staff, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching billing stats
 * @param month Optional month to filter by (format: 'YYYY-MM')
 * @param year Optional year to filter by
 * @returns Object containing stats data, loading state, error state, and refetch function
 */
export const useBillingStats = (month?: string, year?: number) => {
  const [stats, setStats] = useState<FrontendBillingStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.fetchBillingStats(month, year);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, error, refetch: fetchData };
};
