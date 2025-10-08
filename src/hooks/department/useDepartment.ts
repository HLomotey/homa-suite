/**
 * Department hooks for Supabase integration
 * These hooks provide data fetching and state management for department data
 */

import { useState, useEffect, useCallback } from "react";
import { FrontendDepartment } from "../../integration/supabase/types";
import * as departmentApi from "./api";

/**
 * Hook for fetching all departments
 * @returns Object containing departments data, loading state, error state, and refetch function
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState<FrontendDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentApi.fetchDepartments();
      setDepartments(data);
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

  return { departments, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single department by ID
 * @param id Department ID
 * @returns Object containing department data, loading state, error state, and refetch function
 */
export const useDepartment = (id: string) => {
  const [department, setDepartment] = useState<FrontendDepartment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await departmentApi.fetchDepartmentById(id);
      setDepartment(data);
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

  return { department, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new department
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateDepartment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdDepartment, setCreatedDepartment] = useState<FrontendDepartment | null>(null);

  const create = useCallback(
    async (departmentData: Omit<FrontendDepartment, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await departmentApi.createDepartment(departmentData);
        setCreatedDepartment(data);
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

  return { create, loading, error, createdDepartment };
};

/**
 * Hook for updating a department
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateDepartment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedDepartment, setUpdatedDepartment] = useState<FrontendDepartment | null>(null);

  const update = useCallback(
    async (
      id: string,
      departmentData: Partial<Omit<FrontendDepartment, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await departmentApi.updateDepartment(id, departmentData);
        setUpdatedDepartment(data);
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

  return { update, loading, error, updatedDepartment };
};

/**
 * Hook for deleting a department
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteDepartment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await departmentApi.deleteDepartment(id);
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

  return { deleteDepartment, loading, error, isDeleted };
};

/**
 * Hook for searching departments by name
 * @param searchTerm Search term to filter departments by name
 * @returns Object containing departments data, loading state, error state, and refetch function
 */
export const useSearchDepartments = (searchTerm: string) => {
  const [departments, setDepartments] = useState<FrontendDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!searchTerm) {
      // If no search term is provided, fetch all departments
      try {
        setLoading(true);
        setError(null);
        const data = await departmentApi.fetchDepartments();
        setDepartments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await departmentApi.searchDepartmentsByName(searchTerm);
      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { departments, loading, error, refetch: fetchData };
};
