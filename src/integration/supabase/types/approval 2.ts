/**
 * Types for refund approval workflow
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requires_finance_approval';

export interface RefundApprovalQueueItem {
  // Refund decision fields
  id: string;
  security_deposit_id: string;
  decision_type: 'Approved' | 'Denied' | 'Partial';
  refund_amount: number;
  total_deductions: number;
  assessment_data: any;
  
  // Approval workflow fields
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string;
  
  // Finance approval fields
  finance_approved_by: string | null;
  finance_approved_by_name: string | null;
  finance_approved_at: string | null;
  finance_approval_notes: string | null;
  submitted_for_finance_approval: boolean;
  submitted_for_finance_at: string | null;
  
  // HR review fields
  requires_hr_review: boolean;
  hr_reviewed_by: string | null;
  hr_reviewed_by_name: string | null;
  hr_reviewed_at: string | null;
  
  // Document tracking
  pdf_report_generated: boolean;
  pdf_report_path: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_recipients: string[] | null;
  
  // Security deposit info
  deposit_amount: number;
  deposit_payment_status: string;
  
  // Assignment info
  tenant_name: string | null;
  property_name: string | null;
  room_name: string | null;
  assignment_start_date: string;
  assignment_end_date: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface FinanceApprovalRequest {
  refund_decision_id: string;
  approval_notes?: string;
  is_approved: boolean;
}

export interface SubmitForFinanceRequest {
  refund_decision_id: string;
  submitted_by: string;
}

export interface ApprovalStats {
  total: number;
  pending: number;
  requires_finance_approval: number;
  approved: number;
  rejected: number;
  total_refund_amount: number;
  pending_refund_amount: number;
}
