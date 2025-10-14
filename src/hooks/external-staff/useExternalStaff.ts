// hooks/external-staff/useExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendExternalStaff, CreateExternalStaff, CreateHistoryExternalStaff, ExternalStaff } from '@/integration/supabase/types/external-staff';
import { Database } from '@/integration/supabase/types/database';
import { toast } from "sonner";
import * as ExcelJS from 'exceljs';

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
  exportData: (data: FrontendExternalStaff[], format: string, fields?: string[]) => void;
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
      // Check delete permissions
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      
      if (userEmail !== 'nanasefa@gmail.com') {
        toast.error("Delete operation not authorized. Only nanasefa@gmail.com can perform delete operations.");
        return false;
      }

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
      // Check delete permissions
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      
      if (userEmail !== 'nanasefa@gmail.com') {
        toast.error("Delete operation not authorized. Only nanasefa@gmail.com can perform delete operations.");
        return false;
      }

      if (!ids.length) {
        toast.error("No external staff records selected for deletion");
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

  // Export to Excel functionality
  const exportToExcel = useCallback(async (filteredData?: FrontendExternalStaff[]) => {
    try {
      console.log("Starting Excel export...");
      
      // Use filtered data if provided, otherwise use all current data
      const dataToExport = filteredData || externalStaff;
      
      if (!dataToExport || dataToExport.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('External Staff');

      // Define columns with proper headers and formatting
      const columns = [
        { header: 'Associate ID', key: 'ASSOCIATE ID', width: 15 },
        { header: 'First Name', key: 'PAYROLL FIRST NAME', width: 20 },
        { header: 'Last Name', key: 'PAYROLL LAST NAME', width: 20 },
        { header: 'Middle Name', key: 'PAYROLL MIDDLE NAME', width: 15 },
        { header: 'Job Title', key: 'JOB TITLE', width: 25 },
        { header: 'Company Code', key: 'COMPANY CODE', width: 15 },
        { header: 'Business Unit', key: 'BUSINESS UNIT', width: 20 },
        { header: 'Department', key: 'HOME DEPARTMENT', width: 25 },
        { header: 'Location', key: 'LOCATION', width: 20 },
        { header: 'Position Status', key: 'POSITION STATUS', width: 15 },
        { header: 'Worker Category', key: 'WORKER CATEGORY', width: 15 },
        { header: 'Job Class', key: 'JOB CLASS', width: 15 },
        { header: 'Hire Date', key: 'HIRE DATE', width: 12 },
        { header: 'Rehire Date', key: 'REHIRE DATE', width: 12 },
        { header: 'Termination Date', key: 'TERMINATION DATE', width: 15 },
        { header: 'Years of Service', key: 'YEARS OF SERVICE', width: 15 },
        { header: 'Reports To', key: 'REPORTS TO NAME', width: 25 },
        { header: 'Work Email', key: 'WORK E-MAIL', width: 30 },
        { header: 'Personal Email', key: 'PERSONAL E-MAIL', width: 30 },
        { header: 'Home Phone', key: 'HOME PHONE', width: 15 },
        { header: 'Work Phone', key: 'WORK PHONE', width: 15 },
        { header: 'Address Line 1', key: 'PRIMARY ADDRESS LINE 1', width: 30 },
        { header: 'Address Line 2', key: 'PRIMARY ADDRESS LINE 2', width: 30 },
        { header: 'Address Line 3', key: 'PRIMARY ADDRESS LINE 3', width: 30 },
        { header: 'State (Lived)', key: 'LIVED-IN STATE', width: 15 },
        { header: 'State (Worked)', key: 'WORKED IN STATE', width: 15 },
        { header: 'Position ID', key: 'POSITION ID', width: 15 },
        { header: 'File Number', key: 'FILE NUMBER', width: 15 },
        { header: 'Status', key: 'STATUS', width: 12 },
      ];

      worksheet.columns = columns;

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;

      // Add data rows
      dataToExport.forEach((staff, index) => {
        const rowData = {
          'ASSOCIATE ID': staff['ASSOCIATE ID'] || '',
          'PAYROLL FIRST NAME': staff['PAYROLL FIRST NAME'] || '',
          'PAYROLL LAST NAME': staff['PAYROLL LAST NAME'] || '',
          'PAYROLL MIDDLE NAME': staff['PAYROLL MIDDLE NAME'] || '',
          'JOB TITLE': staff['JOB TITLE'] || '',
          'COMPANY CODE': staff['COMPANY CODE'] || '',
          'BUSINESS UNIT': staff['BUSINESS UNIT'] || '',
          'HOME DEPARTMENT': staff['HOME DEPARTMENT'] || '',
          'LOCATION': staff['LOCATION'] || '',
          'POSITION STATUS': staff['POSITION STATUS'] || '',
          'WORKER CATEGORY': staff['WORKER CATEGORY'] || '',
          'JOB CLASS': staff['JOB CLASS'] || '',
          'HIRE DATE': staff['HIRE DATE'] ? new Date(staff['HIRE DATE']).toLocaleDateString() : '',
          'REHIRE DATE': staff['REHIRE DATE'] ? new Date(staff['REHIRE DATE']).toLocaleDateString() : '',
          'TERMINATION DATE': staff['TERMINATION DATE'] ? new Date(staff['TERMINATION DATE']).toLocaleDateString() : '',
          'YEARS OF SERVICE': staff['YEARS OF SERVICE'] || '',
          'REPORTS TO NAME': staff['REPORTS TO NAME'] || '',
          'WORK E-MAIL': staff['WORK E-MAIL'] || '',
          'PERSONAL E-MAIL': staff['PERSONAL E-MAIL'] || '',
          'HOME PHONE': staff['HOME PHONE'] || '',
          'WORK PHONE': staff['WORK PHONE'] || '',
          'PRIMARY ADDRESS LINE 1': staff['PRIMARY ADDRESS LINE 1'] || '',
          'PRIMARY ADDRESS LINE 2': staff['PRIMARY ADDRESS LINE 2'] || '',
          'PRIMARY ADDRESS LINE 3': staff['PRIMARY ADDRESS LINE 3'] || '',
          'LIVED-IN STATE': staff['LIVED-IN STATE'] || '',
          'WORKED IN STATE': staff['WORKED IN STATE'] || '',
          'POSITION ID': staff['POSITION ID'] || '',
          'FILE NUMBER': staff['FILE NUMBER'] || '',
          'STATUS': staff['TERMINATION DATE'] ? 'Terminated' : 'Active',
        };

        const row = worksheet.addRow(rowData);
        
        // Alternate row colors for better readability
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8F9FA' }
          };
        }

        // Color code status
        const statusCell = row.getCell('STATUS');
        if (staff['TERMINATION DATE']) {
          statusCell.font = { color: { argb: 'DC3545' }, bold: true };
        } else {
          statusCell.font = { color: { argb: '28A745' }, bold: true };
        }
      });

      // Add borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Auto-fit columns (with max width limit)
      worksheet.columns.forEach(column => {
        if (column.width && column.width > 50) {
          column.width = 50;
        }
      });

      // Add summary information at the top
      worksheet.insertRow(1, []);
      worksheet.insertRow(1, [`Export Date: ${new Date().toLocaleString()}`]);
      worksheet.insertRow(1, [`Total Records: ${dataToExport.length}`]);
      worksheet.insertRow(1, [`Status Filter: ${status.charAt(0).toUpperCase() + status.slice(1)}`]);
      worksheet.insertRow(1, ['External Staff Export Report']);
      
      // Style the summary rows
      for (let i = 1; i <= 5; i++) {
        const summaryRow = worksheet.getRow(i);
        summaryRow.font = { bold: true };
        if (i === 1) {
          summaryRow.font = { bold: true, size: 16, color: { argb: '366092' } };
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `external-staff-export-${status}-${timestamp}.xlsx`;

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${dataToExport.length} records to Excel`);
      console.log(`Excel export completed: ${filename}`);
      
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export data to Excel');
    }
  }, [externalStaff, status]);

  // Generic export function that supports multiple formats
  const exportData = useCallback(async (data: FrontendExternalStaff[], format: string, fields?: string[]) => {
    try {
      console.log(`Starting ${format} export...`);
      
      if (!data || data.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const fieldsToExport = fields || [
        'ASSOCIATE ID', 'PAYROLL FIRST NAME', 'PAYROLL LAST NAME', 'JOB TITLE',
        'COMPANY CODE', 'HOME DEPARTMENT', 'LOCATION', 'HIRE DATE', 'TERMINATION DATE'
      ];

      // Generate timestamp for filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      if (format === 'excel') {
        // Use the existing Excel export function
        await exportToExcel(data);
        return;
      }

      // Prepare data with selected fields only
      const exportData = data.map(staff => {
        const row: any = {};
        fieldsToExport.forEach(field => {
          let value = staff[field as keyof FrontendExternalStaff] || '';
          
          // Format dates
          if (field.includes('DATE') && value) {
            try {
              value = new Date(value as string).toLocaleDateString();
            } catch {
              // Keep original value if date parsing fails
            }
          }
          
          // Clean field name for headers
          const cleanFieldName = field.replace(/"/g, '').replace(/_/g, ' ');
          row[cleanFieldName] = value;
        });
        
        // Add computed status field
        row['Status'] = staff['TERMINATION DATE'] ? 'Terminated' : 'Active';
        return row;
      });

      if (format === 'csv') {
        // Generate CSV
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => {
              const value = row[header] || '';
              // Escape commas and quotes in CSV
              return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                ? `"${value.replace(/"/g, '""')}"` 
                : value;
            }).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const filename = `external-staff-export-${status}-${timestamp}.csv`;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      } else if (format === 'json') {
        // Generate JSON
        const jsonContent = JSON.stringify({
          exportInfo: {
            exportDate: new Date().toISOString(),
            totalRecords: exportData.length,
            statusFilter: status,
            fields: fieldsToExport
          },
          data: exportData
        }, null, 2);

        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const filename = `external-staff-export-${status}-${timestamp}.json`;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Successfully exported ${exportData.length} records as ${format.toUpperCase()}`);
      console.log(`${format} export completed`);
      
    } catch (error) {
      console.error(`${format} export error:`, error);
      toast.error(`Failed to export data as ${format.toUpperCase()}`);
    }
  }, [exportToExcel, status]);

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
    exportToExcel,
    exportData,
  };
};
