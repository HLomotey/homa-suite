// J-1 Tracking System Types
// Created: 2025-10-02

export type OnboardingStatus = 'pending' | 'scheduled' | 'completed';
export type CompletionStatus = 'in_progress' | 'completed' | 'early_exit';

export interface J1Participant {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  country: string;
  gender?: string;
  age?: number;
  employer?: string;
  created_at: string;
  updated_at: string;
}

export interface J1FlowStatus {
  id: string;
  participant_id: string;
  
  // Document & Visa Stage
  ds2019_start_date?: string;
  ds2019_end_date?: string;
  embassy_appointment_date?: string;
  
  // Arrival & Onboarding Stage
  arrival_date?: string;
  onboarding_status: OnboardingStatus;
  onboarding_scheduled_date?: string;
  onboarding_completed_date?: string;
  
  // Employment Stage
  estimated_start_date?: string;
  actual_start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  
  // Exit Stage
  move_out_date?: string;
  completion_status: CompletionStatus;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface J1DashboardView {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string; // Computed field from database view
  country: string;
  gender?: string;
  age?: number;
  employer?: string;
  ds2019_start_date?: string;
  ds2019_end_date?: string;
  arrival_date?: string;
  onboarding_status: OnboardingStatus;
  actual_start_date?: string;
  actual_end_date?: string;
  move_out_date?: string;
  completion_status: CompletionStatus;
  
  // Calculated fields
  current_stage: string;
  progress_percentage: number;
  
  // Alert flags
  early_arrival_flag: boolean;
  delayed_onboarding_flag: boolean;
  missing_moveout_flag: boolean;
  visa_expiring_flag: boolean;
  
  // Days calculations
  days_arrival_to_start?: number;
  days_until_visa_expiry?: number;
}

export interface J1Statistics {
  total_participants: number;
  active_participants: number;
  completed_participants: number;
  early_exits: number;
  pending_onboarding: number;
  scheduled_onboarding: number;
  completed_onboarding: number;
  avg_days_arrival_to_start?: number;
  participants_with_alerts: number;
}

export interface J1CreateData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  country: string;
  gender?: string;
  age?: number;
  employer?: string;
  
  // Flow status data
  ds2019_start_date?: string;
  ds2019_end_date?: string;
  embassy_appointment_date?: string;
  arrival_date?: string;
  estimated_start_date?: string;
  estimated_end_date?: string;
  notes?: string;
}

export interface J1UpdateData extends Partial<J1CreateData> {
  onboarding_status?: OnboardingStatus;
  onboarding_scheduled_date?: string;
  onboarding_completed_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  move_out_date?: string;
  completion_status?: CompletionStatus;
}

export interface J1FilterOptions {
  country?: string;
  employer?: string;
  completion_status?: CompletionStatus;
  onboarding_status?: OnboardingStatus;
  current_stage?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  has_alerts?: boolean;
  search_name?: string; // For searching across first/last names
}

export interface J1TimelineData {
  id: string;
  full_name: string;
  country: string;
  employer?: string;
  ds2019_start_date?: string;
  ds2019_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  current_stage: string;
  progress_percentage: number;
}

export interface J1Alert {
  participant_id: string;
  participant_name: string;
  alert_type: 'early_arrival' | 'delayed_onboarding' | 'missing_moveout' | 'visa_expiring';
  alert_message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface J1ReportMetrics {
  onboarding_completion_rate: number;
  average_days_to_start: number;
  attrition_rate: number;
  participants_by_country: Record<string, number>;
  participants_by_employer: Record<string, number>;
  participants_by_stage: Record<string, number>;
  monthly_arrivals: Array<{
    month: string;
    count: number;
  }>;
}

// Form validation schemas
export interface J1ValidationErrors {
  first_name?: string;
  last_name?: string;
  country?: string;
  ds2019_start_date?: string;
  ds2019_end_date?: string;
  arrival_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  general?: string;
}

// Utility function type for formatting names
export interface NameFormatter {
  getFullName: (participant: Pick<J1Participant, 'first_name' | 'middle_name' | 'last_name'>) => string;
  getDisplayName: (participant: Pick<J1Participant, 'first_name' | 'last_name'>) => string;
  getInitials: (participant: Pick<J1Participant, 'first_name' | 'middle_name' | 'last_name'>) => string;
}

// Export constants
export const J1_STAGES = [
  'Application Stage',
  'Documents Ready', 
  'Arrived',
  'Onboarding Complete',
  'Employment Active',
  'Employment Ended',
  'Program Completed'
] as const;

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  completed: 'Completed'
};

export const COMPLETION_STATUS_LABELS: Record<CompletionStatus, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
  early_exit: 'Early Exit'
};

export const ALERT_TYPE_LABELS = {
  early_arrival: 'Early Arrival',
  delayed_onboarding: 'Delayed Onboarding',
  missing_moveout: 'Missing Move-out Date',
  visa_expiring: 'Visa Expiring Soon'
} as const;

// Name utility functions
export const nameUtils: NameFormatter = {
  getFullName: (participant) => {
    const { first_name, middle_name, last_name } = participant;
    if (middle_name && middle_name.trim()) {
      return `${first_name} ${middle_name} ${last_name}`;
    }
    return `${first_name} ${last_name}`;
  },
  
  getDisplayName: (participant) => {
    return `${participant.first_name} ${participant.last_name}`;
  },
  
  getInitials: (participant) => {
    const { first_name, middle_name, last_name } = participant;
    let initials = first_name.charAt(0).toUpperCase();
    if (middle_name && middle_name.trim()) {
      initials += middle_name.charAt(0).toUpperCase();
    }
    initials += last_name.charAt(0).toUpperCase();
    return initials;
  }
};
