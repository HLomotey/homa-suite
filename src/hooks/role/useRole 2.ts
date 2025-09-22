/**
 * Role hooks for Supabase integration
 * These hooks provide data fetching and state management for role data
 */

import { useState, useEffect, useCallback } from "react";
import { FrontendRole } from "../../integration/supabase/types";
import * as roleApi from "./api";

/**
 * Hook for fetching all roles
 * @returns Object containing roles data, loading state, error state, and refetch function
 */
export const useRoles = () => {
  const [roles, setRoles] = useState<FrontendRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useRoles: Starting to fetch roles...');
      const data = await roleApi.fetchRoles();
      console.log('✅ useRoles: Received data from API:', data);
      setRoles(data);
      console.log('📊 useRoles: Roles state updated, count:', data.length);
    } catch (err) {
      console.error('❌ useRoles: Error in fetchData:', err);
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
      console.log('🏁 useRoles: Fetch completed');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { roles, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single role by ID
 * @param id Role ID
 * @returns Object containing role data, loading state, error state, and refetch function
 */
export const useRole = (id: string) => {
  const [role, setRole] = useState<FrontendRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await roleApi.fetchRoleById(id);
      setRole(data);
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

  return { role, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a role by name
 * @param name Role name
 * @returns Object containing role data, loading state, error state, and refetch function
 */
export const useRoleByName = (name: string) => {
  const [role, setRole] = useState<FrontendRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!name) return;

    try {
      setLoading(true);
      setError(null);
      const data = await roleApi.fetchRoleByName(name);
      setRole(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { role, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new role
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateRole = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdRole, setCreatedRole] = useState<FrontendRole | null>(null);

  const create = useCallback(
    async (roleData: Omit<FrontendRole, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roleApi.createRole(roleData);
        setCreatedRole(data);
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

  return { create, loading, error, createdRole };
};

/**
 * Hook for updating a role
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateRole = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedRole, setUpdatedRole] = useState<FrontendRole | null>(null);

  const update = useCallback(
    async (
      id: string,
      roleData: Partial<Omit<FrontendRole, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roleApi.updateRole(id, roleData);
        setUpdatedRole(data);
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

  return { update, loading, error, updatedRole };
};

/**
 * Hook for deleting a role
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteRole = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await roleApi.deleteRole(id);
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

  return { deleteRole, loading, error, isDeleted };
};

/**
 * Hook for updating role permissions
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateRolePermissions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedRole, setUpdatedRole] = useState<FrontendRole | null>(null);

  const updatePermissions = useCallback(
    async (id: string, permissions: string[]) => {
      try {
        setLoading(true);
        setError(null);
        const data = await roleApi.updateRolePermissions(id, permissions);
        setUpdatedRole(data);
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

  return { updatePermissions, loading, error, updatedRole };
};
