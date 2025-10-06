import { DateTime } from "luxon";
import { supabase } from "@/integration/supabase/client";
import { BillingType } from "@/types/billing";

export interface DeductionScheduleItem {
  deduction_sequence: number;
  payroll_period: string;
  deduction_date: string;
  scheduled_amount: number;
}

export interface BillingDeduction {
  id: string;
  billing_id: string;
  deduction_sequence: number;
  payroll_period: string;
  deduction_date: string;
  scheduled_amount: number;
  actual_amount: number | null;
  status: 'Pending' | 'Processed' | 'Failed' | 'Cancelled';
  processed_at: string | null;
  processed_by: string | null;
  payroll_reference: string | null;
  failure_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Generate deduction schedule for security deposits and bus cards
 * Uses the same 7th and 22nd logic as flight agreements
 * Security deposits: 3 deductions
 * Bus cards: Can be configured (default 1 deduction)
 */
export function generateDeductionSchedule(
  totalAmount: number,
  billingType: BillingType,
  startDate: Date = new Date()
): DeductionScheduleItem[] {
  if (totalAmount <= 0) return [];
  
  // Determine number of deductions based on billing type
  const numDeductions = getDeductionCount(billingType);
  const deductionAmount = totalAmount / numDeductions;
  
  const deductions: DeductionScheduleItem[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < numDeductions; i++) {
    let deductionDate: Date;
    
    if (i === 0) {
      // First deduction: use next available deduction date (7th or 22nd)
      const currentDay = currentDate.getDate();
      
      if (currentDay <= 7) {
        // Use 7th of current month
        deductionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 7);
      } else if (currentDay <= 22) {
        // Use 22nd of current month
        deductionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 22);
      } else {
        // Use 7th of next month
        deductionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 7);
      }
    } else {
      // Subsequent deductions: alternate between 7th and 22nd
      const prevDate = new Date(deductions[i - 1].deduction_date);
      const prevDay = prevDate.getDate();
      
      if (prevDay === 7) {
        // Previous was 7th, next is 22nd of same month
        deductionDate = new Date(prevDate.getFullYear(), prevDate.getMonth(), 22);
      } else {
        // Previous was 22nd, next is 7th of next month
        deductionDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 7);
      }
    }
    
    const payrollPeriod = `${deductionDate.getFullYear()}-${(deductionDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    deductions.push({
      deduction_sequence: i + 1,
      payroll_period: payrollPeriod,
      deduction_date: deductionDate.toISOString().split('T')[0],
      scheduled_amount: Math.round(deductionAmount * 100) / 100 // Round to 2 decimal places
    });
  }
  
  return deductions;
}

/**
 * Get the number of deductions for a billing type
 */
export function getDeductionCount(billingType: BillingType): number {
  switch (billingType) {
    case 'security_deposit':
      return 3; // Security deposits are always 3 deductions
    case 'bus_card':
      return 1; // Bus cards are typically 1 deduction (can be configured)
    default:
      return 1; // Regular billing types don't use deductions
  }
}

/**
 * Check if a billing type requires deduction scheduling
 */
export function requiresDeductionScheduling(billingType: BillingType): boolean {
  return billingType === 'security_deposit' || billingType === 'bus_card';
}

/**
 * Create billing deductions in the database
 */
export async function createBillingDeductions(
  billingId: string,
  deductions: DeductionScheduleItem[]
): Promise<BillingDeduction[]> {
  console.log(`💰 Creating ${deductions.length} deductions for billing ${billingId}`);
  
  const deductionsData = deductions.map(deduction => ({
    billing_id: billingId,
    ...deduction
  }));
  
  const { data, error } = await (supabase
    .from('billing_deductions') as any)
    .insert(deductionsData)
    .select();
  
  if (error) {
    console.error('❌ Error creating billing deductions:', error);
    throw new Error(`Failed to create billing deductions: ${error.message}`);
  }
  
  console.log(`✅ Successfully created ${data?.length || 0} billing deductions`);
  return data || [];
}

/**
 * Get deductions for a billing record
 */
export async function getBillingDeductions(billingId: string): Promise<BillingDeduction[]> {
  const { data, error } = await (supabase
    .from('billing_deductions') as any)
    .select('*')
    .eq('billing_id', billingId)
    .order('deduction_sequence', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching billing deductions:', error);
    throw new Error(`Failed to fetch billing deductions: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Update deduction status (typically used by payroll processing)
 */
export async function updateDeductionStatus(
  deductionId: string,
  status: 'Pending' | 'Processed' | 'Failed' | 'Cancelled',
  actualAmount?: number,
  payrollReference?: string,
  failureReason?: string,
  notes?: string
): Promise<BillingDeduction> {
  const updates: any = {
    status,
    notes
  };
  
  if (status === 'Processed') {
    updates.processed_at = new Date().toISOString();
    updates.processed_by = (await supabase.auth.getUser()).data.user?.id;
    if (actualAmount !== undefined) {
      updates.actual_amount = actualAmount;
    }
    if (payrollReference) {
      updates.payroll_reference = payrollReference;
    }
  }
  
  if (status === 'Failed' && failureReason) {
    updates.failure_reason = failureReason;
  }
  
  const { data, error } = await (supabase
    .from('billing_deductions') as any)
    .update(updates)
    .eq('id', deductionId)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error updating deduction status:', error);
    throw new Error(`Failed to update deduction status: ${error.message}`);
  }
  
  return data;
}

/**
 * Get pending deductions for payroll processing
 */
export async function getPendingDeductions(payrollPeriod?: string): Promise<BillingDeduction[]> {
  let query = (supabase
    .from('billing_deductions') as any)
    .select(`
      *,
      billing!inner(
        tenant_id,
        billing_type,
        deduction_status,
        external_staff!inner(
          "PAYROLL FIRST NAME",
          "PAYROLL LAST NAME"
        )
      )
    `)
    .eq('status', 'Pending')
    .in('billing.deduction_status', ['Active']);
  
  if (payrollPeriod) {
    query = query.eq('payroll_period', payrollPeriod);
  }
  
  const { data, error } = await query
    .order('deduction_date', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching pending deductions:', error);
    throw new Error(`Failed to fetch pending deductions: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get deductions due for processing (by date range)
 */
export async function getDeductionsDueForProcessing(
  startDate: string,
  endDate: string
): Promise<BillingDeduction[]> {
  const { data, error } = await (supabase
    .from('billing_deductions') as any)
    .select(`
      *,
      billing!inner(
        tenant_id,
        billing_type,
        deduction_status,
        external_staff!inner(
          "PAYROLL FIRST NAME",
          "PAYROLL LAST NAME"
        )
      )
    `)
    .eq('status', 'Pending')
    .eq('billing.deduction_status', 'Active')
    .gte('deduction_date', startDate)
    .lte('deduction_date', endDate)
    .order('deduction_date', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching deductions due for processing:', error);
    throw new Error(`Failed to fetch deductions due for processing: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Cancel all pending deductions for a billing record
 */
export async function cancelBillingDeductions(billingId: string, reason?: string): Promise<void> {
  const { error } = await (supabase
    .from('billing_deductions') as any)
    .update({ 
      status: 'Cancelled',
      notes: reason ? `Billing cancelled: ${reason}` : 'Billing cancelled'
    })
    .eq('billing_id', billingId)
    .eq('status', 'Pending');
  
  if (error) {
    console.error('❌ Error cancelling billing deductions:', error);
    throw new Error(`Failed to cancel billing deductions: ${error.message}`);
  }
}
