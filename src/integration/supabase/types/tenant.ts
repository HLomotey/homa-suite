/**
 * Tenant types for Supabase integration
 * These types define the tenant structure and related interfaces
 */

import { Json } from './database';

/**
 * Tenant interface representing the tenants table in Supabase
 */
export interface Tenant {
  id: string;
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
  documents: Json | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  
  // Deprecated: These fields should be accessed from assignments table instead
  lease_start_date?: string;
  lease_end_date?: string;
  security_deposit?: number;
  monthly_rent?: number;
  property_id?: string;
  room_id?: string | null;
}

/**
 * Tenant status enum
 */
export type TenantStatus = 'Active' | 'Pending' | 'Former' | 'Blacklisted';

/**
 * Frontend tenant type that matches the structure for forms
 */
export interface FrontendTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  employer: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  monthlyIncome: number;
  previousAddress: string;
  status: TenantStatus;
  profileImage: string | null;
  documents: any[] | null;
  notes: string | null;
  dateAdded: string;
  
  // Deprecated: These fields should be accessed from assignments instead
  leaseStartDate?: string;
  leaseEndDate?: string;
  securityDeposit?: number;
  monthlyRent?: number;
  propertyId?: string;
  roomId?: string | null;
}

/**
 * Maps a database tenant to the frontend tenant format
 */
export const mapDatabaseTenantToFrontend = (dbTenant: Tenant): FrontendTenant => {
  return {
    id: dbTenant.id,
    firstName: dbTenant.first_name,
    lastName: dbTenant.last_name,
    email: dbTenant.email,
    phone: dbTenant.phone,
    dateOfBirth: dbTenant.date_of_birth,
    occupation: dbTenant.occupation,
    employer: dbTenant.employer,
    emergencyContactName: dbTenant.emergency_contact_name,
    emergencyContactPhone: dbTenant.emergency_contact_phone,
    emergencyContactRelationship: dbTenant.emergency_contact_relationship,
    monthlyIncome: dbTenant.monthly_income,
    previousAddress: dbTenant.previous_address,
    status: dbTenant.status as TenantStatus,
    profileImage: dbTenant.profile_image,
    documents: dbTenant.documents as any[] | null,
    notes: dbTenant.notes,
    dateAdded: dbTenant.created_at,
    
    // Deprecated fields - will be removed in future
    leaseStartDate: dbTenant.lease_start_date,
    leaseEndDate: dbTenant.lease_end_date,
    securityDeposit: dbTenant.security_deposit,
    monthlyRent: dbTenant.monthly_rent,
    propertyId: dbTenant.property_id,
    roomId: dbTenant.room_id
  };
};