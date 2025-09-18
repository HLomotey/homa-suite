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
    property_id: assignment.propertyId,
    property_name: assignment.propertyName,
    room_id: assignment.roomId || null,
    room_name: assignment.roomName || null,
    staff_id: assignment.staffId || null,
    staff_name: assignment.staffName || null,
    status: assignment.status,
    start_date: assignment.startDate,
    end_date: assignment.endDate || null,
    rent_amount: assignment.rentAmount,
    housing_agreement: assignment.agreements?.housing || false,
    transportation_agreement: assignment.agreements?.transportation || false,
    flight_agreement: assignment.agreements?.flight_agreement || false,
    bus_card_agreement: assignment.agreements?.bus_card || false
    // Removed payment_status as it was removed from assignments table
  };

  const { data, error } = await (supabase as any)
    .from("assignments")
    .insert(dbAssignment)
    .select()
    .single();

  if (error) {
    console.error("Error creating assignment:", error);
    throw new Error(error.message);
  }

  const createdAssignment = mapDatabaseAssignmentToFrontend(data as Assignment);

  // Create security deposit records for all benefit types with deposits
  if (assignment.securityDeposits && assignment.securityDeposits.length > 0) {
    try {
      for (const deposit of assignment.securityDeposits) {
        const securityDepositData = {
          assignment_id: createdAssignment.id,
          benefit_type: deposit.benefitType,
          total_amount: deposit.totalAmount,
          payment_method: deposit.paymentMethod,
          payment_status: deposit.paymentStatus,
          paid_date: deposit.paidDate || null,
          notes: deposit.notes || null
        };

        const { data: depositData, error: depositError } = await (supabase as any)
          .from("security_deposits")
          .insert(securityDepositData)
          .select()
          .single();

        if (depositError) {
          console.error(`Error creating ${deposit.benefitType} security deposit:`, depositError);
          // Don't throw here - assignment was created successfully
        } else if (deposit.deductionSchedule?.length > 0) {
          // Create deduction schedule records
          const deductionRecords = deposit.deductionSchedule.map(deduction => ({
            security_deposit_id: depositData.id,
            deduction_number: deduction.deductionNumber,
            scheduled_date: deduction.scheduledDate,
            amount: deduction.amount,
            status: deduction.status,
            actual_deduction_date: deduction.actualDeductionDate || null,
            notes: deduction.notes || null
          }));

          const { error: deductionError } = await (supabase as any)
            .from("security_deposit_deductions")
            .insert(deductionRecords);

          if (deductionError) {
            console.error(`Error creating ${deposit.benefitType} deduction schedule:`, deductionError);
          }
        }
      }
    } catch (securityDepositError) {
      console.error("Error handling security deposits:", securityDepositError);
      // Don't throw - assignment creation was successful
    }
  }

  return createdAssignment;
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
  const dbAssignment: Record<string, any> = {};
  
  if (assignment.tenantName !== undefined) dbAssignment.tenant_name = assignment.tenantName || null;
  if (assignment.tenantId !== undefined) dbAssignment.tenant_id = assignment.tenantId || null;
  if (assignment.propertyId !== undefined) dbAssignment.property_id = assignment.propertyId;
  if (assignment.propertyName !== undefined) dbAssignment.property_name = assignment.propertyName;
  if (assignment.roomId !== undefined) dbAssignment.room_id = assignment.roomId || null;
  if (assignment.roomName !== undefined) dbAssignment.room_name = assignment.roomName || null;
  if (assignment.staffId !== undefined) dbAssignment.staff_id = assignment.staffId || null;
  if (assignment.staffName !== undefined) dbAssignment.staff_name = assignment.staffName || null;
  if (assignment.status !== undefined) dbAssignment.status = assignment.status;
  if (assignment.startDate !== undefined) dbAssignment.start_date = assignment.startDate;
  if (assignment.endDate !== undefined) dbAssignment.end_date = assignment.endDate || null;
  if (assignment.rentAmount !== undefined) dbAssignment.rent_amount = assignment.rentAmount;
  if (assignment.agreements !== undefined) {
    dbAssignment.housing_agreement = assignment.agreements.housing || false;
    dbAssignment.transportation_agreement = assignment.agreements.transportation || false;
    dbAssignment.flight_agreement = assignment.agreements.flight_agreement || false;
    dbAssignment.bus_card_agreement = assignment.agreements.bus_card || false;
  }

  const { data, error } = await (supabase as any)
    .from("assignments")
    .update(dbAssignment)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating assignment with ID ${id}:`, error);
    throw new Error(error.message);
  }

  const updatedAssignment = mapDatabaseAssignmentToFrontend(data as Assignment);

  // Handle security deposit updates for all benefit types
  if (assignment.securityDeposits && assignment.securityDeposits.length > 0) {
    try {
      // Get existing deposits for this assignment
      const { data: existingDeposits } = await (supabase as any)
        .from("security_deposits")
        .select("id, benefit_type")
        .eq("assignment_id", id);

      // Process each security deposit
      for (const deposit of assignment.securityDeposits) {
        const existingDeposit = existingDeposits?.find(
          (existing: any) => existing.benefit_type === deposit.benefitType
        );

        const securityDepositData = {
          assignment_id: id,
          benefit_type: deposit.benefitType,
          total_amount: deposit.totalAmount,
          payment_method: deposit.paymentMethod,
          payment_status: deposit.paymentStatus,
          paid_date: deposit.paidDate || null,
          notes: deposit.notes || null
        };

        let depositId;

        if (existingDeposit) {
          // Update existing security deposit
          const { data: depositData, error: depositError } = await (supabase as any)
            .from("security_deposits")
            .update(securityDepositData)
            .eq("id", existingDeposit.id)
            .select()
            .single();

          if (depositError) {
            console.error(`Error updating ${deposit.benefitType} security deposit:`, depositError);
          } else {
            depositId = depositData.id;
          }
        } else {
          // Create new security deposit
          const { data: depositData, error: depositError } = await (supabase as any)
            .from("security_deposits")
            .insert(securityDepositData)
            .select()
            .single();

          if (depositError) {
            console.error(`Error creating ${deposit.benefitType} security deposit:`, depositError);
          } else {
            depositId = depositData.id;
          }
        }

        // Handle deduction schedule if we have a valid deposit ID
        if (depositId && deposit.deductionSchedule?.length > 0) {
          // Delete existing deduction records
          await (supabase as any)
            .from("security_deposit_deductions")
            .delete()
            .eq("security_deposit_id", depositId);

          // Create new deduction schedule records
          const deductionRecords = deposit.deductionSchedule.map(deduction => ({
            security_deposit_id: depositId,
            deduction_number: deduction.deductionNumber,
            scheduled_date: deduction.scheduledDate,
            amount: deduction.amount,
            status: deduction.status,
            actual_deduction_date: deduction.actualDeductionDate || null,
            notes: deduction.notes || null
          }));

          const { error: deductionError } = await (supabase as any)
            .from("security_deposit_deductions")
            .insert(deductionRecords);

          if (deductionError) {
            console.error(`Error updating ${deposit.benefitType} deduction schedule:`, deductionError);
          }
        }
      }

      // Remove deposits that are no longer needed (benefit agreements unchecked)
      if (existingDeposits) {
        const currentBenefitTypes = assignment.securityDeposits.map(d => d.benefitType);
        const depositsToRemove = existingDeposits.filter(
          (existing: any) => !currentBenefitTypes.includes(existing.benefit_type)
        );

        for (const depositToRemove of depositsToRemove) {
          // Delete deduction records first
          await (supabase as any)
            .from("security_deposit_deductions")
            .delete()
            .eq("security_deposit_id", depositToRemove.id);

          // Delete the deposit
          await (supabase as any)
            .from("security_deposits")
            .delete()
            .eq("id", depositToRemove.id);
        }
      }
    } catch (securityDepositError) {
      console.error("Error handling security deposit updates:", securityDepositError);
      // Don't throw - assignment update was successful
    }
  }

  return updatedAssignment;
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

/**
 * Fetch assignments by staff ID
 * @param staffId Staff ID to filter by
 * @returns Promise with array of assignments
 */
export const fetchAssignmentsByStaff = async (
  staffId: string
): Promise<FrontendAssignment[]> => {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching assignments for staff ${staffId}:`, error);
    throw new Error(error.message);
  }

  return (data as Assignment[]).map(mapDatabaseAssignmentToFrontend);
};
