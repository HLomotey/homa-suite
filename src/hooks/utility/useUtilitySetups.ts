/**
 * Custom React Query hooks for utility setups
 * These hooks provide data fetching and mutation capabilities for utility setups
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as utilityApi from "./api";
import { FrontendUtilitySetup } from "@/integration/supabase/types/utility";

// Query keys
const UTILITY_SETUPS_KEY = "utility-setups";
const UTILITY_SETUPS_BY_PROPERTY_KEY = "utility-setups-by-property";

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
