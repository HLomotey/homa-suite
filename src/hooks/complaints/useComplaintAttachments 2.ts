/**
 * React hooks for complaint attachments
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaintAttachments, uploadComplaintAttachment } from "./api";
import { useAuth } from "@/components/auth";
import { toast } from "@/components/ui/use-toast";

// Hook for fetching and managing attachments for a complaint
export const useComplaintAttachments = (complaintId?: string, includeInternal: boolean = false) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch attachments
  const {
    data: attachments,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["complaint-attachments", complaintId, includeInternal],
    queryFn: () => getComplaintAttachments(complaintId!, includeInternal),
    select: (result) => result.data || [],
    enabled: !!complaintId && !!user
  });

  // Upload attachment mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ file, isInternal }: { file: File; isInternal: boolean }) => 
      uploadComplaintAttachment(file, complaintId!, user?.id!, isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint-attachments", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    attachments,
    isLoading,
    isError,
    error,
    refetch,
    uploadAttachment: uploadAttachmentMutation.mutate,
    isUploading: uploadAttachmentMutation.isPending
  };
};
