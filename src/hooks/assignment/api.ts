/**
 * Assignment API functions for Supabase integration
 * These functions handle direct communication with Supabase for assignment data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Assignment,
  FrontendAssignment,
  mapDatabaseAssignmentToFrontend,
  AssignmentStatus,
  PaymentStatus
} from "../../integration/supabase/types";

/**
 * Fetch all assignments from Supabase
 * @returns Promise with array of assignments
 */
export const fetchAssignments = async (): Promise<FrontendAssignment[]> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    throw new Error(error.message);
  }

  return (data as Assignment[]).map(mapDatabaseAssignmentToFrontend);
};

/**
 * Fetch a single assignment by ID
 * @param id Assignment ID
 * @returns Promise with assignment data
 */
export const fetchAssignmentById = async (
  id: string
): Promise<FrontendAssignment> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching assignment with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseAssignmentToFrontend(data as Assignment);
};

/**
 * Create a new assignment
 * @param assignment Assignment data to create
 * @returns Promise with created assignment data
 */
export const createAssignment = async (
  assignment: Omit<FrontendAssignment, "id">
): Promise<FrontendAssignment> => {
  // Convert frontend assignment to database format
  // Convert empty strings to null for UUID fields
  const dbAssignment = {
    tenant_name: assignment.tenantName || null,
    tenant_id: assignment.tenantId || null,
    property_id: assignment.propertyId || null,
    property_name: assignment.propertyName || null,
    room_id: assignment.roomId || null,
    room_name: assignment.roomName || null,
    staff_id: assignment.staffId || null,
    staff_name: assignment.staffName || null,
    status: assignment.status,
    start_date: assignment.startDate,
    end_date: assignment.endDate || null,
    rent_amount: assignment.rentAmount,
    payment_status: assignment.paymentStatus
  };

  const { data, error } = await supabase
    .from("assignments")
    .insert(dbAssignment)
    .select()
    .single();

  if (error) {
    console.error("Error creating assignment:", error);
    throw new Error(error.message);
  }

  return mapDatabaseAssignmentToFrontend(data as Assignment);
};

/**
 * Update an existing assignment
 * @param id Assignment ID
 * @param assignment Assignment data to update
 * @returns Promise with updated assignment data
 */
export const updateAssignment = async (
  id: string,
  assignment: Partial<Omit<FrontendAssignment, "id">>
): Promise<FrontendAssignment> => {
  // Convert frontend assignment to database format
  // Convert empty strings to null for UUID fields
  const dbAssignment: any = {};
  
  if (assignment.tenantName !== undefined) dbAssignment.tenant_name = assignment.tenantName || null;
  if (assignment.tenantId !== undefined) dbAssignment.tenant_id = assignment.tenantId || null;
  if (assignment.propertyId !== undefined) dbAssignment.property_id = assignment.propertyId || null;
  if (assignment.propertyName !== undefined) dbAssignment.property_name = assignment.propertyName || null;
  if (assignment.roomId !== undefined) dbAssignment.room_id = assignment.roomId || null;
  if (assignment.roomName !== undefined) dbAssignment.room_name = assignment.roomName || null;
  if (assignment.staffId !== undefined) dbAssignment.staff_id = assignment.staffId || null;
  if (assignment.staffName !== undefined) dbAssignment.staff_name = assignment.staffName || null;
  if (assignment.status !== undefined) dbAssignment.status = assignment.status;
  if (assignment.startDate !== undefined) dbAssignment.start_date = assignment.startDate;
  if (assignment.endDate !== undefined) dbAssignment.end_date = assignment.endDate || null;
  if (assignment.rentAmount !== undefined) dbAssignment.rent_amount = assignment.rentAmount;
  if (assignment.paymentStatus !== undefined) dbAssignment.payment_status = assignment.paymentStatus;

  const { data, error } = await supabase
    .from("assignments")
    .update(dbAssignment)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating assignment with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseAssignmentToFrontend(data as Assignment);
};

/**
 * Delete an assignment
 * @param id Assignment ID
 * @returns Promise with success status
 */
export const deleteAssignment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting assignment with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch assignments by status
 * @param status Assignment status to filter by
 * @returns Promise with array of assignments
 */
export const fetchAssignmentsByStatus = async (
  status: AssignmentStatus
): Promise<FrontendAssignment[]> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching assignments with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Assignment[]).map(mapDatabaseAssignmentToFrontend);
};

/**
 * Fetch assignments by payment status
 * @param paymentStatus Payment status to filter by
 * @returns Promise with array of assignments
 */
export const fetchAssignmentsByPaymentStatus = async (
  paymentStatus: PaymentStatus
): Promise<FrontendAssignment[]> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("payment_status", paymentStatus)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching assignments with payment status ${paymentStatus}:`, error);
    throw new Error(error.message);
  }

  return (data as Assignment[]).map(mapDatabaseAssignmentToFrontend);
};

/**
 * Fetch assignments by tenant ID
 * @param tenantId Tenant ID to filter by
 * @returns Promise with array of assignments
 */
export const fetchAssignmentsByTenant = async (
  tenantId: string
): Promise<FrontendAssignment[]> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching assignments for tenant ${tenantId}:`, error);
    throw new Error(error.message);
  }

  return (data as Assignment[]).map(mapDatabaseAssignmentToFrontend);
};

/**
 * Fetch assignments by property ID
 * @param propertyId Property ID to filter by
 * @returns Promise with array of assignments
 */
export const fetchAssignmentsByProperty = async (
  propertyId: string
): Promise<FrontendAssignment[]> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching assignments for property ${propertyId}:`, error);
    throw new Error(error.message);
  }

  return (data as Assignment[]).map(mapDatabaseAssignmentToFrontend);
};
