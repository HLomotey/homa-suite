/**
 * React hooks for the complaints management module
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getComplaints, 
  getComplaintById, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint,
  checkAndUpdateSLAs
} from "./api";
import { 
  Complaint, 
  FrontendComplaint, 
  ComplaintStatus, 
  ComplaintPriority, 
  ComplaintAssetType 
} from "@/integration/supabase/types/complaints";
import { useAuth } from "@/components/auth";
import { toast } from "@/components/ui/use-toast";

// Hook for fetching complaints with filters
export const useComplaints = (
  filters?: {
    status?: ComplaintStatus | ComplaintStatus[];
    priority?: ComplaintPriority | ComplaintPriority[];
    assetType?: ComplaintAssetType;
    categoryId?: string;
    assignedTo?: string;
    createdBy?: string;
    search?: string;
  }
) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Create a stable query key based on filters
  const queryKey = useCallback(() => {
    const key = ["complaints"];
    if (filters) {
      if (filters.status) key.push(`status:${Array.isArray(filters.status) ? filters.status.join(",") : filters.status}`);
      if (filters.priority) key.push(`priority:${Array.isArray(filters.priority) ? filters.priority.join(",") : filters.priority}`);
      if (filters.assetType) key.push(`assetType:${filters.assetType}`);
      if (filters.categoryId) key.push(`categoryId:${filters.categoryId}`);
      if (filters.assignedTo) key.push(`assignedTo:${filters.assignedTo}`);
      if (filters.createdBy) key.push(`createdBy:${filters.createdBy}`);
      if (filters.search) key.push(`search:${filters.search}`);
    }
    return key;
  }, [filters]);

  // Fetch complaints
  const {
    data: complaints,
    isLoading: isLoadingComplaints,
    isError: isErrorComplaints,
    error: errorComplaints,
    refetch: refetchComplaints
  } = useQuery({
    queryKey: queryKey(),
    queryFn: () => getComplaints(filters),
    select: (result) => result.data || [],
    enabled: !!user
  });

  // Create complaint mutation
  const createComplaintMutation = useMutation({
    mutationFn: (newComplaint: Omit<Complaint, "id" | "created_at" | "updated_at" | "sla_breach">) => 
      createComplaint(newComplaint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast({
        title: "Complaint Created",
        description: "Your complaint has been submitted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create complaint: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update complaint mutation
  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Complaint, "id" | "created_at" | "updated_at">> }) => 
      updateComplaint(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", data.data?.id] });
      toast({
        title: "Complaint Updated",
        description: "The complaint has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update complaint: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete complaint mutation
  const deleteComplaintMutation = useMutation({
    mutationFn: (id: string) => deleteComplaint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast({
        title: "Complaint Deleted",
        description: "The complaint has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete complaint: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Check and update SLAs
  const checkSLAsMutation = useMutation({
    mutationFn: checkAndUpdateSLAs,
    onSuccess: (data) => {
      if (data.updated > 0) {
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        toast({
          title: "SLA Check Complete",
          description: `${data.updated} complaints have breached SLA and been escalated.`,
          variant: "default",
        });
      }
    }
  });

  // Group complaints by status for Kanban view
  const groupedComplaints = useMemo(() => {
    if (!complaints) return {};
    
    return complaints.reduce<Record<string, FrontendComplaint[]>>((acc, complaint) => {
      const status = complaint.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(complaint);
      return acc;
    }, {});
  }, [complaints]);

  return {
    complaints,
    groupedComplaints,
    isLoading: isLoadingComplaints,
    isError: isErrorComplaints,
    error: errorComplaints,
    refetch: refetchComplaints,
    createComplaint: createComplaintMutation.mutate,
    updateComplaint: updateComplaintMutation.mutate,
    deleteComplaint: deleteComplaintMutation.mutate,
    checkSLAs: checkSLAsMutation.mutate,
    isCreating: createComplaintMutation.isPending,
    isUpdating: updateComplaintMutation.isPending,
    isDeleting: deleteComplaintMutation.isPending
  };
};

// Hook for fetching a single complaint by ID
export const useComplaint = (id?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const {
    data: complaint,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaintById(id!),
    select: (result) => result.data,
    enabled: !!id && !!user
  });

  // Update complaint mutation
  const updateComplaintMutation = useMutation({
    mutationFn: (updates: Partial<Omit<Complaint, "id" | "created_at" | "updated_at">>) => 
      updateComplaint(id!, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaint", id] });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast({
        title: "Complaint Updated",
        description: "The complaint has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update complaint: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    complaint,
    isLoading,
    isError,
    error,
    refetch,
    updateComplaint: updateComplaintMutation.mutate,
    isUpdating: updateComplaintMutation.isPending
  };
};
