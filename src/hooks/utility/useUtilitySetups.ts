/**
 * Custom React Query hooks for utility setups
 * These hooks provide data fetching and mutation capabilities for utility setups
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as utilityApi from "./api";
import { 
  FrontendUtilitySetup, 
  FrontendStandardizedBillingPeriod,
  StandardizedBillingPeriod,
  mapDatabaseStandardizedBillingPeriodToFrontend
} from "@/integration/supabase/types/utility";
import { supabase } from "@/integration/supabase/client";

// Query keys
const UTILITY_SETUPS_KEY = "utility-setups";
const UTILITY_SETUPS_BY_PROPERTY_KEY = "utility-setups-by-property";
const STANDARDIZED_BILLING_PERIODS_KEY = "standardized-billing-periods";
const CURRENT_BILLING_PERIOD_KEY = "current-billing-period";
const UTILITY_SETUPS_BY_BILLING_PERIOD_KEY = "utility-setups-by-billing-period";

/**
 * Hook for fetching all utility setups
 * @returns Query result with utility setups data
 */
export const useUtilitySetups = () => {
  return useQuery({
    queryKey: [UTILITY_SETUPS_KEY],
    queryFn: async () => {
      try {
        return await utilityApi.fetchUtilitySetups();
      } catch (error) {
        console.error("Error fetching utility setups:", error);
        throw error;
      }
    },
  });
};

/**
 * Hook for fetching utility setups by property ID
 * @param propertyId The property ID to filter by
 * @returns Query result with utility setups data for the specified property
 */
export const useUtilitySetupsByProperty = (propertyId: string) => {
  return useQuery({
    queryKey: [UTILITY_SETUPS_BY_PROPERTY_KEY, propertyId],
    queryFn: async () => {
      try {
        return await utilityApi.fetchUtilitySetupsByProperty(propertyId);
      } catch (error) {
        console.error(`Error fetching utility setups for property ${propertyId}:`, error);
        throw error;
      }
    },
    enabled: !!propertyId, // Only run the query if propertyId is provided
  });
};

/**
 * Hook for creating a new utility setup
 * @returns Mutation function and state for creating a utility setup
 */
export const useCreateUtilitySetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (utilitySetupData: Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">) => {
      return utilityApi.createUtilitySetup(utilitySetupData);
    },
    onSuccess: () => {
      // Invalidate and refetch utility setups queries
      queryClient.invalidateQueries({ queryKey: [UTILITY_SETUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UTILITY_SETUPS_BY_PROPERTY_KEY] });
    },
  });
};

/**
 * Hook for updating an existing utility setup
 * @returns Mutation function and state for updating a utility setup
 */
export const useUpdateUtilitySetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, utilitySetupData }: { 
      id: string; 
      utilitySetupData: Partial<Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">>
    }) => {
      return utilityApi.updateUtilitySetup(id, utilitySetupData);
    },
    onSuccess: () => {
      // Invalidate and refetch utility setups queries
      queryClient.invalidateQueries({ queryKey: [UTILITY_SETUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UTILITY_SETUPS_BY_PROPERTY_KEY] });
    },
  });
};

/**
 * Hook for deleting a utility setup
 * @returns Mutation function and state for deleting a utility setup
 */
export const useDeleteUtilitySetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return utilityApi.deleteUtilitySetup(id);
    },
    onSuccess: () => {
      // Invalidate and refetch utility setups queries
      queryClient.invalidateQueries({ queryKey: [UTILITY_SETUPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UTILITY_SETUPS_BY_PROPERTY_KEY] });
    },
  });
};

// Use the standardized billing period type from utility types

interface CurrentBillingPeriod {
  periodId: string;
  periodName: string;
  periodType: 'first_half' | 'second_half';
  periodStartDate: string;
  periodEndDate: string;
}

/**
 * Hook for fetching all standardized billing periods (1st-15th, 16th-end)
 * @returns Query result with standardized billing periods data
 */
export const useStandardizedBillingPeriods = () => {
  return useQuery({
    queryKey: [STANDARDIZED_BILLING_PERIODS_KEY],
    queryFn: async (): Promise<FrontendStandardizedBillingPeriod[]> => {
      try {
        const { data, error } = await supabase
          .from("billing_periods_with_dates")
          .select("*")
          .eq("is_active", true)
          .order("period_type");

        if (error) {
          throw new Error(`Error fetching billing periods: ${error.message}`);
        }

        return data.map((item: any) => {
          const mapped = mapDatabaseStandardizedBillingPeriodToFrontend(item as StandardizedBillingPeriod);
          return {
            ...mapped,
            currentPeriodStart: item.current_period_start,
            currentPeriodEnd: item.current_period_end,
          };
        });
      } catch (error) {
        console.error("Error fetching billing periods:", error);
        throw error;
      }
    },
  });
};

/**
 * Hook for fetching the current billing period based on today's date
 * @returns Query result with current billing period data
 */
export const useCurrentBillingPeriod = () => {
  return useQuery({
    queryKey: [CURRENT_BILLING_PERIOD_KEY],
    queryFn: async (): Promise<CurrentBillingPeriod | null> => {
      try {
        const { data, error } = await (supabase as any)
          .rpc("get_current_billing_period");

        if (error) {
          throw new Error(`Error fetching current billing period: ${error.message}`);
        }

        if (!data || data.length === 0) {
          return null;
        }

        const period = data[0];
        return {
          periodId: period.period_id,
          periodName: period.period_name,
          periodType: period.period_type,
          periodStartDate: period.period_start_date,
          periodEndDate: period.period_end_date,
        };
      } catch (error) {
        console.error("Error fetching current billing period:", error);
        throw error;
      }
    },
  });
};

/**
 * Hook for fetching billing period for a specific date
 * @param date The date to get billing period for
 * @returns Query result with billing period data for the specified date
 */
export const useBillingPeriodForDate = (date: string) => {
  return useQuery({
    queryKey: [CURRENT_BILLING_PERIOD_KEY, date],
    queryFn: async (): Promise<CurrentBillingPeriod | null> => {
      try {
        const { data, error } = await (supabase as any)
          .rpc("get_billing_period_for_date", { target_date: date });

        if (error) {
          throw new Error(`Error fetching billing period for date: ${error.message}`);
        }

        if (!data || data.length === 0) {
          return null;
        }

        const period = data[0];
        return {
          periodId: period.period_id,
          periodName: period.period_name,
          periodType: period.period_type,
          periodStartDate: period.period_start_date,
          periodEndDate: period.period_end_date,
        };
      } catch (error) {
        console.error("Error fetching billing period for date:", error);
        throw error;
      }
    },
    enabled: !!date, // Only run the query if date is provided
  });
};

/**
 * Hook for fetching utility setups filtered by billing period
 * @param periodType The billing period type ('first_half' or 'second_half')
 * @param startDate The start date of the billing period
 * @param endDate The end date of the billing period
 * @returns Query result with utility setups data for the specified billing period
 */
export const useUtilitySetupsByBillingPeriod = (
  periodType: 'first_half' | 'second_half',
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: [UTILITY_SETUPS_BY_BILLING_PERIOD_KEY, periodType, startDate, endDate],
    queryFn: async (): Promise<FrontendUtilitySetup[]> => {
      try {
        let query = supabase
          .from("utility_setups")
          .select(`
            *,
            utility_types(name),
            properties:property_id(title)
          `)
          .eq("is_active", true);

        // Filter by billing date if provided
        if (startDate && endDate) {
          query = query
            .gte("billing_date", startDate)
            .lte("billing_date", endDate);
        }

        const { data, error } = await query.order("created_at");

        if (error) {
          throw new Error(`Error fetching utility setups by billing period: ${error.message}`);
        }

        return data.map((item: any) => ({
          id: item.id,
          propertyId: item.property_id,
          utilityTypeId: item.utility_type_id,
          billingPeriodId: item.billing_period_id || '',
          meterNumber: item.meter_number,
          accountNumber: item.account_number,
          providerName: item.provider_name,
          providerContact: item.provider_contact,
          billingAmount: item.billing_amount,
          billingDate: item.billing_date,
          isActive: item.is_active,
          notes: item.notes,
          utilityTypeName: item.utility_types?.name || '',
          propertyName: item.properties?.title || '',
        }));
      } catch (error) {
        console.error("Error fetching utility setups by billing period:", error);
        throw error;
      }
    },
    enabled: !!periodType, // Only run the query if periodType is provided
  });
};
