/**
 * Security Deposits API functions for Supabase integration
 */

import { supabase } from '../client';
import { 
  SecurityDeposit, 
  SecurityDepositDeduction,
  FrontendSecurityDeposit,
  mapDatabaseSecurityDepositToFrontend,
  mapFrontendSecurityDepositToDatabase
} from '../types/security-deposit';

/**
 * Create a new security deposit for an assignment
 */
export const createSecurityDeposit = async (
  assignmentId: string,
  totalAmount: number = 500,
  paymentMethod: string = 'payroll_deduction',
  notes?: string
): Promise<FrontendSecurityDeposit> => {
  const { data, error } = await supabase
    .from('security_deposits')
    .insert({
      assignment_id: assignmentId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: 'pending',
      notes: notes
    })
    .select(`
      *,
      assignments!inner(
        tenant_id,
        external_staff!inner(
          "FIRST NAME",
          "LAST NAME"
        )
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create security deposit: ${error.message}`);
  }

  // Format tenant name
  const tenantName = data.assignments?.external_staff 
    ? `${data.assignments.external_staff["FIRST NAME"]} ${data.assignments.external_staff["LAST NAME"]}`
    : 'Unknown';

  return mapDatabaseSecurityDepositToFrontend({
    ...data,
    assignments: {
      tenant_id: data.assignments?.tenant_id || '',
      tenant_name: tenantName
    }
  });
};

/**
 * Get security deposits for assignments with deduction schedules
 */
export const getSecurityDepositsForAssignments = async (
  assignmentIds: string[]
): Promise<FrontendSecurityDeposit[]> => {
  const { data, error } = await supabase
    .from('security_deposits')
    .select(`
      *,
      assignments!inner(
        tenant_id,
        tenant_name
      ),
      security_deposit_deductions(*)
    `)
    .in('assignment_id', assignmentIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch security deposits: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((deposit: any) => {
    const tenantName = deposit.assignments?.tenant_name || 'Unknown';

    return mapDatabaseSecurityDepositToFrontend({
      ...deposit,
      assignments: {
        tenant_id: deposit.assignments?.tenant_id || '',
        tenant_name: tenantName
      }
    });
  });
};

/**
 * Get security deposit by assignment ID
 */
export const getSecurityDepositByAssignmentId = async (
  assignmentId: string
): Promise<FrontendSecurityDeposit | null> => {
  const { data, error } = await supabase
    .from('security_deposits')
    .select(`
      *,
      assignments!inner(
        tenant_id,
        external_staff!inner(
          "FIRST NAME",
          "LAST NAME"
        )
      ),
      security_deposit_deductions(*)
    `)
    .eq('assignment_id', assignmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No security deposit found
    }
    throw new Error(`Failed to fetch security deposit: ${error.message}`);
  }

  const tenantName = data.assignments?.external_staff 
    ? `${data.assignments.external_staff["FIRST NAME"]} ${data.assignments.external_staff["LAST NAME"]}`
    : 'Unknown';

  return mapDatabaseSecurityDepositToFrontend({
    ...data,
    assignments: {
      tenant_id: data.assignments?.tenant_id || '',
      tenant_name: tenantName
    }
  });
};

/**
 * Update deduction status (mark as deducted, waived, etc.)
 */
export const updateDeductionStatus = async (
  deductionId: string,
  status: 'scheduled' | 'deducted' | 'waived' | 'adjusted',
  actualAmount?: number,
  actualDate?: string,
  reason?: string,
  notes?: string
): Promise<SecurityDepositDeduction> => {
  const updateData: Partial<SecurityDepositDeduction> = {
    status,
    actual_amount: actualAmount,
    actual_deduction_date: actualDate,
    reason,
    notes
  };

  const { data, error } = await supabase
    .from('security_deposit_deductions')
    .update(updateData)
    .eq('id', deductionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update deduction status: ${error.message}`);
  }

  return data;
};

/**
 * Get upcoming deductions (scheduled for next 30 days)
 */
export const getUpcomingDeductions = async (): Promise<SecurityDepositDeduction[]> => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('security_deposit_deductions')
    .select(`
      *,
      security_deposits!inner(
        assignment_id,
        assignments!inner(
          external_staff!inner(
            "FIRST NAME",
            "LAST NAME"
          )
        )
      )
    `)
    .eq('status', 'scheduled')
    .gte('scheduled_date', today)
    .lte('scheduled_date', thirtyDaysFromNow)
    .order('scheduled_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch upcoming deductions: ${error.message}`);
  }

  return data;
};

/**
 * Process refund for security deposit
 */
export const processSecurityDepositRefund = async (
  depositId: string,
  refundAmount: number,
  refundDate: string,
  notes?: string
): Promise<SecurityDeposit> => {
  const { data, error } = await supabase
    .from('security_deposits')
    .update({
      refund_amount: refundAmount,
      refund_date: refundDate,
      payment_status: refundAmount > 0 ? 'refunded' : 'paid',
      notes: notes
    })
    .eq('id', depositId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to process refund: ${error.message}`);
  }

  return data;
};

/**
 * Get security deposit statistics
 */
export const getSecurityDepositStats = async () => {
  const { data, error } = await supabase
    .from('security_deposits')
    .select('payment_status, total_amount, refund_amount');

  if (error) {
    throw new Error(`Failed to fetch security deposit stats: ${error.message}`);
  }

  const stats = {
    totalDeposits: data.length,
    totalAmount: data.reduce((sum, deposit) => sum + deposit.total_amount, 0),
    totalRefunded: data.reduce((sum, deposit) => sum + (deposit.refund_amount || 0), 0),
    pending: data.filter(d => d.payment_status === 'pending').length,
    paid: data.filter(d => d.payment_status === 'paid').length,
    refunded: data.filter(d => d.payment_status === 'refunded').length,
    partial: data.filter(d => d.payment_status === 'partial').length
  };

  return stats;
};
