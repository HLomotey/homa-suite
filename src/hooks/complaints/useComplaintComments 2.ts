/**
 * React hooks for complaint comments
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaintComments, addComplaintComment } from "./api";
import { ComplaintComment } from "@/integration/supabase/types/complaints";
import { useAuth } from "@/components/auth";
import { toast } from "@/components/ui/use-toast";

// Hook for fetching and managing comments for a complaint
export const useComplaintComments = (complaintId?: string, includeInternal: boolean = false) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch comments
  const {
    data: comments,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["complaint-comments", complaintId, includeInternal],
    queryFn: () => getComplaintComments(complaintId!, includeInternal),
    select: (result) => result.data || [],
    enabled: !!complaintId && !!user
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentData: { content: string; isInternal: boolean }) => 
      addComplaintComment({
        complaint_id: complaintId!,
        user_id: user?.id!,
        content: commentData.content,
        is_internal: commentData.isInternal,
        attachments: null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint-comments", complaintId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    comments,
    isLoading,
    isError,
    error,
    refetch,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending
  };
};
