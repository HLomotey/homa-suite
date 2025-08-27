// hooks/external-staff/useHistoricalExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendHistoryExternalStaff } from '@/integration/supabase/types/external-staff';
import { toast } from "sonner";

const HISTORY_TABLE_NAME = "history_external_staff";
const PAGE_SIZE = 1000;
const MAX_RETRIES = 3;

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface UseHistoricalExternalStaffReturn {
  historicalStaff: FrontendHistoryExternalStaff[];
  loading: boolean;
  error: string;
  totalCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  refreshAll: () => Promise<void>;
  fetchHistoricalStaff: () => Promise<void>;
}

async function fetchAllHistoricalRowsPaginated(
  signal?: AbortSignal
): Promise<{ data: FrontendHistoryExternalStaff[]; totalCount: number }> {
  let query = supabase
    .from(HISTORY_TABLE_NAME)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false }); // Most recent first

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching historical external staff:", error);
    throw error;
  }

  return {
    data: data || [],
    totalCount: count || 0,
  };
}

async function fetchHistoricalRowsPaginated(
  pagination: PaginationState,
  signal?: AbortSignal
): Promise<{ data: FrontendHistoryExternalStaff[]; totalCount: number }> {
  const from = pagination.pageIndex * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  let query = supabase
    .from(HISTORY_TABLE_NAME)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching paginated historical external staff:", error);
    throw error;
  }

  return {
    data: data || [],
    totalCount: count || 0,
  };
}

export function useHistoricalExternalStaff(): UseHistoricalExternalStaffReturn {
  const [historicalStaff, setHistoricalStaff] = useState<FrontendHistoryExternalStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErr("");

    try {
      const result = await fetchHistoricalRowsPaginated(pagination, controller.signal);
      
      if (!controller.signal.aborted) {
        setHistoricalStaff(result.data);
        setTotalCount(result.totalCount);
      }
    } catch (error: any) {
      if (!controller.signal.aborted) {
        console.error("Load historical external staff error:", error);
        setErr(error.message || "Failed to load historical external staff");
        toast.error("Failed to load historical external staff");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [pagination]);

  const refreshAll = useCallback(async () => {
    await load();
  }, [load]);

  const fetchHistoricalStaff = useCallback(async () => {
    await load();
  }, [load]);

  // Load data when pagination changes
  useEffect(() => {
    load();
  }, [load]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    historicalStaff,
    loading,
    error: err,
    totalCount,
    pagination,
    setPagination,
    refreshAll,
    fetchHistoricalStaff,
  };
}
