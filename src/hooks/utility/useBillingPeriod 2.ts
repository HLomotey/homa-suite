/**
 * React hooks for billing periods
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FrontendBillingPeriod } from "@/integration/supabase/types/utility";
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
