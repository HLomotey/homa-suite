/**
 * Security Deposit types for Supabase integration
 * These types define the security deposit structure and related interfaces
 */

import { Json } from './database';

/**
 * Security Deposit interface representing the security_deposits table in Supabase
 */
export interface SecurityDeposit {
  id: string;
  assignment_id: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  paid_date: string | null;
  refund_date: string | null;
  refund_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Security Deposit Deduction interface representing the security_deposit_deductions table
 */
export interface SecurityDepositDeduction {
  id: string;
  security_deposit_id: string;
  deduction_number: number;
  scheduled_date: string;
  amount: number;
  status: 'scheduled' | 'deducted' | 'waived' | 'adjusted';
  actual_deduction_date: string | null;
  actual_amount: number | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Frontend Security Deposit type for UI components
 */
export interface FrontendSecurityDeposit {
  id: string;
  assignmentId: string;
  tenantId: string;
  tenantName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paidDate: string | null;
  refundDate: string | null;
  refundAmount: number;
  notes: string | null;
  deductions: FrontendSecurityDepositDeduction[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Frontend Security Deposit Deduction type for UI components
 */
export interface FrontendSecurityDepositDeduction {
  id: string;
  deductionNumber: number;
  scheduledDate: string;
  amount: number;
  status: 'scheduled' | 'deducted' | 'waived' | 'adjusted';
  actualDeductionDate: string | null;
  actualAmount: number | null;
  reason: string | null;
  notes: string | null;
}

/**
 * Eligibility Check Result
 */
export interface EligibilityCheck {
  isEligible: boolean;
  reasons: string[];
  recommendation: 'Full Refund' | 'Partial Refund' | 'No Refund';
  refundAmount: number;
}

/**
 * Refund Decision
 */
export interface RefundDecision {
  decision: 'Approved' | 'Denied' | 'Partial';
  amount: number;
  reasons: string[];
  approvedBy: string;
  approvedAt: string;
  auditTrail: AuditEntry[];
}

/**
 * Audit Trail Entry
 */
export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

/**
 * Maps a database security deposit to the frontend format
 */
export const mapDatabaseSecurityDepositToFrontend = (
  dbDeposit: SecurityDeposit & { 
    assignments?: { tenant_name: string; tenant_id: string };
    security_deposit_deductions?: SecurityDepositDeduction[];
  }
): FrontendSecurityDeposit => {
  return {
    id: dbDeposit.id,
    assignmentId: dbDeposit.assignment_id,
    tenantId: dbDeposit.assignments?.tenant_id || '',
    tenantName: dbDeposit.assignments?.tenant_name || '',
    totalAmount: dbDeposit.total_amount,
    paymentMethod: dbDeposit.payment_method,
    paymentStatus: dbDeposit.payment_status,
    paidDate: dbDeposit.paid_date,
    refundDate: dbDeposit.refund_date,
    refundAmount: dbDeposit.refund_amount,
    notes: dbDeposit.notes,
    deductions: (dbDeposit.security_deposit_deductions || []).map(deduction => ({
      id: deduction.id,
      deductionNumber: deduction.deduction_number,
      scheduledDate: deduction.scheduled_date,
      amount: deduction.amount,
      status: deduction.status,
      actualDeductionDate: deduction.actual_deduction_date,
      actualAmount: deduction.actual_amount,
      reason: deduction.reason,
      notes: deduction.notes
    })),
    createdAt: dbDeposit.created_at,
    updatedAt: dbDeposit.updated_at
  };
};

/**
 * Maps a frontend security deposit to the database format
 */
export const mapFrontendSecurityDepositToDatabase = (
  frontendDeposit: Omit<FrontendSecurityDeposit, 'id' | 'createdAt' | 'updatedAt' | 'deductions'>
): Omit<SecurityDeposit, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> => {
  return {
    assignment_id: frontendDeposit.assignmentId,
    total_amount: frontendDeposit.totalAmount,
    payment_method: frontendDeposit.paymentMethod,
    payment_status: frontendDeposit.paymentStatus,
    paid_date: frontendDeposit.paidDate,
    refund_date: frontendDeposit.refundDate,
    refund_amount: frontendDeposit.refundAmount,
    notes: frontendDeposit.notes
  };
};
