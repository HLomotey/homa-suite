/**
 * Transport hooks for Supabase integration
 * These hooks provide data fetching and state management for transport data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendVehicle,
  FrontendTransportStaff,
  FrontendTransportStats,
  VehicleStatus,
  VehicleType
} from "../../integration/supabase/types";
import * as transportApi from "./api";

/**
 * Hook for fetching all vehicles
 * @returns Object containing vehicles data, loading state, error state, and refetch function
 */
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<FrontendVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportApi.fetchVehicles();
      setVehicles(data);
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

  return { vehicles, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single vehicle by ID
 * @param id Vehicle ID
 * @returns Object containing vehicle data, loading state, error state, and refetch function
 */
export const useVehicle = (id: string) => {
  const [vehicle, setVehicle] = useState<FrontendVehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await transportApi.fetchVehicleById(id);
      setVehicle(data);
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

  return { vehicle, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new vehicle
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateVehicle = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdVehicle, setCreatedVehicle] = useState<FrontendVehicle | null>(null);

  const create = useCallback(
    async (vehicleData: Omit<FrontendVehicle, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await transportApi.createVehicle(vehicleData);
        setCreatedVehicle(data);
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

  return { create, loading, error, createdVehicle };
};

/**
 * Hook for updating a vehicle
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateVehicle = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedVehicle, setUpdatedVehicle] = useState<FrontendVehicle | null>(null);

  const update = useCallback(
    async (
      id: string,
      vehicleData: Partial<Omit<FrontendVehicle, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await transportApi.updateVehicle(id, vehicleData);
        setUpdatedVehicle(data);
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

  return { update, loading, error, updatedVehicle };
};

/**
 * Hook for deleting a vehicle
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteVehicle = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await transportApi.deleteVehicle(id);
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

  return { deleteVehicle, loading, error, isDeleted };
};

/**
 * Hook for fetching vehicles by status
 * @param status Vehicle status to filter by
 * @returns Object containing vehicles data, loading state, error state, and refetch function
 */
export const useVehiclesByStatus = (status: VehicleStatus) => {
  const [vehicles, setVehicles] = useState<FrontendVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportApi.fetchVehiclesByStatus(status);
      setVehicles(data);
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

  return { vehicles, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching vehicles by type
 * @param type Vehicle type to filter by
 * @returns Object containing vehicles data, loading state, error state, and refetch function
 */
export const useVehiclesByType = (type: VehicleType) => {
  const [vehicles, setVehicles] = useState<FrontendVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportApi.fetchVehiclesByType(type);
      setVehicles(data);
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

  return { vehicles, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching transport staff
 * @returns Object containing staff data, loading state, error state, and refetch function
 */
export const useTransportStaff = () => {
  const [staff, setStaff] = useState<FrontendTransportStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportApi.fetchTransportStaff();
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
 * Hook for fetching transport stats
 * @returns Object containing stats data, loading state, error state, and refetch function
 */
export const useTransportStats = () => {
  const [stats, setStats] = useState<FrontendTransportStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportApi.fetchTransportStats();
      setStats(data);
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

  return { stats, loading, error, refetch: fetchData };
};
