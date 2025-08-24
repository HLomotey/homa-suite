/**
 * External Staff types for Supabase integration
 * EXACT 31 columns matching external system structure
 */

/**
 * Database interface for external_staff table
 * Matches exact column names from external system
 */
export interface ExternalStaff {
  // System fields
  id: string;
  created_at: string;
  updated_at: string;
  
  // External system fields (exact column names)
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  e_mail: string | null;
  date_of_birth: string | null; // DATE stored as ISO string
  phone_n: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  gender: string | null;
  marital_status: string | null;
  department: string | null;
  position: string | null;
  employment_status: string | null;
  hire_date: string | null; // DATE stored as ISO string
  termination_date: string | null; // DATE stored as ISO string
  supervisor: string | null;
  work_location: string | null;
  salary: number | null;
  hourly_rate: number | null;
  pay_frequency: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  ethnicity_race: string | null;
  veteran_status: string | null;
  disability_status: string | null;
  external_staff_id: string | null; // Original ID from external system
}

/**
 * Frontend interface for external staff (camelCase for React components)
 */
export interface FrontendExternalStaff {
  // System fields
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // External system fields (camelCase)
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  eMail: string | null;
  dateOfBirth: string | null;
  phoneN: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  gender: string | null;
  maritalStatus: string | null;
  department: string | null;
  position: string | null;
  employmentStatus: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  supervisor: string | null;
  workLocation: string | null;
  salary: number | null;
  hourlyRate: number | null;
  payFrequency: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  ethnicityRace: string | null;
  veteranStatus: string | null;
  disabilityStatus: string | null;
  externalStaffId: string | null;
}

/**
 * Interface for creating new external staff (without system fields)
 */
export interface CreateExternalStaff {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  e_mail?: string;
  date_of_birth?: string;
  phone_n?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  gender?: string;
  marital_status?: string;
  department?: string;
  position?: string;
  employment_status?: string;
  hire_date?: string;
  termination_date?: string;
  supervisor?: string;
  work_location?: string;
  salary?: number;
  hourly_rate?: number;
  pay_frequency?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  ethnicity_race?: string;
  veteran_status?: string;
  disability_status?: string;
  external_staff_id?: string;
}

/**
 * Interface for updating external staff (partial update)
 */
export interface UpdateExternalStaff extends Partial<CreateExternalStaff> {
  id: string;
}

/**
 * Maps database external staff to frontend format
 */
export const mapDatabaseExternalStaffToFrontend = (
  dbStaff: ExternalStaff
): FrontendExternalStaff => {
  return {
    // System fields
    id: dbStaff.id,
    createdAt: dbStaff.created_at,
    updatedAt: dbStaff.updated_at,
    
    // External system fields
    firstName: dbStaff.first_name,
    lastName: dbStaff.last_name,
    middleName: dbStaff.middle_name,
    eMail: dbStaff.e_mail,
    dateOfBirth: dbStaff.date_of_birth,
    phoneN: dbStaff.phone_n,
    address: dbStaff.address,
    city: dbStaff.city,
    state: dbStaff.state,
    zipCode: dbStaff.zip_code,
    country: dbStaff.country,
    gender: dbStaff.gender,
    maritalStatus: dbStaff.marital_status,
    department: dbStaff.department,
    position: dbStaff.position,
    employmentStatus: dbStaff.employment_status,
    hireDate: dbStaff.hire_date,
    terminationDate: dbStaff.termination_date,
    supervisor: dbStaff.supervisor,
    workLocation: dbStaff.work_location,
    salary: dbStaff.salary,
    hourlyRate: dbStaff.hourly_rate,
    payFrequency: dbStaff.pay_frequency,
    emergencyContactName: dbStaff.emergency_contact_name,
    emergencyContactPhone: dbStaff.emergency_contact_phone,
    emergencyContactRelationship: dbStaff.emergency_contact_relationship,
    ethnicityRace: dbStaff.ethnicity_race,
    veteranStatus: dbStaff.veteran_status,
    disabilityStatus: dbStaff.disability_status,
    externalStaffId: dbStaff.external_staff_id,
  };
};

/**
 * Maps frontend external staff to database format
 */
export const mapFrontendExternalStaffToDatabase = (
  frontendStaff: Omit<FrontendExternalStaff, 'id' | 'createdAt' | 'updatedAt'>
): CreateExternalStaff => {
  return {
    first_name: frontendStaff.firstName,
    last_name: frontendStaff.lastName,
    middle_name: frontendStaff.middleName,
    e_mail: frontendStaff.eMail,
    date_of_birth: frontendStaff.dateOfBirth,
    phone_n: frontendStaff.phoneN,
    address: frontendStaff.address,
    city: frontendStaff.city,
    state: frontendStaff.state,
    zip_code: frontendStaff.zipCode,
    country: frontendStaff.country,
    gender: frontendStaff.gender,
    marital_status: frontendStaff.maritalStatus,
    department: frontendStaff.department,
    position: frontendStaff.position,
    employment_status: frontendStaff.employmentStatus,
    hire_date: frontendStaff.hireDate,
    termination_date: frontendStaff.terminationDate,
    supervisor: frontendStaff.supervisor,
    work_location: frontendStaff.workLocation,
    salary: frontendStaff.salary,
    hourly_rate: frontendStaff.hourlyRate,
    pay_frequency: frontendStaff.payFrequency,
    emergency_contact_name: frontendStaff.emergencyContactName,
    emergency_contact_phone: frontendStaff.emergencyContactPhone,
    emergency_contact_relationship: frontendStaff.emergencyContactRelationship,
    ethnicity_race: frontendStaff.ethnicityRace,
    veteran_status: frontendStaff.veteranStatus,
    disability_status: frontendStaff.disabilityStatus,
    external_staff_id: frontendStaff.externalStaffId,
  };
};

/**
 * Employment status options
 */
export const EMPLOYMENT_STATUS_OPTIONS = [
  'Active',
  'Inactive', 
  'Terminated',
  'On Leave',
  'Suspended'
] as const;

/**
 * Pay frequency options
 */
export const PAY_FREQUENCY_OPTIONS = [
  'Weekly',
  'Bi-weekly',
  'Semi-monthly',
  'Monthly',
  'Quarterly',
  'Annually'
] as const;

/**
 * Gender options
 */
export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
] as const;

/**
 * Marital status options
 */
export const MARITAL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Separated',
  'Other'
] as const;
