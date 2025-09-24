// hooks/external-staff/useHistoricalExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendHistoryExternalStaff } from '@/integration/supabase/types/external-staff';
import { toast } from "sonner";
import * as ExcelJS from 'exceljs';

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
  deleteHistoricalStaff: (id: string) => Promise<void>;
  exportToExcel: (filteredData?: FrontendHistoryExternalStaff[]) => void;
  exportData: (data: FrontendHistoryExternalStaff[], format: string, fields?: string[]) => void;
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

  const deleteHistoricalStaff = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from(HISTORY_TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting historical staff:", error);
        toast.error("Failed to delete historical staff record");
        throw error;
      }

      toast.success("Historical staff record deleted successfully");
      await refreshAll(); // Refresh the data after deletion
    } catch (error: any) {
      console.error("Delete historical staff error:", error);
      throw error;
    }
  }, [refreshAll]);

  // Export to Excel functionality for historical data
  const exportToExcel = useCallback(async (filteredData?: FrontendHistoryExternalStaff[]) => {
    try {
      console.log("Starting historical Excel export...");
      
      // Use filtered data if provided, otherwise use all current data
      const dataToExport = filteredData || historicalStaff;
      
      if (!dataToExport || dataToExport.length === 0) {
        toast.error("No historical data available to export");
        return;
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Historical External Staff');

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
        { header: 'Archived Date', key: 'created_at', width: 15 },
        { header: 'Status', key: 'STATUS', width: 12 },
      ];

      worksheet.columns = columns;

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'B8860B' } // Different color for historical data
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
          'created_at': staff.created_at ? new Date(staff.created_at).toLocaleDateString() : '',
          'STATUS': 'Historical Record',
        };

        const row = worksheet.addRow(rowData);
        
        // Alternate row colors for better readability
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8DC' } // Light historical color
          };
        }

        // Color code status for historical records
        const statusCell = row.getCell('STATUS');
        statusCell.font = { color: { argb: 'B8860B' }, bold: true };
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
      worksheet.insertRow(1, [`Total Historical Records: ${dataToExport.length}`]);
      worksheet.insertRow(1, ['Historical External Staff Export Report']);
      
      // Style the summary rows
      for (let i = 1; i <= 4; i++) {
        const summaryRow = worksheet.getRow(i);
        summaryRow.font = { bold: true };
        if (i === 1) {
          summaryRow.font = { bold: true, size: 16, color: { argb: 'B8860B' } };
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `historical-external-staff-export-${timestamp}.xlsx`;

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

      toast.success(`Successfully exported ${dataToExport.length} historical records to Excel`);
      console.log(`Historical Excel export completed: ${filename}`);
      
    } catch (error) {
      console.error('Historical Excel export error:', error);
      toast.error('Failed to export historical data to Excel');
    }
  }, [historicalStaff]);

  // Generic export function that supports multiple formats for historical data
  const exportData = useCallback(async (data: FrontendHistoryExternalStaff[], format: string, fields?: string[]) => {
    try {
      console.log(`Starting historical ${format} export...`);
      
      if (!data || data.length === 0) {
        toast.error("No historical data available to export");
        return;
      }

      const fieldsToExport = fields || [
        'ASSOCIATE ID', 'PAYROLL FIRST NAME', 'PAYROLL LAST NAME', 'JOB TITLE',
        'COMPANY CODE', 'HOME DEPARTMENT', 'LOCATION', 'HIRE DATE', 'TERMINATION DATE', 'created_at'
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
          let value = staff[field as keyof FrontendHistoryExternalStaff] || '';
          
          // Format dates
          if (field.includes('DATE') || field === 'created_at') {
            if (value) {
              try {
                value = new Date(value as string).toLocaleDateString();
              } catch {
                // Keep original value if date parsing fails
              }
            }
          }
          
          // Clean field name for headers
          const cleanFieldName = field.replace(/"/g, '').replace(/_/g, ' ');
          row[cleanFieldName] = value;
        });
        
        // Add computed status field
        row['Status'] = 'Historical Record';
        row['Record Type'] = 'Archived';
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
        const filename = `historical-external-staff-export-${timestamp}.csv`;
        
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
            recordType: 'historical',
            fields: fieldsToExport
          },
          data: exportData
        }, null, 2);

        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const filename = `historical-external-staff-export-${timestamp}.json`;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Successfully exported ${exportData.length} historical records as ${format.toUpperCase()}`);
      console.log(`Historical ${format} export completed`);
      
    } catch (error) {
      console.error(`Historical ${format} export error:`, error);
      toast.error(`Failed to export historical data as ${format.toUpperCase()}`);
    }
  }, [exportToExcel]);

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
    deleteHistoricalStaff,
    exportToExcel,
    exportData,
  };
}
