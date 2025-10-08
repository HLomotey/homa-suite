/**
 * Staff Transaction Log API functions for Supabase integration
 * These functions handle direct communication with Supabase for staff transaction log data
 */

import { supabase } from "../../integration/supabase/client";
import {
  StaffTransactionLog,
  FrontendStaffTransactionLog,
  CreateStaffTransactionLog,
  StaffTransactionLogFilters,
  mapDatabaseStaffTransactionLogToFrontend,
  mapFrontendStaffTransactionLogToDatabase,
} from "../../integration/supabase/types/staffTransactionLog";

/**
 * Fetch staff transaction history using the database function
 * @param staffId Optional staff ID to filter by specific staff member
 * @returns Promise with array of staff transaction logs
 */
export const fetchStaffTransactionHistory = async (
  staffId?: string
): Promise<FrontendStaffTransactionLog[]> => {
  try {
    const { data, error } = await supabase.rpc('get_staff_transaction_history', {
      staff_uuid: staffId || null
    });

    if (error) {
      console.error("Error fetching staff transaction history:", error);
      throw new Error(error.message);
    }

    // Map the data to frontend format
    return (data || []).map((item: any) => ({
      id: item.id,
      staffId: item.staff_id,
      staffName: item.staff_name,
      transactionType: item.transaction_type,
      transactionCategory: item.transaction_category,
      description: item.description,
      amount: item.amount,
      referenceId: item.reference_id,
      referenceTable: item.reference_table,
      metadata: item.metadata,
      performedBy: item.performed_by,
      performedByName: item.performed_by_name,
      timestamp: item.transaction_timestamp,
      createdAt: item.transaction_timestamp, // Use timestamp as created_at for consistency
    }));
  } catch (error) {
    console.error("Error in fetchStaffTransactionHistory:", error);
    throw error;
  }
};

/**
 * Fetch staff transaction logs from the staff_transaction_log table only
 * @param filters Optional filters for the query
 * @returns Promise with array of staff transaction logs
 */
export const fetchStaffTransactionLogs = async (
  filters?: StaffTransactionLogFilters
): Promise<FrontendStaffTransactionLog[]> => {
  try {
    let query = supabase
      .from("staff_transaction_log")
      .select("*")
      .order("timestamp", { ascending: false });

    // Apply filters
    if (filters?.staffId) {
      query = query.eq("staff_id", filters.staffId);
    }
    if (filters?.transactionType) {
      query = query.eq("transaction_type", filters.transactionType);
    }
    if (filters?.transactionCategory) {
      query = query.eq("transaction_category", filters.transactionCategory);
    }
    if (filters?.startDate) {
      query = query.gte("timestamp", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("timestamp", filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching staff transaction logs:", error);
      throw new Error(error.message);
    }

    return (data as StaffTransactionLog[]).map(mapDatabaseStaffTransactionLogToFrontend);
  } catch (error) {
    console.error("Error in fetchStaffTransactionLogs:", error);
    throw error;
  }
};

/**
 * Create a new staff transaction log entry
 * @param transactionLog Transaction log data to create
 * @returns Promise with created transaction log
 */
export const createStaffTransactionLog = async (
  transactionLog: CreateStaffTransactionLog
): Promise<FrontendStaffTransactionLog> => {
  try {
    const dbTransactionLog = mapFrontendStaffTransactionLogToDatabase(transactionLog);

    const { data, error } = await supabase
      .from("staff_transaction_log")
      .insert(dbTransactionLog)
      .select()
      .single();

    if (error) {
      console.error("Error creating staff transaction log:", error);
      throw new Error(error.message);
    }

    return mapDatabaseStaffTransactionLogToFrontend(data as StaffTransactionLog);
  } catch (error) {
    console.error("Error in createStaffTransactionLog:", error);
    throw error;
  }
};

/**
 * Get staff transaction summary/statistics
 * @param staffId Staff ID to get summary for
 * @returns Promise with transaction summary
 */
export const getStaffTransactionSummary = async (staffId: string) => {
  try {
    // Get transaction counts by type
    const { data: typeData, error: typeError } = await supabase
      .from("staff_transaction_log")
      .select("transaction_type")
      .eq("staff_id", staffId);

    if (typeError) {
      console.error("Error fetching transaction type summary:", typeError);
      throw new Error(typeError.message);
    }

    // Get transaction counts by category
    const { data: categoryData, error: categoryError } = await supabase
      .from("staff_transaction_log")
      .select("transaction_category")
      .eq("staff_id", staffId);

    if (categoryError) {
      console.error("Error fetching transaction category summary:", categoryError);
      throw new Error(categoryError.message);
    }

    // Get total amount and last activity
    const { data: summaryData, error: summaryError } = await supabase
      .from("staff_transaction_log")
      .select("amount, timestamp")
      .eq("staff_id", staffId)
      .order("timestamp", { ascending: false });

    if (summaryError) {
      console.error("Error fetching transaction summary:", summaryError);
      throw new Error(summaryError.message);
    }

    // Calculate summary statistics
    const totalTransactions = summaryData?.length || 0;
    const totalAmount = summaryData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const lastActivity = summaryData?.[0]?.timestamp || '';

    // Count transactions by type
    const transactionsByType = (typeData || []).reduce((acc, item) => {
      acc[item.transaction_type] = (acc[item.transaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count transactions by category
    const transactionsByCategory = (categoryData || []).reduce((acc, item) => {
      acc[item.transaction_category] = (acc[item.transaction_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTransactions,
      totalAmount,
      lastActivity,
      transactionsByType,
      transactionsByCategory,
    };
  } catch (error) {
    console.error("Error in getStaffTransactionSummary:", error);
    throw error;
  }
};

/**
 * Delete a staff transaction log entry
 * @param id Transaction log ID to delete
 * @returns Promise with success status
 */
export const deleteStaffTransactionLog = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("staff_transaction_log")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting staff transaction log:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in deleteStaffTransactionLog:", error);
    throw error;
  }
};

/**
 * Get unique staff members who have transaction logs
 * @returns Promise with array of staff members
 */
export const getStaffWithTransactionLogs = async () => {
  try {
    const { data, error } = await supabase
      .from("staff_transaction_log")
      .select("staff_id, staff_name")
      .order("staff_name");

    if (error) {
      console.error("Error fetching staff with transaction logs:", error);
      throw new Error(error.message);
    }

    // Remove duplicates and return unique staff members
    const uniqueStaff = (data || []).reduce((acc, item) => {
      if (!acc.find(staff => staff.staff_id === item.staff_id)) {
        acc.push(item);
      }
      return acc;
    }, [] as Array<{ staff_id: string; staff_name: string }>);

    return uniqueStaff.map(staff => ({
      id: staff.staff_id,
      name: staff.staff_name,
    }));
  } catch (error) {
    console.error("Error in getStaffWithTransactionLogs:", error);
    throw error;
  }
};
