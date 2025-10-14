import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { PayrollDeduction, CreatePayrollDeduction, UpdatePayrollDeduction } from "@/integration/supabase/types/payroll-deductions";
import { toast } from "sonner";

/**
 * Fetch all payroll deductions with staff information
 */
export const usePayrollDeductions = () => {
  return useQuery({
    queryKey: ["payroll-deductions"],
    queryFn: async (): Promise<PayrollDeduction[]> => {
      // First get payroll deductions
      const { data: deductions, error: deductionsError } = await (supabase
        .from("payroll_deductions") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (deductionsError) {
        console.error("Error fetching payroll deductions:", deductionsError);
        throw deductionsError;
      }

      if (!deductions || deductions.length === 0) {
        return [];
      }

      // Get unique position IDs
      const positionIds = [...new Set(deductions.map((d: any) => d.position_id))];

      // Fetch staff information for these positions
      const { data: staffData, error: staffError } = await supabase
        .from("external_staff")
        .select('"POSITION ID", "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "HOME DEPARTMENT", "LOCATION"')
        .in('"POSITION ID"', positionIds);

      if (staffError) {
        console.error("Error fetching staff data:", staffError);
        // Continue without staff data rather than failing
      }

      // Map staff data to deductions
      const staffMap = new Map();
      staffData?.forEach((staff: any) => {
        staffMap.set(staff["POSITION ID"], {
          staff_name: `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim(),
          home_department: staff["HOME DEPARTMENT"],
          location: staff["LOCATION"]
        });
      });

      // Combine deductions with staff information
      const enrichedDeductions = deductions.map((deduction: any) => ({
        ...deduction,
        staff_name: staffMap.get(deduction.position_id)?.staff_name || "Unknown",
        home_department: staffMap.get(deduction.position_id)?.home_department || "Unknown",
        location: staffMap.get(deduction.position_id)?.location || "Unknown"
      }));

      return enrichedDeductions;
    },
  });
};

/**
 * Fetch payroll deductions with filters
 */
export const useFilteredPayrollDeductions = (filters?: {
  startPeriod?: string;
  endPeriod?: string;
  positionId?: string;
}) => {
  return useQuery({
    queryKey: ["payroll-deductions", "filtered", filters],
    queryFn: async (): Promise<PayrollDeduction[]> => {
      let query = (supabase
        .from("payroll_deductions") as any)
        .select("*");

      if (filters?.startPeriod) {
        query = query.gte("start_period", filters.startPeriod);
      }

      if (filters?.endPeriod) {
        query = query.lte("end_period", filters.endPeriod);
      }

      if (filters?.positionId) {
        query = query.eq("position_id", filters.positionId);
      }

      query = query.order("created_at", { ascending: false });

      const { data: deductions, error } = await query;

      if (error) {
        console.error("Error fetching filtered payroll deductions:", error);
        throw error;
      }

      if (!deductions || deductions.length === 0) {
        return [];
      }

      // Get unique position IDs
      const positionIds = [...new Set(deductions.map((d: any) => d.position_id))];

      // Fetch staff information for these positions
      const { data: staffData, error: staffError } = await supabase
        .from("external_staff")
        .select('"POSITION ID", "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "HOME DEPARTMENT", "LOCATION"')
        .in('"POSITION ID"', positionIds);

      if (staffError) {
        console.error("Error fetching staff data:", staffError);
        // Continue without staff data rather than failing
      }

      // Map staff data to deductions
      const staffMap = new Map();
      staffData?.forEach((staff: any) => {
        staffMap.set(staff["POSITION ID"], {
          staff_name: `${staff["PAYROLL FIRST NAME"] || ""} ${staff["PAYROLL LAST NAME"] || ""}`.trim(),
          home_department: staff["HOME DEPARTMENT"],
          location: staff["LOCATION"]
        });
      });

      // Combine deductions with staff information
      const enrichedDeductions = deductions.map((deduction: any) => ({
        ...deduction,
        staff_name: staffMap.get(deduction.position_id)?.staff_name || "Unknown",
        home_department: staffMap.get(deduction.position_id)?.home_department || "Unknown",
        location: staffMap.get(deduction.position_id)?.location || "Unknown"
      }));

      return enrichedDeductions;
    },
  });
};

/**
 * Fetch a single payroll deduction by ID
 */
export const usePayrollDeduction = (id: string | undefined) => {
  return useQuery({
    queryKey: ["payroll-deduction", id],
    queryFn: async (): Promise<PayrollDeduction | null> => {
      if (!id) return null;

      const { data, error } = await (supabase
        .from("payroll_deductions") as any)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching payroll deduction:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

/**
 * Create a new payroll deduction
 */
export const useCreatePayrollDeduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deduction: CreatePayrollDeduction): Promise<PayrollDeduction> => {
      const { data, error } = await (supabase
        .from("payroll_deductions") as any)
        .insert(deduction)
        .select()
        .single();

      if (error) {
        console.error("Error creating payroll deduction:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
      toast.success("Payroll deduction created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create payroll deduction: ${error.message}`);
    },
  });
};

/**
 * Update a payroll deduction
 */
export const useUpdatePayrollDeduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdatePayrollDeduction;
    }): Promise<PayrollDeduction> => {
      const { data, error } = await (supabase
        .from("payroll_deductions") as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating payroll deduction:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-deduction", variables.id] });
      toast.success("Payroll deduction updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update payroll deduction: ${error.message}`);
    },
  });
};

/**
 * Delete a payroll deduction
 */
export const useDeletePayrollDeduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Check delete permissions
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      
      if (userEmail !== 'nanasefa@gmail.com') {
        toast.error("Delete operation not authorized. Only nanasefa@gmail.com can perform delete operations.");
        throw new Error("Delete operation not authorized");
      }

      const { error } = await (supabase
        .from("payroll_deductions") as any)
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting payroll deduction:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
      toast.success("Payroll deduction deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete payroll deduction: ${error.message}`);
    },
  });
};

/**
 * Bulk create payroll deductions (for Excel upload)
 */
export const useBulkCreatePayrollDeductions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deductions: CreatePayrollDeduction[]): Promise<PayrollDeduction[]> => {
      // First validate that all position IDs exist in external_staff
      const positionIds = [...new Set(deductions.map(d => d.position_id))];
      console.log("Position IDs to validate:", positionIds.slice(0, 10), "... (showing first 10 of", positionIds.length, ")");
      
      const { data: existingStaff, error: staffError } = await supabase
        .from("external_staff")
        .select('"POSITION ID"')
        .in('"POSITION ID"', positionIds);

      if (staffError) {
        console.error("Error validating position IDs:", staffError);
        throw new Error("Failed to validate position IDs against staff records");
      }

      console.log("Found existing staff records:", existingStaff?.length);
      console.log("Sample existing position IDs:", existingStaff?.slice(0, 5).map(s => s["POSITION ID"]));

      const existingPositionIds = new Set(existingStaff?.map((s: any) => s["POSITION ID"]) || []);
      const invalidPositionIds = positionIds.filter(id => !existingPositionIds.has(id));

      console.log("Invalid position IDs:", invalidPositionIds.slice(0, 10));

      if (invalidPositionIds.length > 0) {
        throw new Error(`Invalid position IDs found: ${invalidPositionIds.slice(0, 5).join(", ")}${invalidPositionIds.length > 5 ? ` and ${invalidPositionIds.length - 5} more` : ""}. These positions do not exist in staff records.`);
      }

      // Based on the errors we've seen, we know the table has a payroll_name column
      // Let's prepare the data with the fields we know are needed
      console.log("Preparing data with known required fields");

      // If validation passes, prepare data for insertion
      // Only add fields that we know exist or are part of our expected structure
      const deductionsWithDefaults = deductions.map(deduction => {
        const baseDeduction: any = {
          position_id: deduction.position_id,
          bcd_bus_card_deduction: deduction.bcd_bus_card_deduction || 0,
          hdd_hang_dep_ded_deduction: deduction.hdd_hang_dep_ded_deduction || 0,
          rnt_rent_deduction: deduction.rnt_rent_deduction || 0,
          trn_transport_subs_deduction: deduction.trn_transport_subs_deduction || 0,
          start_period: deduction.start_period,
          end_period: deduction.end_period,
        };

        // Add fields that we know are required based on the error messages
        // From the errors, we know payroll_name is required
        baseDeduction.payroll_name = deduction.position_id;

        return baseDeduction;
      });

      console.log("Sample deduction object being inserted:", deductionsWithDefaults[0]);
      const { data, error } = await (supabase
        .from("payroll_deductions") as any)
        .insert(deductionsWithDefaults)
        .select();

      if (error) {
        console.error("Error bulk creating payroll deductions:", error);
        throw error;
      }

      return data || [];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
      toast.success(`Successfully created ${data.length} payroll deduction records`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create payroll deductions: ${error.message}`);
    },
  });
};
