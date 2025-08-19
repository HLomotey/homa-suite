/**
 * Custom hooks for utility bills management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { FrontendUtilitySetup } from "@/integration/supabase/types/utility";
import { mapDatabaseUtilitySetupToFrontend } from "@/integration/supabase/types/utility";
import { toast } from "sonner";

// Simplified fetch function to avoid the 400 error
const fetchUtilityBills = async (): Promise<FrontendUtilitySetup[]> => {
  try {
    // First, fetch the basic utility setups data
    const { data: setupsData, error: setupsError } = await supabase
      .from("utility_setups")
      .select("*")
      .order("created_at");

    if (setupsError) {
      throw new Error(`Error fetching utility setups: ${setupsError.message}`);
    }

    // Map the data to frontend format
    const bills = setupsData.map(mapDatabaseUtilitySetupToFrontend);

    // Fetch utility types separately
    const { data: typesData, error: typesError } = await supabase
      .from("utility_types")
      .select("*");

    if (typesError) {
      throw new Error(`Error fetching utility types: ${typesError.message}`);
    }

    // Fetch properties separately
    const { data: propertiesData, error: propertiesError } = await supabase
      .from("properties")
      .select("id, title");

    if (propertiesError) {
      throw new Error(`Error fetching properties: ${propertiesError.message}`);
    }

    // Enrich the bills with utility type names and property names
    return bills.map(bill => {
      const utilityType = typesData.find(type => type.id === bill.utilityTypeId);
      const property = propertiesData.find(prop => prop.id === bill.propertyId);
      
      return {
        ...bill,
        utilityTypeName: utilityType?.name || '',
        propertyName: property?.title || ''
      };
    });
  } catch (error) {
    console.error("Error in fetchUtilityBills:", error);
    throw error;
  }
};

// Hook to fetch utility bills
export const useUtilityBills = () => {
  return useQuery({
    queryKey: ["utilityBills"],
    queryFn: fetchUtilityBills
  });
};

// Hook to create a utility bill
export const useCreateUtilityBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billData: Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">) => {
      const { data, error } = await supabase
        .from("utility_setups")
        .insert({
          property_id: billData.propertyId,
          utility_type_id: billData.utilityTypeId,
          billing_period_id: billData.billingPeriodId,
          billing_date: billData.billingDate,
          billing_amount: billData.billingAmount,
          meter_number: billData.meterNumber,
          account_number: billData.accountNumber,
          is_active: billData.isActive,
          notes: billData.notes
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating utility bill: ${error.message}`);
      }

      return mapDatabaseUtilitySetupToFrontend(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
      toast.success("Utility bill created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create utility bill: ${error.message}`);
    }
  });
};

// Hook to update a utility bill
export const useUpdateUtilityBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      billData 
    }: { 
      id: string; 
      billData: Partial<Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">> 
    }) => {
      const updateData: any = {};
      
      if (billData.propertyId !== undefined) updateData.property_id = billData.propertyId;
      if (billData.utilityTypeId !== undefined) updateData.utility_type_id = billData.utilityTypeId;
      if (billData.billingPeriodId !== undefined) updateData.billing_period_id = billData.billingPeriodId;
      if (billData.billingDate !== undefined) updateData.billing_date = billData.billingDate;
      if (billData.billingAmount !== undefined) updateData.billing_amount = billData.billingAmount;
      if (billData.meterNumber !== undefined) updateData.meter_number = billData.meterNumber;
      if (billData.accountNumber !== undefined) updateData.account_number = billData.accountNumber;
      if (billData.isActive !== undefined) updateData.is_active = billData.isActive;
      if (billData.notes !== undefined) updateData.notes = billData.notes;

      const { data, error } = await supabase
        .from("utility_setups")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating utility bill: ${error.message}`);
      }

      return mapDatabaseUtilitySetupToFrontend(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
      toast.success("Utility bill updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update utility bill: ${error.message}`);
    }
  });
};

// Hook to delete a utility bill
export const useDeleteUtilityBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("utility_setups")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Error deleting utility bill: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityBills"] });
      toast.success("Utility bill deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete utility bill: ${error.message}`);
    }
  });
};
