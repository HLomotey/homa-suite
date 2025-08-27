// hooks/external-staff/useExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";

/**
 * Robust, paginated fetch for ALL external_staff rows.
 * - Works around PostgREST page-size limits by looping .range()
 * - Retries transient failures
 * - Optional AbortController support
 */

const TABLE_NAME = "external_staff"; // <-- adjust if your table name differs
const PAGE_SIZE = 1000;              // safe chunk size; tune if needed
const MAX_RETRIES = 3;

export type StaffStatus = 'active' | 'inactive' | 'all';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
}

type UseExternalStaffReturn = {
  externalStaff: FrontendExternalStaff[];
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  totalCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  status: StaffStatus;
  setStatus: (status: StaffStatus) => void;
  stats: StaffStats;
  refreshAll: () => Promise<void>;
  /** Kept for API compatibility with your current code */
  fetchAllExternalStaff: () => Promise<void>;
  createExternalStaff: (staff: any) => Promise<void>;
  updateExternalStaff: (id: string, staff: any) => Promise<void>;
  deleteExternalStaff: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
};

async function fetchAllRowsPaginated(
  status: string | null,
  signal?: AbortSignal
): Promise<FrontendExternalStaff[]> {
  // First call just to get total count
  let { data: head, count, error } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: false }) // not a HEAD: we want first page as well
    .order("id", { ascending: true })
    .range(0, PAGE_SIZE - 1);

  if (error) throw error;

  let rows: FrontendExternalStaff[] = head ?? [];
  const total = typeof count === "number" ? count : rows.length;

  // Early return if we already got everything in the first page
  if (rows.length >= total) {
    // Optional status filtering (client-side) to ensure we truly show "all" by default.
    return rows;
  }

  // Loop additional pages
  const pages = Math.ceil(total / PAGE_SIZE);
  for (let page = 1; page < pages; page++) {
    const from = page * PAGE_SIZE;
    const to = Math.min((page + 1) * PAGE_SIZE - 1, total - 1);

    let attempt = 0;
    // basic retry for transient network hiccups
    while (true) {
      try {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const { data, error: pageErr } = await supabase
          .from(TABLE_NAME)
          .select("*")
          .order("id", { ascending: true })
          .range(from, to);

        if (pageErr) throw pageErr;
        if (data && data.length) rows = rows.concat(data as FrontendExternalStaff[]);
        break;
      } catch (e) {
        attempt++;
        if (attempt >= MAX_RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }

  // If you truly want **all staff regardless of status**, do not filter here.
  // If you want to optionally filter by status, do it client-side:
  if (status) {
    const s = status.toLowerCase();
    rows = rows.filter((r: any) => (r.status || "").toLowerCase() === s);
  }

  return rows;
}

export function useExternalStaff(): UseExternalStaffReturn {
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<StaffStatus>('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    inactive: 0
  });
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    // cancel previous in-flight
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const statusFilter = status === 'all' ? null : status;
      const all = await fetchAllRowsPaginated(statusFilter, abortRef.current.signal);
      setExternalStaff(all);
      setTotalCount(all.length);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("fetchAllExternalStaff error:", e);
        setErr(e?.message ?? "Failed to load external staff");
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('status', { count: 'exact' });
      
      if (error) throw error;
      
      const total = data?.length || 0;
      const active = data?.filter(item => item.status === 'active').length || 0;
      const inactive = total - active;
      
      setStats({ total, active, inactive });
    } catch (e: any) {
      console.error("fetchStats error:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const createExternalStaff = useCallback(async (staff: any) => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert([staff]);
    
    if (error) throw error;
    await load();
  }, [load]);

  const updateExternalStaff = useCallback(async (id: string, staff: any) => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(staff)
      .eq('id', id);
    
    if (error) throw error;
    await load();
  }, [load]);

  const deleteExternalStaff = useCallback(async (id: string) => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await load();
  }, [load]);

  // Expose same API name your component expects
  const fetchAllExternalStaff = useMemo(() => load, [load]);

  // convenience alias
  const refreshAll = useMemo(() => load, [load]);

  // You can auto-load on mount, or let the caller call .fetchAllExternalStaff()
  useEffect(() => {
    // do nothing here by default; caller chooses when to load
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    externalStaff,
    loading,
    statsLoading,
    error: err,
    totalCount,
    pagination,
    setPagination,
    status,
    setStatus,
    stats,
    refreshAll,
    fetchAllExternalStaff,
    createExternalStaff,
    updateExternalStaff,
    deleteExternalStaff,
    fetchStats,
  };
}
