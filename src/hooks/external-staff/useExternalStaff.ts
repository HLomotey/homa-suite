// hooks/external-staff/useExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { toast } from "sonner";

/**
 * Robust, paginated fetch for ALL external_staff rows.
 * - Works around PostgREST page-size limits by looping .range()
 * - Retries transient failures
 * - Optional AbortController support
 */

const TABLE_NAME = "external_staff"; // <-- adjust if your table name differs
const PAGE_SIZE = 1000;              // safe chunk size; tune if needed
const MAX_RETRIES = 3;

export type StaffStatus = "all" | "active" | "terminated";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface StaffStats {
  total: number;
  active: number;
  terminated: number;
  newThisMonth: number;
  activeCount: number;
  terminatedCount: number;
  recentHiresCount: number;
  totalCount: number;
  topDepartments: Array<{
    department: string;
    count: number;
  }>;
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
  fetchExternalStaff: () => Promise<void>;
  createExternalStaff: (data: Partial<FrontendExternalStaff>) => Promise<boolean>;
  bulkCreateExternalStaff: (data: FrontendExternalStaff[]) => Promise<boolean>;
  updateExternalStaff: (id: string, data: Partial<FrontendExternalStaff>) => Promise<boolean>;
  deleteExternalStaff: (id: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
};

async function fetchAllRowsPaginated(
  status: StaffStatus,
  signal?: AbortSignal
): Promise<{ data: FrontendExternalStaff[]; totalCount: number }> {
  let query = supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .order("id", { ascending: true });

  // Apply status filtering at database level for better performance
  if (status === "active") {
    query = query.is('"TERMINATION DATE"', null);
  } else if (status === "terminated") {
    query = query.not('"TERMINATION DATE"', 'is', null);
  }
  // For "all", no additional filtering needed

  // Get total count first with proper filtering
  let countQuery = supabase
    .from(TABLE_NAME)
    .select("id", { count: "exact", head: true });

  // Apply same status filtering for accurate count
  if (status === "active") {
    countQuery = countQuery.is('"TERMINATION DATE"', null);
  } else if (status === "terminated") {
    countQuery = countQuery.not('"TERMINATION DATE"', 'is', null);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) throw countError;

  const total = totalCount || 0;
  let allRows: FrontendExternalStaff[] = [];

  // If no records, return early
  if (total === 0) {
    return { data: [], totalCount: 0 };
  }

  // Fetch all pages
  const pages = Math.ceil(total / PAGE_SIZE);
  for (let page = 0; page < pages; page++) {
    const from = page * PAGE_SIZE;
    const to = Math.min((page + 1) * PAGE_SIZE - 1, total - 1);

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        let pageQuery = supabase
          .from(TABLE_NAME)
          .select("*")
          .order("id", { ascending: true })
          .range(from, to);

        // Apply same status filtering to each page
        if (status === "active") {
          pageQuery = pageQuery.is('"TERMINATION DATE"', null);
        } else if (status === "terminated") {
          pageQuery = pageQuery.not('"TERMINATION DATE"', 'is', null);
        }

        const { data, error: pageErr } = await pageQuery;

        if (pageErr) throw pageErr;
        if (data && data.length) {
          allRows = allRows.concat(data as FrontendExternalStaff[]);
        }
        break;
      } catch (e) {
        attempt++;
        if (attempt >= MAX_RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }

  return { data: allRows, totalCount: total };
}

export function useExternalStaff(): UseExternalStaffReturn {
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<StaffStatus>("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    terminated: 0,
    newThisMonth: 0,
    activeCount: 0,
    terminatedCount: 0,
    recentHiresCount: 0,
    totalCount: 0,
    topDepartments: []
  });
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    // cancel previous in-flight
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const result = await fetchAllRowsPaginated(status, abortRef.current.signal);
      setExternalStaff(result.data);
      setTotalCount(result.totalCount);
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
      // Get all records for accurate stats calculation using our pagination function
      const allStaffResult = await fetchAllRowsPaginated("all");
      const allStaff = allStaffResult.data;
      
      const total = allStaff.length;
      const terminated = allStaff.filter(item => item["TERMINATION DATE"]).length;
      const active = total - terminated;
      
      // Calculate new hires this month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const newThisMonth = allStaff.filter(item => {
        if (!item["HIRE DATE"]) return false;
        const hireDate = new Date(item["HIRE DATE"]);
        return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
      }).length;
      
      // Calculate top departments/business units for active staff only
      const activeStaff = allStaff.filter(item => !item["TERMINATION DATE"]);
      const departmentCounts = activeStaff.reduce((acc: Record<string, number>, item) => {
        // Try multiple department fields in order of preference
        const dept = item["BUSINESS UNIT"] || 
                    item["HOME DEPARTMENT"] || 
                    item["LOCATION"] || 
                    item["COMPANY CODE"] ||
                    item["JOB CLASS"];
        
        // Only count records that have actual department values
        if (dept && dept.trim() !== "") {
          acc[dept] = (acc[dept] || 0) + 1;
        }
        return acc;
      }, {});
      
      const topDepartments = Object.entries(departmentCounts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 departments
      
      setStats({ 
        total, 
        active, 
        terminated, 
        newThisMonth,
        activeCount: active,
        terminatedCount: terminated,
        recentHiresCount: newThisMonth,
        totalCount: total,
        topDepartments
      });
    } catch (e: any) {
      console.error("fetchStats error:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const createExternalStaff = useCallback(async (data: Partial<FrontendExternalStaff>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .insert([data]);
      
      if (error) {
        console.error("Create external staff error:", error);
        toast.error("Failed to create external staff member");
        return false;
      }
      
      toast.success("External staff member created successfully");
      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Create external staff error:", e);
      toast.error("Failed to create external staff member");
      return false;
    }
  }, [load, fetchStats]);

  const updateExternalStaff = useCallback(async (id: string, data: Partial<FrontendExternalStaff>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update(data)
        .eq('id', id);
      
      if (error) {
        console.error("Update external staff error:", error);
        toast.error("Failed to update external staff member");
        return false;
      }
      
      toast.success("External staff member updated successfully");
      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Update external staff error:", e);
      toast.error("Failed to update external staff member");
      return false;
    }
  }, [load, fetchStats]);

  const deleteExternalStaff = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete external staff error:", error);
        toast.error("Failed to delete external staff member");
        return false;
      }
      
      toast.success("External staff member deleted successfully");
      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Delete external staff error:", e);
      toast.error("Failed to delete external staff member");
      return false;
    }
  }, [load, fetchStats]);

  const bulkCreateExternalStaff = useCallback(async (data: FrontendExternalStaff[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .insert(data);
      
      if (error) {
        console.error("Bulk create external staff error:", error);
        toast.error("Failed to bulk create external staff members");
        return false;
      }
      
      toast.success(`Successfully created ${data.length} external staff members`);
      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Bulk create external staff error:", e);
      toast.error("Failed to bulk create external staff members");
      return false;
    }
  }, [load, fetchStats]);

  // Expose same API name your component expects
  const fetchAllExternalStaff = useMemo(() => load, [load]);
  const fetchExternalStaff = useMemo(() => load, [load]);

  // convenience alias
  const refreshAll = useMemo(() => load, [load]);

  // Auto-load on mount and when status changes
  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    fetchExternalStaff,
    createExternalStaff,
    bulkCreateExternalStaff,
    updateExternalStaff,
    deleteExternalStaff,
    fetchStats,
  };
}
