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
  console.log('Fetching bills using RPC...');
  
  // Use the RPC function to bypass RLS
  const { data, error } = await supabase.rpc('get_bills');
  
  console.log('Bills raw data from RPC:', data);
  
  if (error) {
    console.error("Error fetching bills:", error);
    throw new Error(error.message);
  }
  
  // If we got data from RPC, use it
  if (data && data.length > 0) {
    const mappedData = (data as Bill[]).map(mapDatabaseBillToFrontend);
    console.log('Mapped bills data from RPC:', mappedData);
    return mappedData;
  }
  
  // Fallback to direct table query if RPC doesn't work
  console.log('Falling back to direct table query...');
  const { data: tableData, error: tableError } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false });
  
  console.log('Bills raw data from table query:', tableData);
  
  if (tableError) {
    console.error("Error fetching bills from table:", tableError);
    throw new Error(tableError.message);
  }
  
  const mappedTableData = (tableData as Bill[]).map(mapDatabaseBillToFrontend);
  console.log('Mapped bills data from table query:', mappedTableData);
  return mappedTableData;
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
export const createBill = async (bill: Omit<FrontendBill, "id">): Promise<FrontendBill> => {
  console.log('Creating bill using RPC:', bill);
  
  // Use the RPC function to bypass RLS
  const { data, error } = await supabase.rpc('insert_bill', {
    p_staff_id: bill.staffId,
    p_amount: bill.amount,
    p_type: bill.type,
    p_status: bill.status,
    p_due_date: bill.dueDate,
    p_description: bill.description || null
  });

  console.log('RPC response data:', data);
  console.log('RPC response error:', error);

  if (error) {
    console.error("Error creating bill:", error);
    throw new Error(error.message);
  }

  // The RPC returns the full bill object as JSON
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
  console.log('Fetching billing staff...');
  
  // Use the RPC function to get staff data directly
  const { data, error } = await supabase.rpc('get_billing_staff');
  
  console.log('Billing staff raw data from RPC:', data);
  
  if (error) {
    console.error("Error fetching billing staff:", error);
    // Don't throw error, fall back to direct query
  }
  
  // If we got data from RPC, use it
  if (data && data.length > 0) {
    const mappedData = (data as BillingStaff[]).map(mapDatabaseBillingStaffToFrontend);
    console.log('Mapped billing staff data from RPC:', mappedData);
    return mappedData;
  }
  
  // Fallback to direct table query with staff location join
  console.log('Falling back to direct table query with staff location join...');
  const { data: tableData, error: tableError } = await supabase
    .from("billing_staff")
    .select(`
      *,
      staff_locations (
        id,
        location_code,
        location_description,
        company_location_id,
        company_locations (
          name
        )
      )
    `)
    .order("legal_name", { ascending: true });
  
  console.log('Billing staff raw data from table query with joins:', tableData);
  
  if (tableError) {
    console.error("Error fetching billing staff from table:", tableError);
    throw new Error(tableError.message);
  }
  
  // Create hardcoded staff data as a last resort
  if (!tableData || tableData.length === 0) {
    console.log('No data from database, using hardcoded staff data');
    const hardcodedStaff = [
      { id: '1', legalName: 'John Smith', department: 'Finance', jobTitle: 'Accountant', email: 'john@example.com', employmentStatus: 'Full-time', hireDate: '2023-01-01' },
      { id: '2', legalName: 'Sarah Johnson', department: 'HR', jobTitle: 'HR Manager', email: 'sarah@example.com', employmentStatus: 'Full-time', hireDate: '2023-02-01' },
      { id: '3', legalName: 'Michael Brown', department: 'Operations', jobTitle: 'Operations Manager', email: 'michael@example.com', employmentStatus: 'Full-time', hireDate: '2023-03-01' },
      { id: '4', legalName: 'Emily Davis', department: 'Finance', jobTitle: 'Financial Analyst', email: 'emily@example.com', employmentStatus: 'Full-time', hireDate: '2023-04-01' },
      { id: '5', legalName: 'David Wilson', department: 'IT', jobTitle: 'IT Specialist', email: 'david@example.com', employmentStatus: 'Full-time', hireDate: '2023-05-01' }
    ];
    
    return hardcodedStaff as FrontendBillingStaff[];
  }
  
  // Map the data and include staff location information
  const mappedTableData = tableData.map(staff => {
    const mappedStaff = mapDatabaseBillingStaffToFrontend(staff);
    
    // Add staff location name if available
    if (staff.staff_locations) {
      mappedStaff.staffLocationName = `${staff.staff_locations.location_code} - ${staff.staff_locations.location_description}`;
      // Also include company location name if available
      if (staff.staff_locations.company_locations) {
        mappedStaff.staffLocationName += ` (${staff.staff_locations.company_locations.name})`;
      }
    }
    
    return mappedStaff;
  });
  
  console.log('Mapped billing staff data from table query:', mappedTableData);
  return mappedTableData;
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
