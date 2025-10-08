/**
 * Constants and labels for staff termination workflow
 */

// Termination reason labels
export const TERMINATION_REASON_LABELS = {
  'resignation': 'Resignation',
  'retirement': 'Retirement',
  'termination_for_cause': 'Termination for Cause',
  'layoff': 'Layoff',
  'end_of_contract': 'End of Contract',
  'job_abandonment': 'Job Abandonment',
  'medical_reasons': 'Medical Reasons',
  'relocation': 'Relocation',
  'better_opportunity': 'Better Opportunity',
  'personal_reasons': 'Personal Reasons',
  'performance_issues': 'Performance Issues',
  'policy_violation': 'Policy Violation',
  'other': 'Other'
} as const;

// Separation type labels
export const SEPARATION_TYPE_LABELS = {
  'voluntary': 'Voluntary',
  'involuntary': 'Involuntary',
  'layoff': 'Layoff',
  'retirement': 'Retirement',
  'other': 'Other'
} as const;

// Rehire eligibility labels
export const REHIRE_ELIGIBILITY_LABELS = {
  'true': 'Yes - Eligible for Rehire',
  'false': 'No - Not Eligible for Rehire'
} as const;

// Direct deposit action labels
export const DIRECT_DEPOSIT_ACTION_LABELS = {
  'stop': 'Stop Direct Deposit',
  'continue': 'Continue Direct Deposit',
  'change': 'Change Direct Deposit Information'
} as const;

// Status labels for display
export const TERMINATION_STATUS_LABELS = {
  'pending': 'Pending Review',
  'approved': 'Approved',
  'rejected': 'Rejected',
  'processed': 'Processed'
} as const;

// Employment status labels
export const EMPLOYMENT_STATUS_LABELS = {
  'active': 'Active',
  'terminated': 'Terminated',
  'leave': 'On Leave',
  'suspended': 'Suspended',
  'unknown': 'Unknown'
} as const;