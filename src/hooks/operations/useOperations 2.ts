/**
 * Operations hooks for Supabase integration
 * These hooks provide data fetching and state management for operations data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendJobOrder,
  FrontendRegionPerformance,
  FrontendTopPerformer,
  FrontendClientSatisfaction,
  FrontendJobOrderTrend,
  FrontendTimeToFillTrend,
  FrontendJobType,
  JobOrderStatus
} from "../../integration/supabase/types";
import * as operationsApi from "./api";

/**
 * Hook for fetching all job orders
 * @returns Object containing job orders data, loading state, error state, and refetch function
 */
export const useJobOrders = () => {
  const [jobOrders, setJobOrders] = useState<FrontendJobOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchJobOrders();
      setJobOrders(data);
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

  return { jobOrders, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single job order by ID
 * @param id Job order ID
 * @returns Object containing job order data, loading state, error state, and refetch function
 */
export const useJobOrder = (id: string) => {
  const [jobOrder, setJobOrder] = useState<FrontendJobOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchJobOrderById(id);
      setJobOrder(data);
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

  return { jobOrder, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new job order
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateJobOrder = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdJobOrder, setCreatedJobOrder] = useState<FrontendJobOrder | null>(null);

  const create = useCallback(
    async (jobOrderData: Omit<FrontendJobOrder, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await operationsApi.createJobOrder(jobOrderData);
        setCreatedJobOrder(data);
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

  return { create, loading, error, createdJobOrder };
};

/**
 * Hook for updating a job order
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateJobOrder = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedJobOrder, setUpdatedJobOrder] = useState<FrontendJobOrder | null>(null);

  const update = useCallback(
    async (
      id: string,
      jobOrderData: Partial<Omit<FrontendJobOrder, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await operationsApi.updateJobOrder(id, jobOrderData);
        setUpdatedJobOrder(data);
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

  return { update, loading, error, updatedJobOrder };
};

/**
 * Hook for deleting a job order
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteJobOrder = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteJobOrder = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await operationsApi.deleteJobOrder(id);
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

  return { deleteJobOrder, loading, error, isDeleted };
};

/**
 * Hook for fetching job orders by status
 * @param status Job order status to filter by
 * @returns Object containing job orders data, loading state, error state, and refetch function
 */
export const useJobOrdersByStatus = (status: JobOrderStatus) => {
  const [jobOrders, setJobOrders] = useState<FrontendJobOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchJobOrdersByStatus(status);
      setJobOrders(data);
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

  return { jobOrders, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching job orders by client
 * @param client Client name to filter by
 * @returns Object containing job orders data, loading state, error state, and refetch function
 */
export const useJobOrdersByClient = (client: string) => {
  const [jobOrders, setJobOrders] = useState<FrontendJobOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchJobOrdersByClient(client);
      setJobOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobOrders, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching region performance data
 * @returns Object containing region performance data, loading state, error state, and refetch function
 */
export const useRegionPerformance = () => {
  const [regionPerformance, setRegionPerformance] = useState<FrontendRegionPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchRegionPerformance();
      setRegionPerformance(data);
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

  return { regionPerformance, loading, error, refetch: fetchData };
};

/**
 * Hook for updating region performance data
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateRegionPerformance = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedRegionPerformance, setUpdatedRegionPerformance] = useState<FrontendRegionPerformance | null>(null);

  const update = useCallback(
    async (
      region: string,
      regionPerformanceData: Omit<FrontendRegionPerformance, "region">
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await operationsApi.updateRegionPerformance(region, regionPerformanceData);
        setUpdatedRegionPerformance(data);
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

  return { update, loading, error, updatedRegionPerformance };
};

/**
 * Hook for fetching top performers
 * @returns Object containing top performers data, loading state, error state, and refetch function
 */
export const useTopPerformers = () => {
  const [topPerformers, setTopPerformers] = useState<FrontendTopPerformer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchTopPerformers();
      setTopPerformers(data);
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

  return { topPerformers, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching top performers by region
 * @param region Region to filter by
 * @returns Object containing top performers data, loading state, error state, and refetch function
 */
export const useTopPerformersByRegion = (region: string) => {
  const [topPerformers, setTopPerformers] = useState<FrontendTopPerformer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchTopPerformersByRegion(region);
      setTopPerformers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { topPerformers, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching client satisfaction data
 * @returns Object containing client satisfaction data, loading state, error state, and refetch function
 */
export const useClientSatisfaction = () => {
  const [clientSatisfaction, setClientSatisfaction] = useState<FrontendClientSatisfaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchClientSatisfaction();
      setClientSatisfaction(data);
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

  return { clientSatisfaction, loading, error, refetch: fetchData };
};

/**
 * Hook for updating client satisfaction data
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateClientSatisfaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedClientSatisfaction, setUpdatedClientSatisfaction] = useState<FrontendClientSatisfaction | null>(null);

  const update = useCallback(
    async (clientSatisfactionData: FrontendClientSatisfaction) => {
      try {
        setLoading(true);
        setError(null);
        const data = await operationsApi.updateClientSatisfaction(clientSatisfactionData);
        setUpdatedClientSatisfaction(data);
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

  return { update, loading, error, updatedClientSatisfaction };
};

/**
 * Hook for fetching job order trends
 * @returns Object containing job order trends data, loading state, error state, and refetch function
 */
export const useJobOrderTrends = () => {
  const [jobOrderTrends, setJobOrderTrends] = useState<FrontendJobOrderTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchJobOrderTrends();
      setJobOrderTrends(data);
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

  return { jobOrderTrends, loading, error, refetch: fetchData };
};

/**
 * Hook for updating job order trend data
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateJobOrderTrend = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedJobOrderTrend, setUpdatedJobOrderTrend] = useState<FrontendJobOrderTrend | null>(null);

  const update = useCallback(
    async (jobOrderTrendData: FrontendJobOrderTrend) => {
      try {
        setLoading(true);
        setError(null);
        const data = await operationsApi.updateJobOrderTrend(jobOrderTrendData);
        setUpdatedJobOrderTrend(data);
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

  return { update, loading, error, updatedJobOrderTrend };
};

/**
 * Hook for fetching time to fill trends
 * @returns Object containing time to fill trends data, loading state, error state, and refetch function
 */
export const useTimeToFillTrends = () => {
  const [timeToFillTrends, setTimeToFillTrends] = useState<FrontendTimeToFillTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchTimeToFillTrends();
      setTimeToFillTrends(data);
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

  return { timeToFillTrends, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching job type distribution
 * @returns Object containing job types data, loading state, error state, and refetch function
 */
export const useJobTypes = () => {
  const [jobTypes, setJobTypes] = useState<FrontendJobType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.fetchJobTypes();
      setJobTypes(data);
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

  return { jobTypes, loading, error, refetch: fetchData };
};
