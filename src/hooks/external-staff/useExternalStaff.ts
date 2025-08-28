// hooks/external-staff/useExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendExternalStaff, CreateExternalStaff, CreateHistoryExternalStaff } from '@/integration/supabase/types/external-staff';
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
  fetchStats: () => Promise<void>;
  exportToExcel: (filteredData?: FrontendExternalStaff[]) => void;
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

  // Helper function to check if key fields have changed
  const hasKeyFieldsChanged = (existing: FrontendExternalStaff, incoming: CreateExternalStaff): boolean => {
    return CHANGE_DETECTION_FIELDS.some(field => {
      const existingValue = existing[field];
      const incomingValue = incoming[field];
      return existingValue !== incomingValue;
    });
  };

  // Helper function to find existing staff by unique identifier (using POSITION ID + HIRE DATE as composite key)
  const findExistingStaff = async (staffData: CreateExternalStaff[]): Promise<Map<string, FrontendExternalStaff>> => {
    const existingStaffMap = new Map<string, FrontendExternalStaff>();
    
    // Fetch existing staff records
    const { data: existingStaff, error } = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error("Error fetching existing staff:", error);
      return existingStaffMap;
    }

    // Map existing staff by composite key (POSITION ID + HIRE DATE)
    existingStaff?.forEach(staff => {
      const positionId = staff["POSITION ID"];
      const hireDate = staff["HIRE DATE"];
      
      if (positionId && positionId.trim() !== "") {
        // Primary key: position ID + hire date
        const compositeKey = `${positionId.trim()}_${hireDate || ""}`;
        existingStaffMap.set(compositeKey, staff);
        
        // Also map by position ID alone for backward compatibility
        existingStaffMap.set(`pos_${positionId.trim()}`, staff);
      } else {
        // Fallback mapping by name + associate ID + hire date
        const firstName = staff["PAYROLL FIRST NAME"] || "";
        const lastName = staff["PAYROLL LAST NAME"] || "";
        const associateId = staff["ASSOCIATE ID"] || "";
        const compositeKey = `name_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${associateId}_${hireDate || ""}`;
        existingStaffMap.set(compositeKey, staff);
      }
    });

    return existingStaffMap;
  };

  // Helper function to move staff to history table
  const moveToHistory = async (staffRecord: FrontendExternalStaff): Promise<boolean> => {
    try {
      // Create history record (exclude id, created_at, updated_at as they'll be auto-generated)
      const historyRecord: CreateHistoryExternalStaff = {
        "PAYROLL FIRST NAME": staffRecord["PAYROLL FIRST NAME"],
        "PAYROLL LAST NAME": staffRecord["PAYROLL LAST NAME"],
        "PAYROLL MIDDLE NAME": staffRecord["PAYROLL MIDDLE NAME"],
        "GENERATION SUFFIX": staffRecord["GENERATION SUFFIX"],
        "GENDER (SELF-ID)": staffRecord["GENDER (SELF-ID)"],
        "BIRTH DATE": staffRecord["BIRTH DATE"],
        "PRIMARY ADDRESS LINE 1": staffRecord["PRIMARY ADDRESS LINE 1"],
        "PRIMARY ADDRESS LINE 2": staffRecord["PRIMARY ADDRESS LINE 2"],
        "PRIMARY ADDRESS LINE 3": staffRecord["PRIMARY ADDRESS LINE 3"],
        "LIVED-IN STATE": staffRecord["LIVED-IN STATE"],
        "WORKED IN STATE": staffRecord["WORKED IN STATE"],
        "PERSONAL E-MAIL": staffRecord["PERSONAL E-MAIL"],
        "WORK E-MAIL": staffRecord["WORK E-MAIL"],
        "HOME PHONE": staffRecord["HOME PHONE"],
        "WORK PHONE": staffRecord["WORK PHONE"],
        "POSITION ID": staffRecord["POSITION ID"],
        "ASSOCIATE ID": staffRecord["ASSOCIATE ID"],
        "FILE NUMBER": staffRecord["FILE NUMBER"],
        "COMPANY CODE": staffRecord["COMPANY CODE"],
        "JOB TITLE": staffRecord["JOB TITLE"],
        "BUSINESS UNIT": staffRecord["BUSINESS UNIT"],
        "HOME DEPARTMENT": staffRecord["HOME DEPARTMENT"],
        "LOCATION": staffRecord["LOCATION"],
        "WORKER CATEGORY": staffRecord["WORKER CATEGORY"],
        "POSITION STATUS": staffRecord["POSITION STATUS"],
        "HIRE DATE": staffRecord["HIRE DATE"],
        "REHIRE DATE": staffRecord["REHIRE DATE"],
        "TERMINATION DATE": staffRecord["TERMINATION DATE"],
        "YEARS OF SERVICE": staffRecord["YEARS OF SERVICE"],
        "REPORTS TO NAME": staffRecord["REPORTS TO NAME"],
        "JOB CLASS": staffRecord["JOB CLASS"],
      };

      const { error } = await supabase
        .from(HISTORY_TABLE_NAME)
        .insert(historyRecord);

      if (error) {
        console.error("Error moving staff to history:", error);
        return false;
      }

      return true;
    } catch (e) {
      console.error("Error in moveToHistory:", e);
      return false;
    }
  };

  const bulkUpsertExternalStaff = useCallback(async (data: CreateExternalStaff[]): Promise<boolean> => {
    try {
      console.log(`Starting bulk upsert for ${data.length} records`);

      // Prepare data with business keys for upsert
      const recordsToUpsert = data.map(record => {
        const positionId = record["POSITION ID"];
        const hireDate = record["HIRE DATE"];
        const firstName = record["PAYROLL FIRST NAME"] || "";
        const lastName = record["PAYROLL LAST NAME"] || "";
        const associateId = record["ASSOCIATE ID"] || "";

        // Create stable business key - prioritize POSITION ID + HIRE DATE
        let businessKey: string;
        if (positionId && positionId.trim() !== "") {
          businessKey = `${positionId.trim()}_${hireDate || ""}`;
        } else {
          // Fallback to name + associate ID + hire date
          businessKey = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${associateId}_${hireDate || ""}`;
        }

        return {
          ...record,
          business_key: businessKey
        };
      });

      // Use PostgreSQL UPSERT with ON CONFLICT to maintain stable UUIDs
      // This will update existing records (keeping their UUID) or insert new ones
      const { data: upsertResult, error: upsertError } = await supabase
        .from(TABLE_NAME)
        .upsert(recordsToUpsert, {
          onConflict: 'business_key',
          ignoreDuplicates: false
        })
        .select('id, business_key, "PAYROLL FIRST NAME", "PAYROLL LAST NAME"');

      if (upsertError) {
        console.error("Bulk upsert error:", upsertError);
        toast.error("Failed to process external staff data");
        return false;
      }

      const processedCount = upsertResult?.length || 0;
      
      console.log(`Bulk upsert results:`, {
        totalIncoming: data.length,
        totalProcessed: processedCount,
        upsertResult: upsertResult?.slice(0, 3) // Log first 3 for debugging
      });
      
      toast.success(
        `Successfully processed ${processedCount} staff records using stable business keys`
      );

      await load();
      await fetchStats();
      return true;
    } catch (e: any) {
      console.error("Bulk upsert external staff error:", e);
      toast.error("Failed to process external staff data");
      return false;
    }
  }, [load, fetchStats]);

  const exportToExcel = useCallback((filteredData?: FrontendExternalStaff[]) => {
    try {
      // Use filtered data if provided, otherwise use all current data
      const dataToExport = filteredData || externalStaff;
      
      if (dataToExport.length === 0) {
        toast.warning("No data to export");
        return;
      }

      // Create worksheet data with clean column headers
      const worksheetData = dataToExport.map(staff => ({
        'Payroll Last Name': staff["PAYROLL LAST NAME"] || '',
        'Payroll First Name': staff["PAYROLL FIRST NAME"] || '',
        'Payroll Middle Name': staff["PAYROLL MIDDLE NAME"] || '',
        'Generation Suffix': staff["GENERATION SUFFIX"] || '',
        'Gender (Self-ID)': staff["GENDER (SELF-ID)"] || '',
        'Birth Date': staff["BIRTH DATE"] || '',
        'Primary Address Line 1': staff["PRIMARY ADDRESS LINE 1"] || '',
        'Primary Address Line 2': staff["PRIMARY ADDRESS LINE 2"] || '',
        'Primary Address Line 3': staff["PRIMARY ADDRESS LINE 3"] || '',
        'Lived-In State': staff["LIVED-IN STATE"] || '',
        'Worked In State': staff["WORKED IN STATE"] || '',
        'Personal E-Mail': staff["PERSONAL E-MAIL"] || '',
        'Work E-Mail': staff["WORK E-MAIL"] || '',
        'Home Phone': staff["HOME PHONE"] || '',
        'Work Phone': staff["WORK PHONE"] || '',
        'Position ID': staff["POSITION ID"] || '',
        'Associate ID': staff["ASSOCIATE ID"] || '',
        'File Number': staff["FILE NUMBER"] || '',
        'Company Code': staff["COMPANY CODE"] || '',
        'Job Title': staff["JOB TITLE"] || '',
        'Business Unit': staff["BUSINESS UNIT"] || '',
        'Home Department': staff["HOME DEPARTMENT"] || '',
        'Location': staff["LOCATION"] || '',
        'Worker Category': staff["WORKER CATEGORY"] || '',
        'Position Status': staff["POSITION STATUS"] || '',
        'Hire Date': staff["HIRE DATE"] || '',
        'Rehire Date': staff["REHIRE DATE"] || '',
        'Termination Date': staff["TERMINATION DATE"] || '',
        'Years of Service': staff["YEARS OF SERVICE"] || '',
        'Reports To Name': staff["REPORTS TO NAME"] || '',
        'Job Class': staff["JOB CLASS"] || '',
        'Created At': staff.created_at || '',
        'Updated At': staff.updated_at || ''
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Information');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `staff_information_${currentDate}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Exported ${dataToExport.length} records to ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data to Excel');
    }
  }, [externalStaff]);

  const bulkCreateExternalStaff = useCallback(async (data: CreateExternalStaff[]): Promise<boolean> => {
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
    bulkUpsertExternalStaff,
    updateExternalStaff,
    deleteExternalStaff,
    fetchStats,
    exportToExcel
  };
}
