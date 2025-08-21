/**
 * Billing types for Supabase integration
 * These types define the billing structure and related interfaces
 */

import { Json } from './database';

/**
 * Bill interface representing the bills table in Supabase
 */
export interface Bill {
  id: string;
  staff_id: string;
  amount: number;
  type: string;
  status: string;
  due_date: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * BillStatus enum
 */
export type BillStatus = 'paid' | 'pending' | 'overdue';

/**
 * BillType enum
 */
export type BillType = 'rent' | 'utilities' | 'transport' | 'maintenance';

/**
 * TransportBillingStatus enum
 */
export type TransportBillingStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

/**
 * BillingPeriodStatus enum
 */
export type BillingPeriodStatus = 'Active' | 'Closed' | 'Archived';

/**
 * Staff interface representing the staff table in Supabase
 * Comprehensive staff information for billing and HR purposes
 */
export interface BillingStaff {
  id: string;
  // Personal Information
  legal_name: string;
  preferred_name?: string;
  birth_name?: string;
  
  // Contact Information
  email: string;
  phone_number?: string;
  address?: string;
  
  // Emergency Contacts
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Personal Details
  marital_status?: string;
  
  // EEO Data
  gender?: string;
  ethnicity_race?: string;
  veteran_status?: string;
  disability_status?: string;
  
  // Work-Related Information
  employee_id?: string;
  job_title: string;
  department: string;
  location?: string; // DEPRECATED: Use staff_location_id instead
  staff_location_id?: string; // UUID reference to staff_locations table
  employment_status: string;
  hire_date: string;
  termination_date?: string;
  
  // Compensation Information
  salary?: number;
  hourly_rate?: number;
  
  // System fields
  created_at: string;
  updated_at: string | null;
}

/**
 * BillingStats interface representing the billing_stats table in Supabase
 */
export interface BillingStats {
  id: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  month: string;
  year: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend bill type that matches the structure in BillingForm.tsx and BillingList.tsx
 */
export interface FrontendBill {
  id: string;
  staffId: string;
  amount: number;
  type: string;
  status: BillStatus;
  dueDate: string;
  description?: string;
}

/**
 * Frontend staff type that matches the structure in the billing components
 * Comprehensive staff information for billing and HR purposes
 */
export interface FrontendBillingStaff {
  id: string;
  // Personal Information
  legalName: string;
  preferredName?: string;
  birthName?: string;
  
  // Contact Information
  email: string;
  phoneNumber?: string;
  address?: string;
  
  // Emergency Contacts
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Personal Details
  maritalStatus?: string;
  
  // EEO Data
  gender?: string;
  ethnicityRace?: string;
  veteranStatus?: string;
  disabilityStatus?: string;
  
  // Work-Related Information
  employeeId?: string;
  jobTitle: string;
  department: string;
  location?: string; // DEPRECATED: Use staffLocationId instead
  staffLocationId?: string; // UUID reference to staff_locations table
  staffLocationName?: string; // Name of the staff location for display
  employmentStatus: string;
  hireDate: string;
  terminationDate?: string;
  
  // Compensation Information
  salary?: number;
  hourlyRate?: number;
}

/**
 * Frontend billing stats type
 */
export interface FrontendBillingStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  month: string;
  year: number;
}

/**
 * Payroll interface representing the payroll table in Supabase
 * Based on the upload fields: Employee ID, Regular Hours, Overtime Hours, Rent, Transport, Penalties, Pay Date, Pay Period
 */
export interface Payroll {
  id: string;
  staff_id: string; // Links to billing_staff.id (instead of employee_id from upload)
  regular_hours: number | null;
  overtime_hours: number | null;
  rent: number | null;
  transport: number | null;
  penalties: number | null;
  pay_date: string;
  pay_period: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend payroll type that matches the structure for payroll components
 * Based on the upload fields with camelCase naming
 */
export interface FrontendPayroll {
  id: string;
  staffId: string; // Links to staff record
  regularHours?: number;
  overtimeHours?: number;
  rent?: number;
  transport?: number;
  penalties?: number;
  payDate: string;
  payPeriod: string;
  // Additional computed fields for UI
  staffName?: string; // Populated from joined staff data
  employeeId?: string; // Populated from joined staff data
}

/**
 * Maps a database bill to the frontend bill format
 */
export const mapDatabaseBillToFrontend = (dbBill: Bill): FrontendBill => {
  return {
    id: dbBill.id,
    staffId: dbBill.staff_id,
    amount: dbBill.amount,
    type: dbBill.type,
    status: dbBill.status as BillStatus,
    dueDate: dbBill.due_date,
    description: dbBill.description || undefined
  };
};

/**
 * Maps a database staff to the frontend staff format
 */
export const mapDatabaseBillingStaffToFrontend = (
  dbStaff: BillingStaff
): FrontendBillingStaff => {
  return {
    id: dbStaff.id,
    // Personal Information
    legalName: dbStaff.legal_name,
    preferredName: dbStaff.preferred_name,
    birthName: dbStaff.birth_name,
    
    // Contact Information
    email: dbStaff.email,
    phoneNumber: dbStaff.phone_number,
    address: dbStaff.address,
    
    // Emergency Contacts
    emergencyContactName: dbStaff.emergency_contact_name,
    emergencyContactPhone: dbStaff.emergency_contact_phone,
    emergencyContactRelationship: dbStaff.emergency_contact_relationship,
    
    // Personal Details
    maritalStatus: dbStaff.marital_status,
    
    // EEO Data
    gender: dbStaff.gender,
    ethnicityRace: dbStaff.ethnicity_race,
    veteranStatus: dbStaff.veteran_status,
    disabilityStatus: dbStaff.disability_status,
    
    // Work-Related Information
    employeeId: dbStaff.employee_id,
    jobTitle: dbStaff.job_title,
    department: dbStaff.department,
    location: dbStaff.location, // DEPRECATED
    staffLocationId: dbStaff.staff_location_id,
    employmentStatus: dbStaff.employment_status,
    hireDate: dbStaff.hire_date,
    terminationDate: dbStaff.termination_date,
    
    // Compensation Information
    salary: dbStaff.salary,
    hourlyRate: dbStaff.hourly_rate
  };
};

/**
 * Maps a database billing stats to the frontend format
 */
export const mapDatabaseBillingStatsToFrontend = (
  dbStats: BillingStats
): FrontendBillingStats => {
  return {
    totalAmount: dbStats.total_amount,
    paidAmount: dbStats.paid_amount,
    pendingAmount: dbStats.pending_amount,
    overdueAmount: dbStats.overdue_amount,
    month: dbStats.month,
    year: dbStats.year
  };
};

/**
 * Maps a database payroll to the frontend payroll format
 */
export const mapDatabasePayrollToFrontend = (
  dbPayroll: Payroll,
  staffName?: string,
  employeeId?: string
): FrontendPayroll => {
  return {
    id: dbPayroll.id,
    staffId: dbPayroll.staff_id,
    regularHours: dbPayroll.regular_hours || undefined,
    overtimeHours: dbPayroll.overtime_hours || undefined,
    rent: dbPayroll.rent || undefined,
    transport: dbPayroll.transport || undefined,
    penalties: dbPayroll.penalties || undefined,
    payDate: dbPayroll.pay_date,
    payPeriod: dbPayroll.pay_period,
    staffName,
    employeeId,
  };
};

/**
 * BillingPeriod interface representing the billing_periods table in Supabase
 */
export interface BillingPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: BillingPeriodStatus;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * TransportBilling interface representing the transport_billing table in Supabase
 */
export interface TransportBilling {
  id: string;
  billing_period_id: string;
  staff_id: string;
  location_id: string;
  vehicle_id: string;
  amount: number;
  description: string | null;
  status: TransportBillingStatus;
  due_date: string;
  paid_date: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * TransportBillingRate interface representing the transport_billing_rates table in Supabase
 */
export interface TransportBillingRate {
  id: string;
  location_id: string;
  vehicle_type: string;
  rate_per_day: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * TransportBillingUsage interface representing the transport_billing_usage table in Supabase
 */
export interface TransportBillingUsage {
  id: string;
  billing_id: string;
  usage_date: string;
  distance: number | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend billing period type
 */
export interface FrontendBillingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: BillingPeriodStatus;
  createdBy: string;
}

/**
 * Frontend transport billing type
 */
export interface FrontendTransportBilling {
  id: string;
  billingPeriodId: string;
  billingPeriodName?: string;
  staffId: string;
  staffName?: string;
  locationId: string;
  locationName?: string;
  vehicleId: string;
  vehicleInfo?: string;
  amount: number;
  description?: string;
  status: TransportBillingStatus;
  dueDate: string;
  paidDate?: string;
  paymentReference?: string;
  notes?: string;
}

/**
 * Frontend transport billing rate type
 */
export interface FrontendTransportBillingRate {
  id: string;
  locationId: string;
  locationName?: string;
  vehicleType: string;
  ratePerDay: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

/**
 * Frontend transport billing usage type
 */
export interface FrontendTransportBillingUsage {
  id: string;
  billingId: string;
  usageDate: string;
  distance?: number;
  duration?: number;
  notes?: string;
}

/**
 * Maps a database billing period to the frontend format
 */
export const mapDatabaseBillingPeriodToFrontend = (dbPeriod: BillingPeriod): FrontendBillingPeriod => {
  return {
    id: dbPeriod.id,
    name: dbPeriod.name,
    startDate: dbPeriod.start_date,
    endDate: dbPeriod.end_date,
    status: dbPeriod.status,
    createdBy: dbPeriod.created_by
  };
};

/**
 * Maps a database transport billing to the frontend format
 */
export const mapDatabaseTransportBillingToFrontend = (
  dbBilling: TransportBilling,
  billingPeriodName?: string,
  staffName?: string,
  locationName?: string,
  vehicleInfo?: string
): FrontendTransportBilling => {
  return {
    id: dbBilling.id,
    billingPeriodId: dbBilling.billing_period_id,
    billingPeriodName,
    staffId: dbBilling.staff_id,
    staffName,
    locationId: dbBilling.location_id,
    locationName,
    vehicleId: dbBilling.vehicle_id,
    vehicleInfo,
    amount: dbBilling.amount,
    description: dbBilling.description || undefined,
    status: dbBilling.status,
    dueDate: dbBilling.due_date,
    paidDate: dbBilling.paid_date || undefined,
    paymentReference: dbBilling.payment_reference || undefined,
    notes: dbBilling.notes || undefined
  };
};

/**
 * Maps a database transport billing rate to the frontend format
 */
export const mapDatabaseTransportBillingRateToFrontend = (
  dbRate: TransportBillingRate,
  locationName?: string
): FrontendTransportBillingRate => {
  return {
    id: dbRate.id,
    locationId: dbRate.location_id,
    locationName,
    vehicleType: dbRate.vehicle_type,
    ratePerDay: dbRate.rate_per_day,
    effectiveFrom: dbRate.effective_from,
    effectiveTo: dbRate.effective_to || undefined
  };
};

/**
 * Maps a database transport billing usage to the frontend format
 */
export const mapDatabaseTransportBillingUsageToFrontend = (
  dbUsage: TransportBillingUsage
): FrontendTransportBillingUsage => {
  return {
    id: dbUsage.id,
    billingId: dbUsage.billing_id,
    usageDate: dbUsage.usage_date,
    distance: dbUsage.distance || undefined,
    duration: dbUsage.duration || undefined,
    notes: dbUsage.notes || undefined
  };
};
