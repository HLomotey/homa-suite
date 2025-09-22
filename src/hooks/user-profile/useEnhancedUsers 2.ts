/**
 * Enhanced User hooks with role integration
 * These hooks provide enhanced user data fetching with role information
 */

import { useState, useEffect, useCallback } from "react";
import { FrontendUser } from "../../integration/supabase/types";
import * as enhancedUserApi from "../../integration/supabase/enhanced-user-api";

/**
 * Hook for fetching all users with role information
 */
export const useEnhancedUsers = () => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await enhancedUserApi.getUsersWithRoles();
      
      if (result.error) {
        setError(result.error);
        setUsers([]);
        setTotal(0);
      } else {
        setUsers(result.users);
        setTotal(result.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, total, refetch: fetchData };
};

/**
 * Hook for fetching users by role
 */
export const useUsersByRole = (roleName: string) => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!roleName) {
      setUsers([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await enhancedUserApi.getUsersByRole(roleName);
      
      if (result.error) {
        setError(result.error);
        setUsers([]);
        setTotal(0);
      } else {
        setUsers(result.users);
        setTotal(result.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [roleName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, total, refetch: fetchData };
};

/**
 * Hook for fetching users by department
 */
export const useUsersByDepartment = (department: string) => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!department) {
      setUsers([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await enhancedUserApi.getUsersByDepartment(department);
      
      if (result.error) {
        setError(result.error);
        setUsers([]);
        setTotal(0);
      } else {
        setUsers(result.users);
        setTotal(result.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, total, refetch: fetchData };
};

/**
 * Hook for searching users
 */
export const useSearchUsers = (searchTerm: string) => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setUsers([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await enhancedUserApi.searchUsers(searchTerm.trim());
      
      if (result.error) {
        setError(result.error);
        setUsers([]);
        setTotal(0);
      } else {
        setUsers(result.users);
        setTotal(result.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  return { users, loading, error, total, refetch: fetchData };
};

/**
 * Hook for updating user role
 */
export const useUpdateUserRole = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateRole = useCallback(async (userId: string, roleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await enhancedUserApi.updateUserRole(userId, roleId);
      
      if (!result.success) {
        setError(result.error || new Error('Failed to update user role'));
        return false;
      }
      
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateRole, loading, error };
};
