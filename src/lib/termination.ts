// Termination utility functions and constants
// Created: 2025-09-17

export type TerminationStatus = 
  | 'draft' 
  | 'pending_manager_approval' 
  | 'pending_hr_approval' 
  | 'approved' 
  | 'rejected' 
  | 'completed';

export type SeparationType = 
  | 'voluntary' 
  | 'involuntary' 
  | 'layoff' 
  | 'retirement' 
  | 'end_of_contract' 
  | 'death' 
  | 'other';

export type TerminationReason = 
  | 'resignation' 
  | 'better_opportunity' 
  | 'personal_reasons' 
  | 'relocation'
  | 'performance_issues' 
  | 'misconduct' 
  | 'attendance_issues' 
  | 'policy_violation'
  | 'restructuring' 
  | 'budget_cuts' 
  | 'position_elimination' 
  | 'retirement_voluntary'
  | 'death' 
  | 'other';

export type RehireEligibility = 
  | 'eligible' 
  | 'not_eligible' 
  | 'conditional' 
  | 'under_review';

export type DirectDepositAction = 
  | 'keep_active' 
  | 'cancel_immediately' 
  | 'cancel_after_final_pay' 
  | 'update_account' 
  | 'no_action_needed';

// Label mappings for UI display
export const TERMINATION_STATUS_LABELS: Record<TerminationStatus, string> = {
  draft: 'Draft',
  pending_manager_approval: 'Pending Manager Approval',
  pending_hr_approval: 'Pending HR Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed'
};

export const TERMINATION_STATUS_COLORS: Record<TerminationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_manager_approval: 'bg-yellow-100 text-yellow-800',
  pending_hr_approval: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

export const SEPARATION_TYPE_LABELS: Record<SeparationType, string> = {
  voluntary: 'Voluntary',
  involuntary: 'Involuntary',
  layoff: 'Layoff',
  retirement: 'Retirement',
  end_of_contract: 'End of Contract',
  death: 'Death',
  other: 'Other'
};

export const TERMINATION_REASON_LABELS: Record<TerminationReason, string> = {
  resignation: 'Resignation',
  better_opportunity: 'Better Opportunity',
  personal_reasons: 'Personal Reasons',
  relocation: 'Relocation',
  performance_issues: 'Performance Issues',
  misconduct: 'Misconduct',
  attendance_issues: 'Attendance Issues',
  policy_violation: 'Policy Violation',
  restructuring: 'Restructuring',
  budget_cuts: 'Budget Cuts',
  position_elimination: 'Position Elimination',
  retirement_voluntary: 'Voluntary Retirement',
  death: 'Death',
  other: 'Other'
};

export const REHIRE_ELIGIBILITY_LABELS: Record<RehireEligibility, string> = {
  eligible: 'Eligible',
  not_eligible: 'Not Eligible',
  conditional: 'Conditional',
  under_review: 'Under Review'
};

export const DIRECT_DEPOSIT_ACTION_LABELS: Record<DirectDepositAction, string> = {
  keep_active: 'Keep Active',
  cancel_immediately: 'Cancel Immediately',
  cancel_after_final_pay: 'Cancel After Final Pay',
  update_account: 'Update Account',
  no_action_needed: 'No Action Needed'
};

// Utility functions
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTerminationUrgency = (effectiveDate: string): 'overdue' | 'urgent' | 'upcoming' | 'future' => {
  if (!effectiveDate) return 'future';
  
  const effective = new Date(effectiveDate);
  const today = new Date();
  const diffTime = effective.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'urgent';
  if (diffDays <= 14) return 'upcoming';
  return 'future';
};

export const validateTerminationDates = (effectiveDate: string, lastDayWorked: string): string[] => {
  const errors: string[] = [];
  
  if (!effectiveDate || !lastDayWorked) {
    return errors;
  }
  
  const effective = new Date(effectiveDate);
  const lastDay = new Date(lastDayWorked);
  
  if (effective < lastDay) {
    errors.push('Effective date cannot be before last day worked');
  }
  
  // Check if dates are too far apart (more than 30 days)
  const diffTime = effective.getTime() - lastDay.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    errors.push('Effective date should not be more than 30 days after last day worked');
  }
  
  return errors;
};

export const canUserApprove = (
  termination: any,
  userRole: string,
  userId: string,
  approvalType: 'manager' | 'hr'
): boolean => {
  if (approvalType === 'manager') {
    return (
      (userRole === 'employer' || userRole === 'admin') &&
      !termination.manager_approved_at &&
      (termination.manager_associate_id === userId || termination.initiated_by === userId)
    );
  }
  
  if (approvalType === 'hr') {
    return (
      userRole === 'admin' &&
      !termination.hr_approved_at &&
      termination.status === 'pending_hr_approval'
    );
  }
  
  return false;
};

export const getNextStatus = (
  currentStatus: TerminationStatus,
  hasManagerApproval: boolean,
  hasHRApproval: boolean,
  isADPProcessed: boolean
): TerminationStatus => {
  if (isADPProcessed && hasManagerApproval && hasHRApproval) {
    return 'completed';
  }
  
  if (hasManagerApproval && hasHRApproval) {
    return 'approved';
  }
  
  if (hasManagerApproval && !hasHRApproval) {
    return 'pending_hr_approval';
  }
  
  if (!hasManagerApproval) {
    return 'pending_manager_approval';
  }
  
  return currentStatus;
};

export const getTerminationWorkflowSteps = (status: TerminationStatus) => {
  const steps = [
    { key: 'draft', label: 'Draft', completed: true },
    { key: 'pending_manager_approval', label: 'Manager Approval', completed: false },
    { key: 'pending_hr_approval', label: 'HR Approval', completed: false },
    { key: 'approved', label: 'Approved', completed: false },
    { key: 'completed', label: 'Completed', completed: false }
  ];
  
  const statusOrder = ['draft', 'pending_manager_approval', 'pending_hr_approval', 'approved', 'completed'];
  const currentIndex = statusOrder.indexOf(status);
  
  return steps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    current: index === currentIndex
  }));
};

export const isTerminationEditable = (
  termination: any,
  userRole: string,
  userId: string
): boolean => {
  // HR can always edit
  if (userRole === 'admin') return true;
  
  // Initiator can edit if not yet approved
  if (termination.initiated_by === userId && 
      !termination.manager_approved_at && 
      !termination.hr_approved_at) {
    return true;
  }
  
  return false;
};

export const getTerminationSummary = (termination: any) => {
  const urgency = getTerminationUrgency(termination.effective_date);
  const workflowSteps = getTerminationWorkflowSteps(termination.status);
  const currentStep = workflowSteps.find(step => step.current);
  
  return {
    urgency,
    currentStep: currentStep?.label || 'Unknown',
    daysUntilEffective: Math.ceil(
      (new Date(termination.effective_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ),
    isOverdue: urgency === 'overdue',
    needsAction: termination.status.includes('pending')
  };
};
