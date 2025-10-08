/**
 * React hooks for utility payments
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FrontendUtilitySetup } from "@/integration/supabase/types/utility";
import {
  fetchUtilitySetups,
  fetchUtilitySetupsByProperty,
  fetchUtilitySetupById,
  createUtilitySetup,
  updateUtilitySetup,
  deleteUtilitySetup
} from "./api";

// Define a new interface for utility bills
export interface UtilityBill {
  id: string;
  propertyId: string;
  propertyName?: string;
  utilityTypeId: string;
  utilityTypeName?: string;
  amount: number;
  billingPeriodId: string;
  billingPeriodName?: string;
  billingDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  notes?: string;
}

/**
 * Hook to fetch all utility bills
 */
export const useUtilityBills = () => {
  return useQuery({
    queryKey: ["utilityBills"],
    queryFn: fetchUtilitySetups
  });
};

/**
 * Hook to fetch utility bills by property ID
 */
export const useUtilityBillsByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: ["utilityBills", "property", propertyId],
    queryFn: () => fetchUtilitySetupsByProperty(propertyId),
    enabled: !!propertyId
  });
};

/**
 * Hook to fetch a single utility bill by ID
 */
export const useUtilityBill = (id: string) => {
  return useQuery({
    queryKey: ["utilityBill", id],
    queryFn: () => fetchUtilitySetupById(id),
    enabled: !!id
  });
};

/**
 * Hook to create a new utility bill
 */
export const useCreateUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billData: Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">) =>
      createUtilitySetup({
        ...billData,
        isActive: true,
        meterNumber: null,
        accountNumber: null,
        providerName: null,
        providerContact: null
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
      queryClient.invalidateQueries({ queryKey: ["utilityBills", "property", data.propertyId] });
    }
  });
};

/**
 * Hook to update an existing utility bill
 */
export const useUpdateUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      billData
    }: {
      id: string;
      billData: Partial<Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">>;
    }) => updateUtilitySetup(id, billData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
      queryClient.invalidateQueries({ queryKey: ["utilityBill", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["utilityBills", "property", data.propertyId] });
    }
  });
};

/**
 * Hook to delete a utility bill
 */
export const useDeleteUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUtilitySetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
    }
  });
};

/**
 * Hook to mark a utility bill as paid
 */
export const useMarkBillAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateUtilitySetup(id, { 
      notes: "PAID: " + new Date().toISOString() 
    }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
      queryClient.invalidateQueries({ queryKey: ["utilityBill", variables] });
      queryClient.invalidateQueries({ queryKey: ["utilityBills", "property", data.propertyId] });
    }
  });
};
