/**
 * Types for staff termination workflow
 */

export interface StaffTerminationView {
  staff_id: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  full_name: string;
  personal_email: string | null;
  work_email: string | null;
  home_phone: string | null;
  work_phone: string | null;
  associate_id: string | null;
  file_number: string | null;
  company_code: string | null;
  job_title: string | null;
  business_unit: string | null;
  home_department: string | null;
  location_name: string | null;
  worker_category: string | null;
  position_status: string | null;
  hire_date: string | null;
  rehire_date: string | null;
  termination_date: string | null;
  years_of_service: string | null;
  reports_to_name: string | null;
  job_class: string | null;
  staff_created_at: string;
  staff_updated_at: string | null;
  
  // Staff Location Information
  staff_location_id: string | null;
  location_code: string | null;
  location_description: string | null;
  location_is_active: boolean | null;
  location_created_at: string | null;
  
  // Manager Information
  manager_id: string | null;
  manager_first_name: string | null;
  manager_last_name: string | null;
  manager_full_name: string | null;
  manager_work_email: string | null;
  manager_personal_email: string | null;
  manager_job_title: string | null;
  manager_position_status: string | null;
  
  // Company Location Information
  company_location_id: string | null;
  company_location_name: string | null;
  company_location_address: string | null;
  company_location_city: string | null;
  company_location_state: string | null;
  company_location_zip: string | null;
  
  // Status Indicators
  is_terminated: boolean;
  employment_status: 'active' | 'terminated' | 'leave' | 'suspended' | 'unknown';
  eligible_for_termination: boolean;
}

export interface StaffForTermination {
  staff_id: string;
  full_name: string;
  job_title: string | null;
  work_email: string | null;
  personal_email: string | null;
  company_code: string | null;
  location_name: string | null;
  manager_id: string | null;
  manager_full_name: string | null;
  manager_work_email: string | null;
  employment_status: string;
  eligible_for_termination: boolean;
}

export interface ManagerForLocation {
  manager_id: string;
  manager_full_name: string;
  manager_work_email: string | null;
  manager_job_title: string | null;
  location_code: string | null;
  location_description: string | null;
}

export interface TerminationRequest {
  id?: string;
  staff_id: string;
  manager_id: string | null;
  effective_termination_date: string;
  last_day_worked: string;
  separation_type: 'voluntary' | 'involuntary' | 'layoff' | 'retirement' | 'other';
  reason_for_leaving: string;
  eligible_for_rehire: boolean;
  direct_deposit_instruction: 'stop' | 'continue' | 'change';
  additional_notes: string | null;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TerminationRequestCreate {
  staff_id: string;
  manager_id: string | null;
  effective_termination_date: string;
  last_day_worked: string;
  separation_type: 'voluntary' | 'involuntary' | 'layoff' | 'retirement' | 'other';
  reason_for_leaving: string;
  eligible_for_rehire: boolean;
  direct_deposit_instruction: 'stop' | 'continue' | 'change';
  additional_notes?: string | null;
}

export interface TerminationRequestUpdate {
  effective_termination_date?: string;
  last_day_worked?: string;
  separation_type?: 'voluntary' | 'involuntary' | 'layoff' | 'retirement' | 'other';
  reason_for_leaving?: string;
  eligible_for_rehire?: boolean;
  direct_deposit_instruction?: 'stop' | 'continue' | 'change';
  additional_notes?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'processed';
}

// Enum types for better type safety
export const SeparationType = {
  VOLUNTARY: 'voluntary',
  INVOLUNTARY: 'involuntary',
  LAYOFF: 'layoff',
  RETIREMENT: 'retirement',
  OTHER: 'other'
} as const;

export const DirectDepositInstruction = {
  STOP: 'stop',
  CONTINUE: 'continue',
  CHANGE: 'change'
} as const;

export const TerminationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSED: 'processed'
} as const;

export const EmploymentStatus = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  LEAVE: 'leave',
  SUSPENDED: 'suspended',
  UNKNOWN: 'unknown'
} as const;