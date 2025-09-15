/**
 * API functions for managing security deposit refund decisions
 */

import { supabase } from '../client';
import { 
  RefundDecision, 
  AuditTrailEntry, 
  CreateRefundDecisionRequest,
  EligibilityAssessmentData,
  RefundDecisionResult
} from '../types/refund-decision';

/**
 * Create a new refund decision
 */
export async function createRefundDecision(
  request: CreateRefundDecisionRequest
): Promise<{ data: RefundDecision | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('security_deposit_refund_decisions')
      .insert({
        security_deposit_id: request.security_deposit_id,
        decision_type: request.result.refundRecommendation === 'Full Refund' ? 'Approved' : 
                     request.result.refundRecommendation === 'No Refund' ? 'Denied' : 'Partial',
        refund_amount: request.result.refundAmount,
        total_deductions: request.result.deductions.reduce((sum, d) => sum + d.amount, 0),
        assessment_data: request.assessment_data,
        approved_by: request.approved_by || null,
        requires_hr_review: request.result.requiresHRReview,
        created_by: request.approved_by || null,
        updated_by: request.approved_by || null
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating refund decision:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error creating refund decision:', err);
    return { data: null, error: 'Failed to create refund decision' };
  }
}

/**
 * Get refund decision by security deposit ID
 */
export async function getRefundDecisionByDepositId(
  depositId: string
): Promise<{ data: RefundDecision | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('security_deposit_refund_decisions')
      .select('*')
      .eq('security_deposit_id', depositId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching refund decision:', error);
      return { data: null, error: error.message };
    }

    return { data: data || null, error: null };
  } catch (err) {
    console.error('Unexpected error fetching refund decision:', err);
    return { data: null, error: 'Failed to fetch refund decision' };
  }
}

/**
 * Update refund decision (e.g., after PDF generation or email sending)
 */
export async function updateRefundDecision(
  id: string,
  updates: Partial<Pick<RefundDecision, 
    'pdf_report_generated' | 'pdf_report_path' | 'email_sent' | 'email_sent_at' | 
    'email_recipients' | 'hr_reviewed_by' | 'hr_reviewed_at' | 'updated_by'
  >>
): Promise<{ data: RefundDecision | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('security_deposit_refund_decisions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating refund decision:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error updating refund decision:', err);
    return { data: null, error: 'Failed to update refund decision' };
  }
}

/**
 * Get audit trail for a security deposit
 */
export async function getAuditTrail(
  depositId: string
): Promise<{ data: AuditTrailEntry[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('security_deposit_audit_trail')
      .select('*')
      .eq('security_deposit_id', depositId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit trail:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching audit trail:', err);
    return { data: null, error: 'Failed to fetch audit trail' };
  }
}

/**
 * Add manual audit trail entry
 */
export async function addAuditTrailEntry(
  depositId: string,
  refundDecisionId: string | null,
  actionType: string,
  actionDescription: string,
  actionData: Record<string, any> | null = null,
  performedBy: string
): Promise<{ data: AuditTrailEntry | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('security_deposit_audit_trail')
      .insert({
        security_deposit_id: depositId,
        refund_decision_id: refundDecisionId,
        action_type: actionType,
        action_description: actionDescription,
        action_data: actionData,
        performed_by: performedBy
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding audit trail entry:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error adding audit trail entry:', err);
    return { data: null, error: 'Failed to add audit trail entry' };
  }
}

/**
 * Get all refund decisions requiring HR review
 */
export async function getRefundDecisionsRequiringHRReview(): Promise<{
  data: RefundDecision[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('security_deposit_refund_decisions')
      .select(`
        *,
        security_deposits!inner(
          *,
          assignments!inner(
            tenant_name,
            property_name,
            room_name
          )
        )
      `)
      .eq('requires_hr_review', true)
      .is('hr_reviewed_by', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HR review queue:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching HR review queue:', err);
    return { data: null, error: 'Failed to fetch HR review queue' };
  }
}

/**
 * Approve HR review
 */
export async function approveHRReview(
  refundDecisionId: string,
  reviewedBy: string,
  notes?: string
): Promise<{ data: RefundDecision | null; error: string | null }> {
  try {
    // Add audit trail entry for HR review
    await addAuditTrailEntry(
      '', // Will be filled by trigger
      refundDecisionId,
      'HR Review Completed',
      `HR review completed by ${reviewedBy}${notes ? `: ${notes}` : ''}`,
      { hr_notes: notes },
      reviewedBy
    );

    // Update the refund decision
    const { data, error } = await supabase
      .from('security_deposit_refund_decisions')
      .update({
        hr_reviewed_by: reviewedBy,
        hr_reviewed_at: new Date().toISOString(),
        updated_by: reviewedBy
      } as any)
      .eq('id', refundDecisionId)
      .select()
      .single();

    if (error) {
      console.error('Error approving HR review:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error approving HR review:', err);
    return { data: null, error: 'Failed to approve HR review' };
  }
}
