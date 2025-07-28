/**
 * Billing API functions for Supabase integration
 * These functions handle direct communication with Supabase for billing data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Bill,
  BillingStaff,
  BillingStats,
  FrontendBill,
  FrontendBillingStaff,
  FrontendBillingStats,
  mapDatabaseBillToFrontend,
  mapDatabaseBillingStaffToFrontend,
  mapDatabaseBillingStatsToFrontend,
  BillStatus,
  BillType
} from "../../integration/supabase/types";

/**
 * Fetch all bills from Supabase
 * @returns Promise with array of bills
 */
export const fetchBills = async (): Promise<FrontendBill[]> => {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bills:", error);
    throw new Error(error.message);
  }

  return (data as Bill[]).map(mapDatabaseBillToFrontend);
};

/**
 * Fetch a single bill by ID
 * @param id Bill ID
 * @returns Promise with bill data
 */
export const fetchBillById = async (
  id: string
): Promise<FrontendBill> => {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching bill with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseBillToFrontend(data as Bill);
};

/**
 * Create a new bill
 * @param bill Bill data to create
 * @returns Promise with created bill data
 */
export const createBill = async (
  bill: Omit<FrontendBill, "id">
): Promise<FrontendBill> => {
  // Convert frontend bill to database format
  const dbBill = {
    staff_id: bill.staffId,
    amount: bill.amount,
    type: bill.type,
    status: bill.status,
    due_date: bill.dueDate,
    description: bill.description || null
  };

  const { data, error } = await supabase
    .from("bills")
    .insert(dbBill)
    .select()
    .single();

  if (error) {
    console.error("Error creating bill:", error);
    throw new Error(error.message);
  }

  return mapDatabaseBillToFrontend(data as Bill);
};

/**
 * Update an existing bill
 * @param id Bill ID
 * @param bill Bill data to update
 * @returns Promise with updated bill data
 */
export const updateBill = async (
  id: string,
  bill: Partial<Omit<FrontendBill, "id">>
): Promise<FrontendBill> => {
  // Convert frontend bill to database format
  const dbBill: any = {};
  
  if (bill.staffId !== undefined) dbBill.staff_id = bill.staffId;
  if (bill.amount !== undefined) dbBill.amount = bill.amount;
  if (bill.type !== undefined) dbBill.type = bill.type;
  if (bill.status !== undefined) dbBill.status = bill.status;
  if (bill.dueDate !== undefined) dbBill.due_date = bill.dueDate;
  if (bill.description !== undefined) dbBill.description = bill.description || null;

  const { data, error } = await supabase
    .from("bills")
    .update(dbBill)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating bill with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseBillToFrontend(data as Bill);
};

/**
 * Delete a bill
 * @param id Bill ID
 * @returns Promise with success status
 */
export const deleteBill = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("bills")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting bill with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch bills by status
 * @param status Bill status to filter by
 * @returns Promise with array of bills
 */
export const fetchBillsByStatus = async (
  status: BillStatus
): Promise<FrontendBill[]> => {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching bills with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Bill[]).map(mapDatabaseBillToFrontend);
};

/**
 * Fetch bills by type
 * @param type Bill type to filter by
 * @returns Promise with array of bills
 */
export const fetchBillsByType = async (
  type: BillType
): Promise<FrontendBill[]> => {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching bills with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as Bill[]).map(mapDatabaseBillToFrontend);
};

/**
 * Fetch bills by staff ID
 * @param staffId Staff ID to filter by
 * @returns Promise with array of bills
 */
export const fetchBillsByStaff = async (
  staffId: string
): Promise<FrontendBill[]> => {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching bills for staff ${staffId}:`, error);
    throw new Error(error.message);
  }

  return (data as Bill[]).map(mapDatabaseBillToFrontend);
};

/**
 * Fetch all billing staff
 * @returns Promise with array of billing staff
 */
export const fetchBillingStaff = async (): Promise<FrontendBillingStaff[]> => {
  const { data, error } = await supabase
    .from("billing_staff")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching billing staff:", error);
    throw new Error(error.message);
  }

  return (data as BillingStaff[]).map(mapDatabaseBillingStaffToFrontend);
};

/**
 * Fetch billing stats
 * @param month Month to filter by (format: 'YYYY-MM')
 * @param year Year to filter by
 * @returns Promise with billing stats
 */
export const fetchBillingStats = async (
  month?: string,
  year?: number
): Promise<FrontendBillingStats> => {
  let query = supabase.from("billing_stats").select("*");
  
  if (month) {
    query = query.eq("month", month);
  }
  
  if (year) {
    query = query.eq("year", year);
  }
  
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching billing stats:", error);
    throw new Error(error.message);
  }

  return mapDatabaseBillingStatsToFrontend(data as BillingStats);
};
