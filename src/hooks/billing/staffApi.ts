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
      p_legal_name: staff.legalName,
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
      legal_name: staff.legalName,
      preferred_name: staff.preferredName,
      birth_name: staff.birthName,
      email: staff.email,
      phone_number: staff.phoneNumber,
      address: staff.address,
      marital_status: staff.maritalStatus,
      emergency_contact_name: staff.emergencyContactName,
      emergency_contact_phone: staff.emergencyContactPhone,
      emergency_contact_relationship: staff.emergencyContactRelationship,
      employee_id: staff.employeeId,
      job_title: staff.jobTitle,
      department: staff.department,
      location: staff.location,
      staff_location_id: staff.staffLocationId,
      employment_status: staff.employmentStatus,
      hire_date: staff.hireDate,
      termination_date: staff.terminationDate,
      gender: staff.gender,
      ethnicity_race: staff.ethnicityRace,
      veteran_status: staff.veteranStatus,
      disability_status: staff.disabilityStatus,
      salary: staff.salary,
      hourly_rate: staff.hourlyRate
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
      p_legal_name: staff.legalName,
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
  
  // Create update object with only defined fields
  const updateData: Record<string, string | number | null | undefined> = {
    updated_at: new Date().toISOString()
  };
  
  // Only include fields that are defined
  if (staff.legalName !== undefined) updateData.legal_name = staff.legalName;
  if (staff.preferredName !== undefined) updateData.preferred_name = staff.preferredName;
  if (staff.birthName !== undefined) updateData.birth_name = staff.birthName;
  if (staff.email !== undefined) updateData.email = staff.email;
  if (staff.phoneNumber !== undefined) updateData.phone_number = staff.phoneNumber;
  if (staff.address !== undefined) updateData.address = staff.address;
  if (staff.maritalStatus !== undefined) updateData.marital_status = staff.maritalStatus;
  if (staff.emergencyContactName !== undefined) updateData.emergency_contact_name = staff.emergencyContactName;
  if (staff.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = staff.emergencyContactPhone;
  if (staff.emergencyContactRelationship !== undefined) updateData.emergency_contact_relationship = staff.emergencyContactRelationship;
  if (staff.employeeId !== undefined) updateData.employee_id = staff.employeeId;
  if (staff.jobTitle !== undefined) updateData.job_title = staff.jobTitle;
  if (staff.department !== undefined) updateData.department = staff.department;
  if (staff.location !== undefined) updateData.location = staff.location;
  if (staff.staffLocationId !== undefined) updateData.staff_location_id = staff.staffLocationId;
  if (staff.employmentStatus !== undefined) updateData.employment_status = staff.employmentStatus;
  if (staff.hireDate !== undefined) updateData.hire_date = staff.hireDate;
  if (staff.terminationDate !== undefined) updateData.termination_date = staff.terminationDate;
  if (staff.gender !== undefined) updateData.gender = staff.gender;
  if (staff.ethnicityRace !== undefined) updateData.ethnicity_race = staff.ethnicityRace;
  if (staff.veteranStatus !== undefined) updateData.veteran_status = staff.veteranStatus;
  if (staff.disabilityStatus !== undefined) updateData.disability_status = staff.disabilityStatus;
  if (staff.salary !== undefined) updateData.salary = staff.salary;
  if (staff.hourlyRate !== undefined) updateData.hourly_rate = staff.hourlyRate;
  
  // Fallback to direct table update
  const { data, error } = await supabase
    .from("billing_staff")
    .update(updateData)
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
    .select(`
      *,
      staff_locations (id, location_code, location_description)
    `)
    .order("legal_name", { ascending: true });

  if (error) {
    console.error("Error fetching staff members:", error);
    throw new Error(error.message);
  }

  return data.map(staff => {
    const mappedStaff = mapDatabaseBillingStaffToFrontend(staff);
    
    // Add staff location name if available
    if (staff.staff_locations) {
      mappedStaff.staffLocationName = `${staff.staff_locations.location_code} - ${staff.staff_locations.location_description}`;
    }
    
    return mappedStaff;
  });
};

/**
 * Get all staff members with department "driver"
 * @returns Promise with array of driver staff members
 */
export const getDrivers = async (): Promise<FrontendBillingStaff[]> => {
  console.log('Fetching staff members with department "driver"');
  
  const { data, error } = await supabase
    .from("billing_staff")
    .select(`
      *,
      staff_locations (id, location_code, location_description)
    `)
    .ilike("department", "%driver%") // Case-insensitive search for "driver" in department
    .order("legal_name", { ascending: true });

  if (error) {
    console.error("Error fetching drivers:", error);
    throw new Error(error.message);
  }

  return data.map(staff => {
    const mappedStaff = mapDatabaseBillingStaffToFrontend(staff);
    
    // Add staff location name if available
    if (staff.staff_locations) {
      mappedStaff.staffLocationName = `${staff.staff_locations.location_code} - ${staff.staff_locations.location_description}`;
    }
    
    return mappedStaff;
  });
};

/**
 * Get staff members active during a specific billing period
 * @param startDate Start date of the billing period
 * @param endDate End date of the billing period
 * @returns Promise with array of staff members active during the period
 */
export const getStaffByBillingPeriod = async (
  startDate: string,
  endDate: string
): Promise<FrontendBillingStaff[]> => {
  console.log(`Fetching staff members active during period ${startDate} to ${endDate}`);
  
  const { data, error } = await supabase
    .from("billing_staff")
    .select(`
      *,
      staff_locations (id, location_code, location_description)
    `)
    .or(`hire_date.lte.${endDate},and(termination_date.gte.${startDate})`)
    .or(`employment_status.eq.active,and(hire_date.lte.${endDate})`)
    .order("legal_name", { ascending: true });

  if (error) {
    console.error("Error fetching staff for billing period:", error);
    throw new Error(error.message);
  }

  return data.map(staff => {
    const mappedStaff = mapDatabaseBillingStaffToFrontend(staff);
    
    // Add staff location name if available
    if (staff.staff_locations) {
      mappedStaff.staffLocationName = `${staff.staff_locations.location_code} - ${staff.staff_locations.location_description}`;
    }
    
    return mappedStaff;
  });
};
