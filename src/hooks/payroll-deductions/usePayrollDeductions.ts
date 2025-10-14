import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { PayrollDeduction, CreatePayrollDeduction, UpdatePayrollDeduction } from "@/integration/supabase/types/payroll-deductions";
import { toast } from "sonner";

/**
 * Fetch all payroll deductions
 */
export const usePayrollDeductions = () => {
  return useQuery({
    queryKey: ["payroll-deductions"],
    queryFn: async (): Promise<PayrollDeduction[]> => {
      const { data, error } = await (supabase
        .from("payroll_deductions") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payroll deductions:", error);
        throw error;
      }

      return data || [];
    },
  });
};

/**
 * Fetch payroll deductions with filters
 */
export const useFilteredPayrollDeductions = (filters?: {
  startPeriod?: string;
  endPeriod?: string;
  companyCode?: string;
  payrollName?: string;
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

      if (filters?.companyCode) {
        query = query.eq("payroll_company_code", filters.companyCode);
      }

      if (filters?.payrollName) {
        query = query.ilike("payroll_name", `%${filters.payrollName}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching filtered payroll deductions:", error);
        throw error;
      }

      return data || [];
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
      const { data, error } = await (supabase
        .from("payroll_deductions") as any)
        .insert(deductions)
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
