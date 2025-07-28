/**
 * Property hooks for Supabase integration
 * These hooks provide data fetching and state management for property data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendProperty,
  PropertyStatus,
  PropertyType,
} from "../../integration/supabase/types";
import * as propertyApi from "./api";

/**
 * Hook for fetching all properties
 * @returns Object containing properties data, loading state, error state, and refetch function
 */
export const useProperties = () => {
  const [properties, setProperties] = useState<FrontendProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyApi.fetchProperties();
      setProperties(data);
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

  return { properties, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single property by ID
 * @param id Property ID
 * @returns Object containing property data, loading state, error state, and refetch function
 */
export const useProperty = (id: string) => {
  const [property, setProperty] = useState<FrontendProperty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await propertyApi.fetchPropertyById(id);
      setProperty(data);
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

  return { property, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new property
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateProperty = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdProperty, setCreatedProperty] =
    useState<FrontendProperty | null>(null);

  const create = useCallback(
    async (propertyData: Omit<FrontendProperty, "id" | "dateAdded">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await propertyApi.createProperty(propertyData);
        setCreatedProperty(data);
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

  return { create, loading, error, createdProperty };
};

/**
 * Hook for updating a property
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateProperty = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedProperty, setUpdatedProperty] =
    useState<FrontendProperty | null>(null);

  const update = useCallback(
    async (
      id: string,
      propertyData: Partial<Omit<FrontendProperty, "id" | "dateAdded">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await propertyApi.updateProperty(id, propertyData);
        setUpdatedProperty(data);
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

  return { update, loading, error, updatedProperty };
};

/**
 * Hook for deleting a property
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteProperty = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await propertyApi.deleteProperty(id);
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

  return { deleteProperty, loading, error, isDeleted };
};

/**
 * Hook for fetching properties by status
 * @param status Property status to filter by
 * @returns Object containing properties data, loading state, error state, and refetch function
 */
export const usePropertiesByStatus = (status: PropertyStatus) => {
  const [properties, setProperties] = useState<FrontendProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyApi.fetchPropertiesByStatus(status);
      setProperties(data);
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

  return { properties, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching properties by type
 * @param type Property type to filter by
 * @returns Object containing properties data, loading state, error state, and refetch function
 */
export const usePropertiesByType = (type: PropertyType) => {
  const [properties, setProperties] = useState<FrontendProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyApi.fetchPropertiesByType(type);
      setProperties(data);
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

  return { properties, loading, error, refetch: fetchData };
};
