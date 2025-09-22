/**
 * Staff Transaction Log React hooks for data fetching and management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStaffTransactionHistory,
  fetchStaffTransactionLogs,
  createStaffTransactionLog,
  getStaffTransactionSummary,
  deleteStaffTransactionLog,
  getStaffWithTransactionLogs,
} from "./api";
import {
  FrontendStaffTransactionLog,
  CreateStaffTransactionLog,
  StaffTransactionLogFilters,
} from "../../integration/supabase/types/staffTransactionLog";

/**
 * Hook to fetch staff transaction history (consolidated view from all sources)
 */
export const useStaffTransactionHistory = (staffId?: string) => {
  return useQuery({
    queryKey: ["staffTransactionHistory", staffId],
    queryFn: () => fetchStaffTransactionHistory(staffId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to fetch staff transaction logs (from staff_transaction_log table only)
 */
export const useStaffTransactionLogs = (filters?: StaffTransactionLogFilters) => {
  return useQuery({
    queryKey: ["staffTransactionLogs", filters],
    queryFn: () => fetchStaffTransactionLogs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to get staff transaction summary/statistics
 */
export const useStaffTransactionSummary = (staffId: string) => {
  return useQuery({
    queryKey: ["staffTransactionSummary", staffId],
    queryFn: () => getStaffTransactionSummary(staffId),
    enabled: !!staffId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to get staff members who have transaction logs
 */
export const useStaffWithTransactionLogs = () => {
  return useQuery({
    queryKey: ["staffWithTransactionLogs"],
    queryFn: getStaffWithTransactionLogs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to create a new staff transaction log entry
 */
export const useCreateStaffTransactionLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionLog: CreateStaffTransactionLog) =>
      createStaffTransactionLog(transactionLog),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["staffTransactionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["staffTransactionLogs"] });
      queryClient.invalidateQueries({ 
        queryKey: ["staffTransactionSummary", data.staffId] 
      });
      queryClient.invalidateQueries({ queryKey: ["staffWithTransactionLogs"] });
    },
    onError: (error) => {
      console.error("Error creating staff transaction log:", error);
    },
  });
};

/**
 * Hook to delete a staff transaction log entry
 */
export const useDeleteStaffTransactionLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStaffTransactionLog(id),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["staffTransactionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["staffTransactionLogs"] });
      queryClient.invalidateQueries({ queryKey: ["staffTransactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["staffWithTransactionLogs"] });
    },
    onError: (error) => {
      console.error("Error deleting staff transaction log:", error);
    },
  });
};

/**
 * Hook to log a billing transaction
 */
export const useLogBillingTransaction = () => {
  const createLog = useCreateStaffTransactionLog();

  return {
    logBillCreated: (staffId: string, staffName: string, billData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'billing',
        transactionCategory: 'created',
        description: `Bill created: ${billData.type} - $${billData.amount}`,
        amount: billData.amount,
        referenceId: billData.id,
        referenceTable: 'bills',
        metadata: billData,
      });
    },
    logBillPayment: (staffId: string, staffName: string, billData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'billing',
        transactionCategory: 'payment',
        description: `Bill payment: ${billData.type} - $${billData.amount}`,
        amount: billData.amount,
        referenceId: billData.id,
        referenceTable: 'bills',
        metadata: billData,
      });
    },
    logBillUpdated: (staffId: string, staffName: string, billData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'billing',
        transactionCategory: 'updated',
        description: `Bill updated: ${billData.type} - $${billData.amount}`,
        amount: billData.amount,
        referenceId: billData.id,
        referenceTable: 'bills',
        metadata: billData,
      });
    },
    isLoading: createLog.isPending,
    error: createLog.error,
  };
};

/**
 * Hook to log a payroll transaction
 */
export const useLogPayrollTransaction = () => {
  const createLog = useCreateStaffTransactionLog();

  return {
    logPayrollCreated: (staffId: string, staffName: string, payrollData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'payroll',
        transactionCategory: 'created',
        description: `Payroll created: ${payrollData.pay_period} - ${payrollData.regular_hours}h regular, ${payrollData.overtime_hours}h overtime`,
        amount: payrollData.total_amount,
        referenceId: payrollData.id,
        referenceTable: 'payroll',
        metadata: payrollData,
      });
    },
    logPayrollPayment: (staffId: string, staffName: string, payrollData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'payroll',
        transactionCategory: 'payment',
        description: `Payroll payment: ${payrollData.pay_period} - $${payrollData.total_amount}`,
        amount: payrollData.total_amount,
        referenceId: payrollData.id,
        referenceTable: 'payroll',
        metadata: payrollData,
      });
    },
    isLoading: createLog.isPending,
    error: createLog.error,
  };
};

/**
 * Hook to log an assignment transaction
 */
export const useLogAssignmentTransaction = () => {
  const createLog = useCreateStaffTransactionLog();

  return {
    logAssignmentCreated: (staffId: string, staffName: string, assignmentData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'assignment',
        transactionCategory: 'created',
        description: `Room assignment created: ${assignmentData.property_name} - ${assignmentData.room_name}`,
        amount: assignmentData.rent_amount,
        referenceId: assignmentData.id,
        referenceTable: 'assignments',
        metadata: assignmentData,
      });
    },
    logAssignmentUpdated: (staffId: string, staffName: string, assignmentData: any) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'assignment',
        transactionCategory: 'updated',
        description: `Room assignment updated: ${assignmentData.property_name} - ${assignmentData.room_name} (${assignmentData.status})`,
        amount: assignmentData.rent_amount,
        referenceId: assignmentData.id,
        referenceTable: 'assignments',
        metadata: assignmentData,
      });
    },
    logAssignmentStatusChange: (staffId: string, staffName: string, assignmentData: any, oldStatus: string, newStatus: string) => {
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'assignment',
        transactionCategory: 'assignment_change',
        description: `Assignment status changed: ${assignmentData.property_name} - ${assignmentData.room_name} from ${oldStatus} to ${newStatus}`,
        amount: assignmentData.rent_amount,
        referenceId: assignmentData.id,
        referenceTable: 'assignments',
        metadata: { ...assignmentData, oldStatus, newStatus },
      });
    },
    isLoading: createLog.isPending,
    error: createLog.error,
  };
};

/**
 * Hook to log a profile update transaction
 */
export const useLogProfileTransaction = () => {
  const createLog = useCreateStaffTransactionLog();

  return {
    logProfileUpdated: (staffId: string, staffName: string, changes: Record<string, any>) => {
      const changedFields = Object.keys(changes).join(', ');
      return createLog.mutate({
        staffId,
        staffName,
        transactionType: 'profile_update',
        transactionCategory: 'updated',
        description: `Profile updated: ${changedFields}`,
        referenceId: staffId,
        referenceTable: 'billing_staff',
        metadata: { changes },
      });
    },
    isLoading: createLog.isPending,
    error: createLog.error,
  };
};
