import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { FrontendPayroll, mapDatabasePayrollToFrontend, Payroll } from '@/integration/supabase/types/billing';
import { toast } from 'sonner';

export interface PayrollFilters {
  staffId?: string;
  payPeriod?: string;
  startDate?: string;
  endDate?: string;
}

export interface PayrollStats {
  totalRecords: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalRent: number;
  totalTransport: number;
  totalPenalties: number;
}

export const usePayroll = (filters?: PayrollFilters) => {
  const [payrollData, setPayrollData] = useState<FrontendPayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PayrollStats>({
    totalRecords: 0,
    totalRegularHours: 0,
    totalOvertimeHours: 0,
    totalRent: 0,
    totalTransport: 0,
    totalPenalties: 0,
  });

  // Fetch all payroll data with staff information
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("get_payroll_with_staff");

      if (error) {
        throw error;
      }

      if (data) {
        // Map database results to frontend format
        const mappedData = data.map((record: any) =>
          mapDatabasePayrollToFrontend(
            record,
            record.staff_name,
            record.employee_id
          )
        );

        // Apply filters if provided
        let filteredData = mappedData;

        if (filters?.staffId) {
          filteredData = filteredData.filter(
            (record) => record.staffId === filters.staffId
          );
        }

        if (filters?.payPeriod) {
          filteredData = filteredData.filter((record) =>
            record.payPeriod
              .toLowerCase()
              .includes(filters.payPeriod!.toLowerCase())
          );
        }

        if (filters?.startDate) {
          filteredData = filteredData.filter(
            (record) => new Date(record.payDate) >= new Date(filters.startDate!)
          );
        }

        if (filters?.endDate) {
          filteredData = filteredData.filter(
            (record) => new Date(record.payDate) <= new Date(filters.endDate!)
          );
        }

        setPayrollData(filteredData);

        // Calculate stats
        const newStats: PayrollStats = {
          totalRecords: filteredData.length,
          totalRegularHours: filteredData.reduce(
            (sum, record) => sum + (record.regularHours || 0),
            0
          ),
          totalOvertimeHours: filteredData.reduce(
            (sum, record) => sum + (record.overtimeHours || 0),
            0
          ),
          totalRent: filteredData.reduce(
            (sum, record) => sum + (record.rent || 0),
            0
          ),
          totalTransport: filteredData.reduce(
            (sum, record) => sum + (record.transport || 0),
            0
          ),
          totalPenalties: filteredData.reduce(
            (sum, record) => sum + (record.penalties || 0),
            0
          ),
        };
        setStats(newStats);
      }
    } catch (err) {
      console.error("Error fetching payroll data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch payroll data"
      );
      toast.error("Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  // Create new payroll record
  const createPayrollRecord = async (
    payrollData: Omit<Payroll, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("payroll")
        .insert([payrollData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Payroll record created successfully");
      await fetchPayrollData(); // Refresh data
      return data;
    } catch (err) {
      console.error("Error creating payroll record:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create payroll record";
      toast.error(errorMessage);
      throw err;
    }
  };

  // Update payroll record
  const updatePayrollRecord = async (
    id: string,
    updates: Partial<Omit<Payroll, "id" | "created_at" | "updated_at">>
  ) => {
    try {
      const { data, error } = await supabase
        .from("payroll")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Payroll record updated successfully");
      await fetchPayrollData(); // Refresh data
      return data;
    } catch (err) {
      console.error("Error updating payroll record:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update payroll record";
      toast.error(errorMessage);
      throw err;
    }
  };

  // Delete payroll record
  const deletePayrollRecord = async (id: string) => {
    try {
      const { error } = await supabase.from("payroll").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Payroll record deleted successfully");
      await fetchPayrollData(); // Refresh data
    } catch (err) {
      console.error("Error deleting payroll record:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete payroll record";
      toast.error(errorMessage);
      throw err;
    }
  };

  // Bulk create payroll records (for Excel upload)
  const bulkCreatePayrollRecords = async (
    records: Omit<Payroll, "id" | "created_at" | "updated_at">[]
  ) => {
    try {
      const { data, error } = await supabase
        .from("payroll")
        .insert(records)
        .select();

      if (error) {
        throw error;
      }

      toast.success(`${records.length} payroll records created successfully`);
      await fetchPayrollData(); // Refresh data
      return data;
    } catch (err) {
      console.error("Error bulk creating payroll records:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create payroll records";
      toast.error(errorMessage);
      throw err;
    }
  };

  // Get payroll records for specific staff member
  const getPayrollByStaff = async (staffId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_payroll_by_staff", {
        staff_uuid: staffId,
      });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map((record: any) =>
          mapDatabasePayrollToFrontend(
            record,
            record.staff_name,
            record.employee_id
          )
        );
      }
      return [];
    } catch (err) {
      console.error("Error fetching staff payroll:", err);
      toast.error("Failed to fetch staff payroll data");
      return [];
    }
  };

  // Get payroll records for specific pay period
  const getPayrollByPeriod = async (payPeriod: string) => {
    try {
      const { data, error } = await supabase.rpc("get_payroll_by_period", {
        period_text: payPeriod,
      });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map((record: any) =>
          mapDatabasePayrollToFrontend(
            record,
            record.staff_name,
            record.employee_id
          )
        );
      }
      return [];
    } catch (err) {
      console.error("Error fetching period payroll:", err);
      toast.error("Failed to fetch payroll data for period");
      return [];
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPayrollData();
  }, [filters]);

  return {
    payrollData,
    loading,
    error,
    stats,
    refreshData: fetchPayrollData,
    createPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord,
    bulkCreatePayrollRecords,
    getPayrollByStaff,
    getPayrollByPeriod,
  };
};
