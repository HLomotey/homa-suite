/**
 * Assignment hooks for Supabase integration
 * These hooks provide data fetching and state management for assignment data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendAssignment,
  AssignmentStatus,
  PaymentStatus
} from "../../integration/supabase/types";
import * as assignmentApi from "./api";

/**
 * Hook for fetching all assignments
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export const useAssignments = () => {
  const [assignments, setAssignments] = useState<FrontendAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.fetchAssignments();
      setAssignments(data);
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

  return { assignments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single assignment by ID
 * @param id Assignment ID
 * @returns Object containing assignment data, loading state, error state, and refetch function
 */
export const useAssignment = (id: string) => {
  const [assignment, setAssignment] = useState<FrontendAssignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.fetchAssignmentById(id);
      setAssignment(data);
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

  return { assignment, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new assignment
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateAssignment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdAssignment, setCreatedAssignment] = useState<FrontendAssignment | null>(null);

  const create = useCallback(
    async (assignmentData: Omit<FrontendAssignment, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await assignmentApi.createAssignment(assignmentData);
        setCreatedAssignment(data);
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

  return { create, loading, error, createdAssignment };
};

/**
 * Hook for updating an assignment
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateAssignment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedAssignment, setUpdatedAssignment] = useState<FrontendAssignment | null>(null);

  const update = useCallback(
    async (
      id: string,
      assignmentData: Partial<Omit<FrontendAssignment, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await assignmentApi.updateAssignment(id, assignmentData);
        setUpdatedAssignment(data);
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

  return { update, loading, error, updatedAssignment };
};

/**
 * Hook for deleting an assignment
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteAssignment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await assignmentApi.deleteAssignment(id);
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

  return { deleteAssignment, loading, error, isDeleted };
};

/**
 * Hook for fetching assignments by status
 * @param status Assignment status to filter by
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export const useAssignmentsByStatus = (status: AssignmentStatus) => {
  const [assignments, setAssignments] = useState<FrontendAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.fetchAssignmentsByStatus(status);
      setAssignments(data);
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

  return { assignments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching assignments by payment status
 * @param paymentStatus Payment status to filter by
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export const useAssignmentsByPaymentStatus = (paymentStatus: PaymentStatus) => {
  const [assignments, setAssignments] = useState<FrontendAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.fetchAssignmentsByPaymentStatus(paymentStatus);
      setAssignments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [paymentStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { assignments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching assignments by tenant ID
 * @param tenantId Tenant ID to filter by
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export const useAssignmentsByTenant = (tenantId: string) => {
  const [assignments, setAssignments] = useState<FrontendAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.fetchAssignmentsByTenant(tenantId);
      setAssignments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { assignments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching assignments by property ID
 * @param propertyId Property ID to filter by
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export const useAssignmentsByProperty = (propertyId: string) => {
  const [assignments, setAssignments] = useState<FrontendAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.fetchAssignmentsByProperty(propertyId);
      setAssignments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { assignments, loading, error, refetch: fetchData };
};
