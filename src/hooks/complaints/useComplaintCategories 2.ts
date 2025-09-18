/**
 * React hooks for complaint categories and subcategories
 */

import { useQuery } from "@tanstack/react-query";
import { getComplaintCategories, getComplaintSubcategories } from "./api";
import { ComplaintAssetType } from "@/integration/supabase/types/complaints";
import { useAuth } from "@/components/auth";

// Hook for fetching complaint categories
export const useComplaintCategories = (assetType?: ComplaintAssetType) => {
  const { user } = useAuth();
  
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["complaint-categories", assetType],
    queryFn: () => getComplaintCategories(assetType),
    select: (result) => result.data || [],
    enabled: !!user
  });

  return {
    categories,
    isLoading,
    isError,
    error,
    refetch
  };
};

// Hook for fetching complaint subcategories by category ID
export const useComplaintSubcategories = (categoryId?: string) => {
  const { user } = useAuth();
  
  const {
    data: subcategories,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["complaint-subcategories", categoryId],
    queryFn: () => getComplaintSubcategories(categoryId!),
    select: (result) => result.data || [],
    enabled: !!categoryId && !!user
  });

  return {
    subcategories,
    isLoading,
    isError,
    error,
    refetch
  };
};
