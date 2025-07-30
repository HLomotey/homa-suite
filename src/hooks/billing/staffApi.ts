/**
 * Staff API functions for Supabase integration
 * These functions handle direct communication with Supabase for billing staff data
 */

import { supabase } from "../../integration/supabase/client";
import {
  BillingStaff,
  FrontendBillingStaff,
  mapDatabaseBillingStaffToFrontend,
} from "../../integration/supabase/types/billing";

/**
 * Create a new staff member
 * @param staff Staff data to create
 * @returns Promise with created staff data
 */
export const createStaff = async (
  staff: Omit<FrontendBillingStaff, "id">
): Promise<FrontendBillingStaff> => {
  console.log('Creating staff member:', staff);
  
  // Use the RPC function to bypass RLS if available
  try {
    const { data, error } = await supabase.rpc('insert_billing_staff', {
      p_name: staff.name,
      p_department: staff.department
    });
    
    if (error) throw error;
    
    if (data) {
      console.log('Staff created via RPC:', data);
      return mapDatabaseBillingStaffToFrontend(data as BillingStaff);
    }
  } catch (rpcError) {
    console.log('RPC method not available, falling back to direct insert');
  }
  
  // Fallback to direct table insert
  const { data, error } = await supabase
    .from("billing_staff")
    .insert({
      name: staff.name,
      department: staff.department
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating staff member:", error);
    throw new Error(error.message);
  }

  return mapDatabaseBillingStaffToFrontend(data as BillingStaff);
};

/**
 * Update an existing staff member
 * @param id Staff ID
 * @param staff Staff data to update
 * @returns Promise with updated staff data
 */
export const updateStaff = async (
  id: string,
  staff: Partial<Omit<FrontendBillingStaff, "id">>
): Promise<FrontendBillingStaff> => {
  console.log(`Updating staff member with ID ${id}:`, staff);
  
  // Use the RPC function to bypass RLS if available
  try {
    const { data, error } = await supabase.rpc('update_billing_staff', {
      p_id: id,
      p_name: staff.name,
      p_department: staff.department
    });
    
    if (error) throw error;
    
    if (data) {
      console.log('Staff updated via RPC:', data);
      return mapDatabaseBillingStaffToFrontend(data as BillingStaff);
    }
  } catch (rpcError) {
    console.log('RPC method not available, falling back to direct update');
  }
  
  // Fallback to direct table update
  const { data, error } = await supabase
    .from("billing_staff")
    .update({
      name: staff.name,
      department: staff.department,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating staff member with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseBillingStaffToFrontend(data as BillingStaff);
};

/**
 * Delete a staff member
 * @param id Staff ID
 * @returns Promise with success status
 */
export const deleteStaff = async (id: string): Promise<void> => {
  console.log(`Deleting staff member with ID ${id}`);
  
  // Use the RPC function to bypass RLS if available
  try {
    const { error } = await supabase.rpc('delete_billing_staff', {
      p_id: id
    });
    
    if (!error) {
      console.log('Staff deleted via RPC');
      return;
    }
  } catch (rpcError) {
    console.log('RPC method not available, falling back to direct delete');
  }
  
  // Fallback to direct table delete
  const { error } = await supabase
    .from("billing_staff")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting staff member with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Get all staff members
 * @returns Promise with array of staff members
 */
export const getAllStaff = async (): Promise<FrontendBillingStaff[]> => {
  console.log('Fetching all staff members');
  
  const { data, error } = await supabase
    .from("billing_staff")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching staff members:", error);
    throw new Error(error.message);
  }

  return data.map(mapDatabaseBillingStaffToFrontend);
};
