/**
 * Custom hooks for tenant data management
 * These hooks provide a React-friendly interface for tenant operations
 */

import { useState, useEffect } from "react";
import {
  fetchTenants,
  fetchTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  fetchTenantsByStatus,
  fetchTenantsByProperty,
} from "./api";
import {
  FrontendTenant,
  TenantStatus,
} from "../../integration/supabase/types/tenant";

/**
 * Hook to fetch all tenants
 */
export const useTenants = () => {
  const [tenants, setTenants] = useState<FrontendTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error in useTenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { tenants, loading, error, refetch };
};

/**
 * Hook to fetch a single tenant by ID
 */
export const useTenant = (id: string | null) => {
  const [tenant, setTenant] = useState<FrontendTenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setTenant(null);
      return;
    }

    const loadTenant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTenantById(id);
        setTenant(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error in useTenant:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [id]);

  return { tenant, loading, error };
};

/**
 * Hook to create a new tenant
 */
export const useCreateTenant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    tenantData: Omit<FrontendTenant, "id" | "dateAdded">
  ): Promise<FrontendTenant> => {
    try {
      setLoading(true);
      setError(null);
      const newTenant = await createTenant(tenantData);
      return newTenant;
    } catch (err) {
      setError(err as Error);
      console.error("Error in useCreateTenant:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

/**
 * Hook to update a tenant
 */
export const useUpdateTenant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (
    id: string,
    tenantData: Partial<Omit<FrontendTenant, "id" | "dateAdded">>
  ): Promise<FrontendTenant> => {
    try {
      setLoading(true);
      setError(null);
      const updatedTenant = await updateTenant(id, tenantData);
      return updatedTenant;
    } catch (err) {
      setError(err as Error);
      console.error("Error in useUpdateTenant:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

/**
 * Hook to delete a tenant
 */
export const useDeleteTenant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTenantById = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteTenant(id);
    } catch (err) {
      setError(err as Error);
      console.error("Error in useDeleteTenant:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTenant: deleteTenantById, loading, error };
};

/**
 * Hook to fetch tenants by status
 */
export const useTenantsByStatus = (status: TenantStatus) => {
  const [tenants, setTenants] = useState<FrontendTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTenantsByStatus(status);
      setTenants(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error in useTenantsByStatus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [status]);

  return { tenants, loading, error, refetch };
};

/**
 * Hook to fetch tenants by property
 */
export const useTenantsByProperty = (propertyId: string) => {
  const [tenants, setTenants] = useState<FrontendTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTenantsByProperty(propertyId);
      setTenants(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error in useTenantsByProperty:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [propertyId]);

  return { tenants, loading, error, refetch };
};