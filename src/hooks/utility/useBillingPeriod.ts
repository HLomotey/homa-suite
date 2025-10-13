/**
 * React hooks for billing periods
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FrontendBillingPeriod } from "@/integration/supabase/types/utility";
import { supabase } from "@/integration/supabase/client";
import {
  fetchBillingPeriods,
  fetchBillingPeriodById,
  createBillingPeriod,
  updateBillingPeriod,
  deleteBillingPeriod
} from "./api";

/**
 * Hook to fetch all billing periods
 */
export const useBillingPeriods = () => {
  return useQuery({
    queryKey: ["billingPeriods"],
    queryFn: fetchBillingPeriods
  });
};

/**
 * Hook to fetch active billing periods with additional status info
 */
export const useActiveBillingPeriods = () => {
  return useQuery({
    queryKey: ["activeBillingPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_billing_periods")
        .select("*")
        .order("start_date");

      if (error) {
        throw new Error(`Error fetching active billing periods: ${error.message}`);
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        isRecurring: item.is_recurring,
        recurrenceType: item.recurrence_type,
        periodStatusRelative: item.period_status_relative,
        durationDays: item.duration_days,
        daysElapsed: item.days_elapsed,
        daysRemaining: item.days_remaining,
      }));
    }
  });
};

/**
 * Hook to fetch current billing period
 */
export const useCurrentBillingPeriod = () => {
  return useQuery({
    queryKey: ["currentBillingPeriod"],
    queryFn: async () => {
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
        id: period.period_id,
        name: period.period_name,
        startDate: period.period_start_date,
        endDate: period.period_end_date,
        status: period.period_status,
      };
    }
  });
};

/**
 * Hook to fetch a single billing period by ID
 */
export const useBillingPeriod = (id: string) => {
  return useQuery({
    queryKey: ["billingPeriod", id],
    queryFn: () => fetchBillingPeriodById(id),
    enabled: !!id
  });
};

/**
 * Hook to create a new billing period
 */
export const useCreateBillingPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billingPeriodData: Omit<FrontendBillingPeriod, "id">) =>
      createBillingPeriod(billingPeriodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingPeriods"] });
    }
  });
};

/**
 * Hook to update an existing billing period
 */
export const useUpdateBillingPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      billingPeriodData
    }: {
      id: string;
      billingPeriodData: Partial<Omit<FrontendBillingPeriod, "id">>;
    }) => updateBillingPeriod(id, billingPeriodData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["billingPeriods"] });
      queryClient.invalidateQueries({ queryKey: ["billingPeriod", variables.id] });
    }
  });
};

/**
 * Hook to delete a billing period
 */
export const useDeleteBillingPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBillingPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billingPeriods"] });
    }
  });
};
