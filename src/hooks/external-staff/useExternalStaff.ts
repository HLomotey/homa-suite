// hooks/external-staff/useExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendExternalStaff, CreateExternalStaff, CreateHistoryExternalStaff, ExternalStaff } from '@/integration/supabase/types/external-staff';
import { Database } from '@/integration/supabase/types/database';
import { toast } from "sonner";
import * as XLSX from 'xlsx';

/**
 * Robust, paginated fetch for ALL external_staff rows.
 * - Works around PostgREST page-size limits by looping .range()
 * - Retries transient failures
 * - Optional AbortController support
 */

const TABLE_NAME = "external_staff"; // <-- adjust if your table name differs
const HISTORY_TABLE_NAME = "history_external_staff";

// Key fields that trigger historical archiving when changed
const CHANGE_DETECTION_FIELDS = [
  "JOB TITLE",
  "HOME DEPARTMENT", 
  "LOCATION",
  "POSITION STATUS"
] as const;
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
  bulkCreateExternalStaff: (data: CreateExternalStaff[]) => Promise<boolean>;
  bulkUpsertExternalStaff: (data: CreateExternalStaff[]) => Promise<boolean>;
  updateExternalStaff: (id: string, data: Partial<FrontendExternalStaff>) => Promise<boolean>;
  deleteExternalStaff: (id: string) => Promise<boolean>;
  bulkDeleteExternalStaff: (ids: string[]) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  exportToExcel: (filteredData?: FrontendExternalStaff[]) => void;
};

async function fetchAllRowsPaginated(
  status: StaffStatus,
  signal?: AbortSignal
): Promise<{ data: FrontendExternalStaff[]; totalCount: number }> {
  console.log(`fetchAllRowsPaginated called with status: ${status}`);
  
  // Test direct query first to ensure connection works
  const { data: testData, error: testError } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .limit(5);
    
  console.log("Test query result:", { testData: testData?.length, testError });
  
  if (testError) {
    console.error("Test query failed:", testError);
    throw new Error(`Database connection error: ${testError.message}`);
  }
  
  // Get total count first with proper filtering
  let countQuery = supabase
    .from(TABLE_NAME)
    .select("id", { count: "exact", head: true });

  // Apply status filtering for accurate count
  if (status === "active") {
    countQuery = countQuery.is('"TERMINATION DATE"', null);
  } else if (status === "terminated") {
    countQuery = countQuery.not('"TERMINATION DATE"', 'is', null);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    console.error("Count query error:", countError);
    throw new Error(`Failed to get total count: ${countError.message}`);
  }

  const total = totalCount || 0;
  console.log(`Total count for status '${status}': ${total}`);
  
  let allRows: FrontendExternalStaff[] = [];

  // If no records, return early
  if (total === 0) {
    console.log("No records found, returning empty array");
    return { data: [], totalCount: 0 };
  }

  // Fetch all pages with progress logging
  const pages = Math.ceil(total / PAGE_SIZE);
  console.log(`Will fetch ${pages} pages with ${PAGE_SIZE} records per page`);
  
  for (let page = 0; page < pages; page++) {
    if (page > 0 && page % 5 === 0) {
      console.log(`Fetched ${allRows.length} records so far (${Math.round(allRows.length / total * 100)}%)`);
    }
    
    const from = page * PAGE_SIZE;
    const to = Math.min((page + 1) * PAGE_SIZE - 1, total - 1);

    let attempt = 0;
    let success = false;
    
    while (attempt < MAX_RETRIES && !success) {
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

        if (pageErr) {
          console.error(`Error fetching page ${page}:`, pageErr);
          throw pageErr;
        }
        
        if (data && data.length) {
          allRows = allRows.concat(data as FrontendExternalStaff[]);
          success = true;
        } else {
          console.warn(`Page ${page} returned no data`);
          success = true; // Consider empty result as success to avoid retries
        }
      } catch (e) {
        attempt++;
        console.warn(`Attempt ${attempt} failed for page ${page}:`, e);
        if (attempt >= MAX_RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }
  
  console.log(`Successfully fetched all ${allRows.length} records`);
  return { data: allRows, totalCount: total };
}

export function useExternalStaff(): UseExternalStaffReturn {
  console.log("useExternalStaff hook initialized");
  
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StaffStatus>("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
  
  console.log("Current state:", { 
    externalStaffCount: externalStaff.length, 
    loading, 
    error, 
    totalCount 
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // cancel previous in-flight
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      console.log(`Loading external staff with status: ${status}`);
      
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.id || "Not authenticated");
      
      // Use the paginated function to fetch ALL records
      console.log("Fetching all records with pagination...");
      const { data: allData, totalCount: total } = await fetchAllRowsPaginated(status, abortRef.current.signal);
      
      console.log(`Paginated query result: ${allData.length} records out of ${total} total`);
      
      setExternalStaff(allData as FrontendExternalStaff[]);
      setTotalCount(total);
      console.log(`Successfully loaded ${allData.length} records`);
      
      // Calculate and update stats after loading data
      await fetchStats();
      
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Load external staff error:", e);
        setError(e.message || "Failed to load external staff");
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Load data on mount and when status changes
  useEffect(() => {
    console.log("useEffect triggered - loading data");
    load();
  }, [load]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      console.log("Fetching stats using paginated approach...");
      
      // Use the paginated function to get ALL records for accurate stats
      const { data: allStaff, totalCount } = await fetchAllRowsPaginated("all");
      
      if (!allStaff || allStaff.length === 0) {
        console.log("No data for stats calculation");
        return;
      }
      
      console.log(`Calculating stats for ${allStaff.length} records out of ${totalCount} total`);
      
      // Use the totalCount from the paginated fetch for accurate counts
      const total = totalCount;
      const terminated = allStaff.filter(item => item["TERMINATION DATE"]).length;
      const active = total - terminated;
      
      console.log(`Stats calculation: total=${total}, active=${active}, terminated=${terminated}`);
      
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
        let dept = '';
        
        if (item["BUSINESS UNIT"] && typeof item["BUSINESS UNIT"] === 'string') {
          dept = item["BUSINESS UNIT"];
        } else if (item["HOME DEPARTMENT"] && typeof item["HOME DEPARTMENT"] === 'string') {
          dept = item["HOME DEPARTMENT"];
        } else if (item["LOCATION"] && typeof item["LOCATION"] === 'string') {
          dept = item["LOCATION"];
        } else if (item["COMPANY CODE"] && typeof item["COMPANY CODE"] === 'string') {
          dept = item["COMPANY CODE"];
        } else if (item["JOB CLASS"] && typeof item["JOB CLASS"] === 'string') {
          dept = item["JOB CLASS"];
        }
        
        // Only count records that have actual department values
        if (dept && dept.trim() !== '') {
          acc[dept] = (acc[dept] || 0) + 1;
        }
        return acc;
      }, {});
      
      const topDepartments = Object.entries(departmentCounts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 departments
      
      console.log("Stats calculated:", { total, active, terminated, newThisMonth });
      
      // Set the stats state with consistent values across all fields
      const updatedStats = {
        total: totalCount,
        active,
        terminated,
        newThisMonth,
        activeCount: active,
        terminatedCount: terminated,
        recentHiresCount: newThisMonth,
        totalCount: totalCount,
        topDepartments,
      };
      
      console.log('Updated stats:', updatedStats);
      setStats(updatedStats);
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
        .insert(data as any);
      
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

  const updateExternalStaff = useCallback(async (id: string, data: Partial<ExternalStaff>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
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

  // Bulk delete multiple external staff records in a single operation
  const bulkDeleteExternalStaff = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      if (!ids.length) {
        console.warn("No IDs provided for bulk deletion");
        return false;
      }

      console.log(`Attempting to delete ${ids.length} external staff records`);
      
      // Use the .in() filter for efficient bulk deletion
      const { error, count } = await supabase
        .from(TABLE_NAME)
        .delete()
        .in('id', ids)
        .select('count');
      
      if (error) {
        console.error("Bulk delete external staff error:", error);
        toast.error("Failed to delete selected external staff records");
        return false;
      }
      
      toast.success(`Successfully deleted ${count || ids.length} external staff records`);
      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Bulk delete external staff error:", e);
      toast.error("Failed to delete selected external staff records");
      return false;
    }
  }, [load, fetchStats]);

  // Define the key fields that trigger change detection
  const CHANGE_DETECTION_FIELDS = ["JOB TITLE", "HOME DEPARTMENT", "LOCATION", "POSITION STATUS"] as const;

  // Helper function to check if key fields have changed
  const hasKeyFieldsChanged = (
    existing: FrontendExternalStaff,
    incoming: CreateExternalStaff
  ): boolean => {
    return CHANGE_DETECTION_FIELDS.some(field => {
      const existingValue = existing[field]?.trim() || "";
      const incomingValue = incoming[field]?.trim() || "";
      return existingValue !== incomingValue;
    });
  };

  // Helper function to move staff to history table
  const moveToHistory = async (staff: FrontendExternalStaff): Promise<void> => {
    try {
      // Create history record without id, created_at, updated_at
      const historyData = {
        business_key: staff.business_key,
        "PAYROLL FIRST NAME": staff["PAYROLL FIRST NAME"],
        "PAYROLL LAST NAME": staff["PAYROLL LAST NAME"],
        "PAYROLL MIDDLE NAME": staff["PAYROLL MIDDLE NAME"],
        "GENERATION SUFFIX": staff["GENERATION SUFFIX"],
        "GENDER (SELF-ID)": staff["GENDER (SELF-ID)"],
        "BIRTH DATE": staff["BIRTH DATE"],
        "PRIMARY ADDRESS LINE 1": staff["PRIMARY ADDRESS LINE 1"],
        "PRIMARY ADDRESS LINE 2": staff["PRIMARY ADDRESS LINE 2"],
        "PRIMARY ADDRESS LINE 3": staff["PRIMARY ADDRESS LINE 3"],
        "LIVED-IN STATE": staff["LIVED-IN STATE"],
        "WORKED IN STATE": staff["WORKED IN STATE"],
        "PERSONAL E-MAIL": staff["PERSONAL E-MAIL"],
        "WORK E-MAIL": staff["WORK E-MAIL"],
        "HOME PHONE": staff["HOME PHONE"],
        "WORK PHONE": staff["WORK PHONE"],
        "POSITION ID": staff["POSITION ID"],
        "ASSOCIATE ID": staff["ASSOCIATE ID"],
        "FILE NUMBER": staff["FILE NUMBER"],
        "COMPANY CODE": staff["COMPANY CODE"],
        "JOB TITLE": staff["JOB TITLE"],
        "BUSINESS UNIT": staff["BUSINESS UNIT"],
        "HOME DEPARTMENT": staff["HOME DEPARTMENT"],
        "LOCATION": staff["LOCATION"],
        "WORKER CATEGORY": staff["WORKER CATEGORY"],
        "POSITION STATUS": staff["POSITION STATUS"],
        "HIRE DATE": staff["HIRE DATE"],
        "REHIRE DATE": staff["REHIRE DATE"],
        "TERMINATION DATE": staff["TERMINATION DATE"],
        "YEARS OF SERVICE": staff["YEARS OF SERVICE"],
        "REPORTS TO NAME": staff["REPORTS TO NAME"],
        "JOB CLASS": staff["JOB CLASS"],
      };

      const { error } = await supabase
        .from("history_external_staff")
        .insert(historyData as any);

      if (error) {
        console.error("Error moving staff to history:", error);
        throw error;
      }
    } catch (error) {
      console.error("Move to history error:", error);
      throw error;
    }
  };

  // Bulk upsert with automatic change detection via database trigger
  const bulkUpsertExternalStaff = useCallback(async (data: CreateExternalStaff[]): Promise<boolean> => {
    try {
      console.log(`Starting bulk upsert for ${data.length} records`);

      // Step 1: Add business keys to data for upsert
      const dataWithKeys = data.map(record => {
        const positionId = record["POSITION ID"];
        const hireDate = record["HIRE DATE"];
        
        let businessKey: string;
        if (positionId && positionId.trim() !== "") {
          businessKey = `${positionId}_${hireDate}`;
        } else {
          const firstName = record["PAYROLL FIRST NAME"] || "";
          const lastName = record["PAYROLL LAST NAME"] || "";
          const associateId = record["ASSOCIATE ID"] || "";
          businessKey = `${firstName}_${lastName}_${associateId}_${hireDate}`;
        }
        
        return { ...record, business_key: businessKey };
      });

      // Step 2: Perform the upsert (change detection happens automatically via database trigger)
      const { error: upsertError } = await (supabase as any)
        .from(TABLE_NAME)
        .upsert(dataWithKeys, {
          onConflict: 'business_key',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error("Bulk upsert error:", upsertError);
        toast.error("Failed to process external staff data");
        return false;
      }

      // Show success message
      toast.success(`Successfully processed ${dataWithKeys.length} records. Records with key field changes were automatically archived.`);
      
      // Refresh data
      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Bulk upsert external staff error:", e);
      toast.error("Failed to process external staff data");
      return false;
    }
  }, [load, fetchStats]);

  return {
    externalStaff,
    loading,
    statsLoading,
    error,
    totalCount,
    pagination,
    setPagination,
    status,
    setStatus,
    stats,
    refreshAll: load,
    fetchAllExternalStaff: load,
    fetchExternalStaff: load,
    createExternalStaff,
    bulkCreateExternalStaff: async () => false,
    updateExternalStaff,
    deleteExternalStaff,
    bulkDeleteExternalStaff,
    bulkUpsertExternalStaff,
    fetchStats,
    exportToExcel: () => {},
  };
};
