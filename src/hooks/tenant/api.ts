/**
 * Tenant API functions for Supabase integration
 * These functions handle direct communication with Supabase for tenant data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Tenant,
  FrontendTenant,
  mapDatabaseTenantToFrontend,
  TenantStatus,
} from "../../integration/supabase/types/tenant";

/**
 * Fetch all tenants from Supabase
 * @returns Promise with array of tenants
 */
export const fetchTenants = async (): Promise<FrontendTenant[]> => {
  console.log("Fetching tenants from Supabase...");

  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Supabase tenants query result:", { data, error });

    if (error) {
      console.error("Error fetching tenants:", error);
      throw new Error(error.message);
    }

    // Check if data is null or empty
    if (!data || data.length === 0) {
      console.warn("No tenants found in database");
      return [];
    }

    const mappedData = (data as Tenant[]).map(mapDatabaseTenantToFrontend);
    console.log("Mapped tenants data:", mappedData);
    console.log("Tenant count:", mappedData.length);

    return mappedData;
  } catch (err) {
    console.error("Exception in fetchTenants:", err);
    throw err;
  }
};

/**
 * Fetch a single tenant by ID
 * @param id Tenant ID
 * @returns Promise with tenant data
 */
export const fetchTenantById = async (id: string): Promise<FrontendTenant> => {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching tenant with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseTenantToFrontend(data as Tenant);
};

/**
 * Create a new tenant
 * @param tenant Tenant data to create
 * @returns Promise with created tenant data
 */
export const createTenant = async (
  tenant: Omit<FrontendTenant, "id" | "dateAdded">
): Promise<FrontendTenant> => {
  // Sanitize UUID fields to prevent empty string UUIDs
  const sanitizeUUID = (value: string | null | undefined): string | null => {
    if (!value || value.trim() === "") {
      return null;
    }
    return value;
  };

  // Define the type with both required and optional fields
  type DbTenantData = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    occupation: string;
    employer: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    monthly_income: number;
    previous_address: string;
    status: string;
    profile_image: string | null;
    documents: any | null;
    notes: string | null;
    lease_start_date?: string;
    lease_end_date?: string;
    security_deposit?: number;
    monthly_rent?: number;
    property_id?: string | null;
    room_id?: string | null;
  };

  // Create the base tenant object
  const dbTenant: DbTenantData = {
    first_name: tenant.firstName,
    last_name: tenant.lastName,
    email: tenant.email,
    phone: tenant.phone,
    date_of_birth: tenant.dateOfBirth,
    occupation: tenant.occupation,
    employer: tenant.employer,
    emergency_contact_name: tenant.emergencyContactName,
    emergency_contact_phone: tenant.emergencyContactPhone,
    emergency_contact_relationship: tenant.emergencyContactRelationship,
    monthly_income: tenant.monthlyIncome,
    previous_address: tenant.previousAddress,
    status: tenant.status,
    profile_image: tenant.profileImage,
    documents: tenant.documents,
    notes: tenant.notes,
  };

  // Add deprecated lease fields if they exist (will be moved to assignments table in future)
  if (tenant.leaseStartDate) dbTenant.lease_start_date = tenant.leaseStartDate;
  if (tenant.leaseEndDate) dbTenant.lease_end_date = tenant.leaseEndDate;
  if (tenant.securityDeposit !== undefined) dbTenant.security_deposit = tenant.securityDeposit;
  if (tenant.monthlyRent !== undefined) dbTenant.monthly_rent = tenant.monthlyRent;
  if (tenant.propertyId) dbTenant.property_id = sanitizeUUID(tenant.propertyId);
  if (tenant.roomId) dbTenant.room_id = sanitizeUUID(tenant.roomId);

  // Log the sanitized tenant data for debugging
  console.log("Creating tenant with sanitized data:", {
    property_id: dbTenant.property_id || null,
    room_id: dbTenant.room_id || null,
  });

  const { data, error } = await supabase
    .from("tenants")
    .insert(dbTenant)
    .select()
    .single();

  if (error) {
    console.error("Error creating tenant:", error);
    throw new Error(error.message);
  }

  return mapDatabaseTenantToFrontend(data as Tenant);
};

/**
 * Update an existing tenant
 * @param id Tenant ID
 * @param tenant Tenant data to update
 * @returns Promise with updated tenant data
 */
export const updateTenant = async (
  id: string,
  tenant: Partial<Omit<FrontendTenant, "id" | "dateAdded">>
): Promise<FrontendTenant> => {
  // Sanitize UUID fields to prevent empty string UUIDs
  const sanitizeUUID = (value: string | null | undefined): string | null => {
    if (!value || value.trim() === "") {
      return null;
    }
    return value;
  };

  // Define the type with all optional fields for updates
  type DbTenantUpdateData = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    occupation?: string;
    employer?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    monthly_income?: number;
    previous_address?: string;
    status?: string;
    profile_image?: string | null;
    documents?: any | null;
    notes?: string | null;
    lease_start_date?: string;
    lease_end_date?: string;
    security_deposit?: number;
    monthly_rent?: number;
    property_id?: string | null;
    room_id?: string | null;
  };

  const dbTenant: DbTenantUpdateData = {};

  // Only update fields that are provided
  if (tenant.firstName !== undefined) dbTenant.first_name = tenant.firstName;
  if (tenant.lastName !== undefined) dbTenant.last_name = tenant.lastName;
  if (tenant.email !== undefined) dbTenant.email = tenant.email;
  if (tenant.phone !== undefined) dbTenant.phone = tenant.phone;
  if (tenant.dateOfBirth !== undefined) dbTenant.date_of_birth = tenant.dateOfBirth;
  if (tenant.occupation !== undefined) dbTenant.occupation = tenant.occupation;
  if (tenant.employer !== undefined) dbTenant.employer = tenant.employer;
  if (tenant.emergencyContactName !== undefined) dbTenant.emergency_contact_name = tenant.emergencyContactName;
  if (tenant.emergencyContactPhone !== undefined) dbTenant.emergency_contact_phone = tenant.emergencyContactPhone;
  if (tenant.emergencyContactRelationship !== undefined) dbTenant.emergency_contact_relationship = tenant.emergencyContactRelationship;
  if (tenant.monthlyIncome !== undefined) dbTenant.monthly_income = tenant.monthlyIncome;
  if (tenant.previousAddress !== undefined) dbTenant.previous_address = tenant.previousAddress;
  if (tenant.status !== undefined) dbTenant.status = tenant.status;
  if (tenant.profileImage !== undefined) dbTenant.profile_image = tenant.profileImage;
  if (tenant.documents !== undefined) dbTenant.documents = tenant.documents;
  if (tenant.notes !== undefined) dbTenant.notes = tenant.notes;

  // Add deprecated lease fields if they exist (will be moved to assignments table in future)
  if (tenant.leaseStartDate !== undefined) dbTenant.lease_start_date = tenant.leaseStartDate;
  if (tenant.leaseEndDate !== undefined) dbTenant.lease_end_date = tenant.leaseEndDate;
  if (tenant.securityDeposit !== undefined) dbTenant.security_deposit = tenant.securityDeposit;
  if (tenant.monthlyRent !== undefined) dbTenant.monthly_rent = tenant.monthlyRent;
  if (tenant.propertyId !== undefined) dbTenant.property_id = sanitizeUUID(tenant.propertyId);
  if (tenant.roomId !== undefined) dbTenant.room_id = sanitizeUUID(tenant.roomId);

  // Log the sanitized tenant data for debugging
  console.log("Updating tenant with sanitized data:", {
    property_id: dbTenant.property_id || null,
    room_id: dbTenant.room_id || null,
  });

  const { data, error } = await supabase
    .from("tenants")
    .update(dbTenant)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating tenant with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseTenantToFrontend(data as Tenant);
};

/**
 * Delete a tenant
 * @param id Tenant ID
 * @returns Promise with success status
 */
export const deleteTenant = async (id: string): Promise<void> => {
  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting tenant with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch tenants by status
 * @param status Tenant status to filter by
 * @returns Promise with array of tenants
 */
export const fetchTenantsByStatus = async (
  status: TenantStatus
): Promise<FrontendTenant[]> => {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching tenants with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Tenant[]).map(mapDatabaseTenantToFrontend);
};

/**
 * Fetch tenants by property
 * @param propertyId Property ID to filter by
 * @returns Promise with array of tenants
 */
export const fetchTenantsByProperty = async (
  propertyId: string
): Promise<FrontendTenant[]> => {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching tenants for property ${propertyId}:`, error);
    throw new Error(error.message);
  }

  return (data as Tenant[]).map(mapDatabaseTenantToFrontend);
};
