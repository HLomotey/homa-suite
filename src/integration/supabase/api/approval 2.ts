/**
 * API functions for refund approval workflow
 */

import { supabase } from '../client';
import { 
  RefundApprovalQueueItem, 
  FinanceApprovalRequest, 
  SubmitForFinanceRequest,
  ApprovalStats,
  ApprovalStatus
} from '../types/approval';

/**
 * Get refund approval queue with filtering options
 */
export async function getRefundApprovalQueue(
  status?: ApprovalStatus,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: RefundApprovalQueueItem[] | null; error: string | null }> {
  try {
    let query = supabase
      .from('refund_approval_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('approval_status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching approval queue:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching approval queue:', err);
    return { data: null, error: 'Failed to fetch approval queue' };
  }
}

/**
 * Get approval statistics
 */
export async function getApprovalStats(): Promise<{ data: ApprovalStats | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('refund_approval_queue')
      .select('approval_status, refund_amount');

    if (error) {
      console.error('Error fetching approval stats:', error);
      return { data: null, error: error.message };
    }

    const stats: ApprovalStats = {
      total: data?.length || 0,
      pending: 0,
      requires_finance_approval: 0,
      approved: 0,
      rejected: 0,
      total_refund_amount: 0,
      pending_refund_amount: 0
    };

    (data as any[])?.forEach((item: any) => {
      stats.total_refund_amount += item.refund_amount || 0;
      
      switch (item.approval_status) {
        case 'pending':
          stats.pending++;
          stats.pending_refund_amount += item.refund_amount || 0;
          break;
        case 'requires_finance_approval':
          stats.requires_finance_approval++;
          stats.pending_refund_amount += item.refund_amount || 0;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
    });

    return { data: stats, error: null };
  } catch (err) {
    console.error('Unexpected error calculating approval stats:', err);
    return { data: null, error: 'Failed to calculate approval stats' };
  }
}

/**
 * Submit refund decision for finance approval
 */
export async function submitForFinanceApproval(
  request: SubmitForFinanceRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase.rpc as any)('submit_for_finance_approval', {
      refund_decision_id: request.refund_decision_id,
      submitted_by: request.submitted_by
    });

    if (error) {
      console.error('Error submitting for finance approval:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error submitting for finance approval:', err);
    return { success: false, error: 'Failed to submit for finance approval' };
  }
}

/**
 * Finance manager approve/reject refund decision
 */
export async function financeApproveRefund(
  request: FinanceApprovalRequest,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase.rpc as any)('finance_approve_refund', {
      refund_decision_id: request.refund_decision_id,
      approved_by: approvedBy,
      approval_notes: request.approval_notes || null,
      is_approved: request.is_approved
    });

    if (error) {
      console.error('Error processing finance approval:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error processing finance approval:', err);
    return { success: false, error: 'Failed to process finance approval' };
  }
}

/**
 * Get refund decision details by ID
 */
export async function getRefundDecisionDetails(
  id: string
): Promise<{ data: RefundApprovalQueueItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('refund_approval_queue')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching refund decision details:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error fetching refund decision details:', err);
    return { data: null, error: 'Failed to fetch refund decision details' };
  }
}

/**
 * Download PDF report for a refund decision
 */
export async function downloadRefundReport(
  decisionId: string
): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
  try {
    // Get decision details to find PDF path
    const { data: decision, error: fetchError } = await getRefundDecisionDetails(decisionId);
    
    if (fetchError || !decision) {
      return { success: false, error: fetchError || 'Decision not found' };
    }

    if (!decision.pdf_report_generated || !decision.pdf_report_path) {
      return { success: false, error: 'PDF report not available' };
    }

    // In a real implementation, you would fetch the PDF from storage
    // For now, we'll return a placeholder
    return { 
      success: false, 
      error: 'PDF download not implemented - would fetch from: ' + decision.pdf_report_path 
    };
  } catch (err) {
    console.error('Unexpected error downloading PDF report:', err);
    return { success: false, error: 'Failed to download PDF report' };
  }
}
