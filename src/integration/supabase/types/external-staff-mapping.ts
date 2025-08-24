/**
 * External Staff System Integration Types
 * Handles mapping between external system fields and internal BillingStaff structure
 */

/**
 * External system staff structure (exact field names from the other system)
 * This interface matches the CSV/Excel structure for easy data import
 * Column names match exactly what appears in your external system sample
 */
export interface ExternalStaffRecord {
  // Personal Information - exact column names from sample
  EMPLOYEE_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  MIDDLE_NAME?: string;
  GENDER?: string;
  MARITAL_STATUS?: string;
  DATE_OF_BIRTH?: string;
  
  // Contact Information - exact column names from sample
  EMAIL: string;
  PHONE_NUMBER?: string;
  ADDRESS?: string;
  CITY?: string;
  STATE?: string;
  ZIP_CODE?: string;
  COUNTRY?: string;
  
  // Work Information - exact column names from sample
  DEPARTMENT: string;
  POSITION: string;
  EMPLOYMENT_STATUS: string;
  HIRE_DATE: string;
  TERMINATION_DATE?: string;
  SUPERVISOR?: string;
  WORK_LOCATION?: string;
  
  // Compensation - exact column names from sample
  SALARY?: number;
  HOURLY_RATE?: number;
  PAY_FREQUENCY?: string;
  
  // Emergency Contact - exact column names from sample
  EMERGENCY_CONTACT_NAME?: string;
  EMERGENCY_CONTACT_PHONE?: string;
  EMERGENCY_CONTACT_RELATIONSHIP?: string;
  
  // EEO Information - exact column names from sample
  ETHNICITY_RACE?: string;
  VETERAN_STATUS?: string;
  DISABILITY_STATUS?: string;
  
  // Additional fields that might appear in your system
  EMPLOYEE_TYPE?: string;
  SHIFT?: string;
  COST_CENTER?: string;
  MANAGER?: string;
  START_TIME?: string;
  END_TIME?: string;
  BENEFITS_ELIGIBLE?: string;
  UNION_MEMBER?: string;
  JOB_CODE?: string;
  GRADE_LEVEL?: string;
  STEP?: string;
  FTE?: number;
  PROBATION_END_DATE?: string;
  LAST_REVIEW_DATE?: string;
  NEXT_REVIEW_DATE?: string;
  NOTES?: string;
}

/**
 * Enhanced BillingStaff interface that includes new fields from external system
 * while maintaining backward compatibility with existing fields
 */
export interface EnhancedBillingStaff {
  id: string;
  
  // Personal Information (Enhanced)
  legal_name: string; // Computed from first_name + last_name for backward compatibility
  first_name: string; // New field from external system
  last_name: string; // New field from external system
  middle_name?: string; // New field from external system
  preferred_name?: string; // Existing field, can be mapped from first_name
  birth_name?: string; // Existing field
  date_of_birth?: string; // New field from external system
  
  // Contact Information (Existing)
  email: string;
  phone_number?: string;
  address?: string;
  
  // Emergency Contacts (Existing)
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Personal Details (Existing)
  marital_status?: string;
  
  // EEO Data (Existing)
  gender?: string;
  ethnicity_race?: string;
  veteran_status?: string;
  disability_status?: string;
  
  // Work-Related Information (Existing)
  employee_id?: string;
  job_title: string; // Maps to POSITION from external system
  department: string;
  location?: string; // DEPRECATED: Use staff_location_id instead
  staff_location_id?: string;
  employment_status: string;
  hire_date: string;
  termination_date?: string;
  
  // Compensation Information (Existing)
  salary?: number;
  hourly_rate?: number;
  
  // System fields
  created_at: string;
  updated_at: string | null;
}

/**
 * Field mapping configuration for transforming external data to internal structure
 */
export const EXTERNAL_TO_INTERNAL_FIELD_MAPPING = {
  // Direct mappings (same field names)
  employee_id: 'EMPLOYEE_ID',
  email: 'EMAIL',
  phone_number: 'PHONE_NUMBER',
  address: 'ADDRESS',
  gender: 'GENDER',
  marital_status: 'MARITAL_STATUS',
  department: 'DEPARTMENT',
  employment_status: 'EMPLOYMENT_STATUS',
  hire_date: 'HIRE_DATE',
  termination_date: 'TERMINATION_DATE',
  salary: 'SALARY',
  hourly_rate: 'HOURLY_RATE',
  emergency_contact_name: 'EMERGENCY_CONTACT_NAME',
  emergency_contact_phone: 'EMERGENCY_CONTACT_PHONE',
  emergency_contact_relationship: 'EMERGENCY_CONTACT_RELATIONSHIP',
  ethnicity_race: 'ETHNICITY_RACE',
  veteran_status: 'VETERAN_STATUS',
  disability_status: 'DISABILITY_STATUS',
  
  // New field mappings
  first_name: 'FIRST_NAME',
  last_name: 'LAST_NAME',
  middle_name: 'MIDDLE_NAME',
  date_of_birth: 'DATE_OF_BIRTH',
  
  // Computed field mappings
  job_title: 'POSITION', // POSITION maps to job_title
  preferred_name: 'FIRST_NAME', // Use first name as preferred name by default
} as const;

/**
 * Transforms external staff record to internal BillingStaff format
 */
export const transformExternalToInternal = (
  externalRecord: ExternalStaffRecord
): Partial<EnhancedBillingStaff> => {
  // Compute legal_name from first_name + last_name for backward compatibility
  const legalName = `${externalRecord.FIRST_NAME} ${externalRecord.LAST_NAME}`.trim();
  
  // Combine address fields if they exist separately
  const fullAddress = [
    externalRecord.ADDRESS,
    externalRecord.CITY,
    externalRecord.STATE,
    externalRecord.ZIP_CODE,
    externalRecord.COUNTRY
  ].filter(Boolean).join(', ');
  
  return {
    // Personal Information
    legal_name: legalName,
    first_name: externalRecord.FIRST_NAME,
    last_name: externalRecord.LAST_NAME,
    middle_name: externalRecord.MIDDLE_NAME,
    preferred_name: externalRecord.FIRST_NAME, // Default to first name
    date_of_birth: externalRecord.DATE_OF_BIRTH,
    
    // Contact Information
    email: externalRecord.EMAIL,
    phone_number: externalRecord.PHONE_NUMBER,
    address: fullAddress || externalRecord.ADDRESS,
    
    // Emergency Contacts
    emergency_contact_name: externalRecord.EMERGENCY_CONTACT_NAME,
    emergency_contact_phone: externalRecord.EMERGENCY_CONTACT_PHONE,
    emergency_contact_relationship: externalRecord.EMERGENCY_CONTACT_RELATIONSHIP,
    
    // Personal Details
    marital_status: externalRecord.MARITAL_STATUS,
    
    // EEO Data
    gender: externalRecord.GENDER,
    ethnicity_race: externalRecord.ETHNICITY_RACE,
    veteran_status: externalRecord.VETERAN_STATUS,
    disability_status: externalRecord.DISABILITY_STATUS,
    
    // Work-Related Information
    employee_id: externalRecord.EMPLOYEE_ID,
    job_title: externalRecord.POSITION,
    department: externalRecord.DEPARTMENT,
    employment_status: externalRecord.EMPLOYMENT_STATUS,
    hire_date: externalRecord.HIRE_DATE,
    termination_date: externalRecord.TERMINATION_DATE,
    location: externalRecord.WORK_LOCATION, // Map to location field
    
    // Compensation Information
    salary: externalRecord.SALARY,
    hourly_rate: externalRecord.HOURLY_RATE,
  };
};

/**
 * Validates external staff record before transformation
 */
export const validateExternalStaffRecord = (
  record: Partial<ExternalStaffRecord>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields validation
  if (!record.FIRST_NAME) errors.push('FIRST_NAME is required');
  if (!record.LAST_NAME) errors.push('LAST_NAME is required');
  if (!record.EMAIL) errors.push('EMAIL is required');
  if (!record.DEPARTMENT) errors.push('DEPARTMENT is required');
  if (!record.POSITION) errors.push('POSITION is required');
  if (!record.EMPLOYMENT_STATUS) errors.push('EMPLOYMENT_STATUS is required');
  if (!record.HIRE_DATE) errors.push('HIRE_DATE is required');
  
  // Email format validation
  if (record.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.EMAIL)) {
    errors.push('EMAIL format is invalid');
  }
  
  // Date format validation (assuming YYYY-MM-DD format)
  if (record.HIRE_DATE && !/^\d{4}-\d{2}-\d{2}$/.test(record.HIRE_DATE)) {
    errors.push('HIRE_DATE must be in YYYY-MM-DD format');
  }
  
  if (record.DATE_OF_BIRTH && !/^\d{4}-\d{2}-\d{2}$/.test(record.DATE_OF_BIRTH)) {
    errors.push('DATE_OF_BIRTH must be in YYYY-MM-DD format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Batch transforms multiple external records with validation
 */
export const transformExternalStaffBatch = (
  externalRecords: ExternalStaffRecord[]
): {
  validRecords: Partial<EnhancedBillingStaff>[];
  invalidRecords: { record: ExternalStaffRecord; errors: string[] }[];
} => {
  const validRecords: Partial<EnhancedBillingStaff>[] = [];
  const invalidRecords: { record: ExternalStaffRecord; errors: string[] }[] = [];
  
  externalRecords.forEach((record) => {
    const validation = validateExternalStaffRecord(record);
    
    if (validation.isValid) {
      validRecords.push(transformExternalToInternal(record));
    } else {
      invalidRecords.push({
        record,
        errors: validation.errors
      });
    }
  });
  
  return { validRecords, invalidRecords };
};
