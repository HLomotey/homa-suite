/**
 * React hook for complaint history
 */

import { useQuery } from "@tanstack/react-query";
import { getComplaintHistory } from "./api";
import { useAuth } from "@/components/auth";

// Hook for fetching complaint history
export const useComplaintHistory = (complaintId?: string) => {
  const { user } = useAuth();
  
  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["complaint-history", complaintId],
    queryFn: () => getComplaintHistory(complaintId!),
    select: (result) => result.data || [],
    enabled: !!complaintId && !!user
  });

  return {
    history,
    isLoading,
    isError,
    error,
    refetch
  };
};
