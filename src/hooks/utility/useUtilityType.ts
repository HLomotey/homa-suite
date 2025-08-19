/**
 * React hooks for utility types
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FrontendUtilityType } from "@/integration/supabase/types/utility";
import {
  fetchUtilityTypes,
  fetchUtilityTypeById,
  createUtilityType,
  updateUtilityType,
  deleteUtilityType
} from "./api";

/**
 * Hook to fetch all utility types
 */
export const useUtilityTypes = () => {
  return useQuery({
    queryKey: ["utilityTypes"],
    queryFn: fetchUtilityTypes
  });
};

/**
 * Hook to fetch a single utility type by ID
 */
export const useUtilityType = (id: string) => {
  return useQuery({
    queryKey: ["utilityType", id],
    queryFn: () => fetchUtilityTypeById(id),
    enabled: !!id
  });
};

/**
 * Hook to create a new utility type
 */
export const useCreateUtilityType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (utilityTypeData: Omit<FrontendUtilityType, "id">) =>
      createUtilityType(utilityTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityTypes"] });
    }
  });
};

/**
 * Hook to update an existing utility type
 */
export const useUpdateUtilityType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      utilityTypeData
    }: {
      id: string;
      utilityTypeData: Partial<Omit<FrontendUtilityType, "id">>;
    }) => updateUtilityType(id, utilityTypeData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["utilityTypes"] });
      queryClient.invalidateQueries({ queryKey: ["utilityType", variables.id] });
    }
  });
};

/**
 * Hook to delete a utility type
 */
export const useDeleteUtilityType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUtilityType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilityTypes"] });
    }
  });
};
