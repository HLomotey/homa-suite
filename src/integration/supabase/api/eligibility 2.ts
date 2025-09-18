/**
 * API functions for eligibility assessments workflow
 */

import { supabase } from '../client';

export interface EligibilityAssessmentRequest {
  security_deposit_id: string;
  assessment_data: any;
  calculated_result: any;
  assessed_by: string;
}

export interface EligibilityFinanceApprovalRequest {
  assessment_id: string;
  approval_notes?: string;
  is_approved: boolean;
}

export interface EligibilityAssessmentQueueItem {
  id: string;
  security_deposit_id: string;
  assessment_data: any;
  calculated_result: any;
  status: 'pending_finance_approval' | 'approved' | 'rejected';
  assessed_by: string;
  assessed_by_name: string;
  assessed_at: string;
  finance_approved_by?: string;
  finance_approved_by_name?: string;
  finance_approved_at?: string;
  finance_approval_notes?: string;
  deposit_amount: number;
  deposit_payment_status: string;
  tenant_name: string;
  property_name: string;
  room_name: string;
  assignment_start_date: string;
  assignment_end_date: string;
}

export interface EligibilityApprovalStats {
  total: number;
  pending_finance_approval: number;
  approved: number;
  rejected: number;
  total_refund_amount: number;
  pending_refund_amount: number;
}

/**
 * Submit eligibility assessment for finance approval
 */
export async function submitEligibilityForFinanceApproval(
  request: EligibilityAssessmentRequest
): Promise<string> {
  try {
    const { data, error } = await (supabase.rpc as any)('submit_eligibility_for_finance_approval', {
      security_deposit_id_param: request.security_deposit_id,
      assessment_data_param: request.assessment_data,
      calculated_result_param: request.calculated_result,
      assessed_by_param: request.assessed_by
    });

    if (error) {
      console.error('Error submitting eligibility assessment:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error submitting eligibility assessment:', err);
    throw new Error('Failed to submit eligibility assessment');
  }
}

/**
 * Get eligibility assessments queue for finance approval
 */
export async function getEligibilityApprovalQueue(
  status?: 'pending_finance_approval' | 'approved' | 'rejected' | 'all'
): Promise<EligibilityAssessmentQueueItem[]> {
  try {
    let query = supabase
      .from('eligibility_finance_approval_queue')
      .select('*')
      .order('assessed_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching eligibility approval queue:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching eligibility approval queue:', err);
    throw new Error('Failed to fetch eligibility approval queue');
  }
}

/**
 * Get eligibility approval statistics
 */
export async function getEligibilityApprovalStats(): Promise<EligibilityApprovalStats> {
  try {
    const { data, error } = await supabase
      .from('eligibility_finance_approval_queue')
      .select('status, calculated_result');

    if (error) {
      console.error('Error fetching eligibility approval stats:', error);
      throw new Error(error.message);
    }

    const stats = {
      total: data?.length || 0,
      pending_finance_approval: 0,
      approved: 0,
      rejected: 0,
      total_refund_amount: 0,
      pending_refund_amount: 0
    };

    data?.forEach((item: any) => {
      const refundAmount = parseFloat(item.calculated_result?.refundAmount || 0);
      
      if (item.status === 'pending_finance_approval') {
        stats.pending_finance_approval++;
        stats.pending_refund_amount += refundAmount;
      } else if (item.status === 'approved') {
        stats.approved++;
      } else if (item.status === 'rejected') {
        stats.rejected++;
      }
      
      stats.total_refund_amount += refundAmount;
    });

    return stats;
  } catch (err) {
    console.error('Unexpected error fetching eligibility approval stats:', err);
    throw new Error('Failed to fetch eligibility approval stats');
  }
}

/**
 * Finance approve or reject eligibility assessment
 */
export async function financeApproveEligibilityAssessment(
  request: EligibilityFinanceApprovalRequest,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase.rpc as any)('finance_approve_eligibility_assessment', {
      assessment_id_param: request.assessment_id,
      approved_by_param: approvedBy,
      approval_notes_param: request.approval_notes || null,
      is_approved_param: request.is_approved
    });

    if (error) {
      console.error('Error processing eligibility finance approval:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error processing eligibility finance approval:', err);
    return { success: false, error: 'Failed to process eligibility finance approval' };
  }
}
