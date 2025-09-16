import { supabase } from '../client';

// Types for flight agreements
export interface FlightAgreement {
  id: string;
  staff_id: string;
  staff_name: string;
  department: string | null;
  job_title: string | null;
  agreement_amount: number;
  deduction_amount: number;
  total_deductions: number;
  processed_deductions: number;
  start_date: string;
  completion_date: string | null;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Suspended';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlightAgreementDeduction {
  id: string;
  agreement_id: string;
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

export interface FlightAgreementSummary extends FlightAgreement {
  total_deducted: number;
  remaining_balance: number;
  pending_deductions: number;
  failed_deductions: number;
  next_deduction_date: string | null;
}

export interface CreateFlightAgreementData {
  staff_id: string;
  staff_name: string;
  department?: string;
  job_title?: string;
  agreement_amount: number;
  deduction_amount: number;
  total_deductions?: number;
  start_date?: string;
  notes?: string;
}

export interface CreateDeductionData {
  agreement_id: string;
  deduction_sequence: number;
  payroll_period: string;
  deduction_date: string;
  scheduled_amount: number;
  notes?: string;
}

// API Functions

/**
 * Get all flight agreements with summary data
 */
export async function getFlightAgreements(): Promise<FlightAgreementSummary[]> {
  const { data, error } = await supabase
    .from('flight_agreements_summary')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching flight agreements:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get flight agreement by ID
 */
export async function getFlightAgreementById(id: string): Promise<FlightAgreement | null> {
  const { data, error } = await supabase
    .from('flight_agreements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching flight agreement:', error);
    throw error;
  }

  return data;
}

/**
 * Get flight agreements by staff ID
 */
export async function getFlightAgreementsByStaffId(staffId: string): Promise<FlightAgreementSummary[]> {
  const { data, error } = await supabase
    .from('flight_agreements_summary')
    .select('*')
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching flight agreements by staff ID:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new flight agreement
 */
export async function createFlightAgreement(agreementData: CreateFlightAgreementData): Promise<FlightAgreement> {
  const { data, error } = await supabase
    .from('flight_agreements')
    .insert([{
      ...agreementData,
      total_deductions: agreementData.total_deductions || 3,
      start_date: agreementData.start_date || new Date().toISOString(),
      created_by: (await supabase.auth.getUser()).data.user?.id
    }] as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating flight agreement:', error);
    throw error;
  }

  return data;
}

/**
 * Update flight agreement
 */
export async function updateFlightAgreement(
  id: string, 
  updates: Partial<Omit<FlightAgreement, 'id' | 'created_at' | 'updated_at'>>
): Promise<FlightAgreement> {
  const { data, error } = await supabase
    .from('flight_agreements')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating flight agreement:', error);
    throw error;
  }

  return data;
}

/**
 * Delete flight agreement (and all associated deductions via CASCADE)
 */
export async function deleteFlightAgreement(id: string): Promise<void> {
  const { error } = await supabase
    .from('flight_agreements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting flight agreement:', error);
    throw error;
  }
}

/**
 * Get deductions for a flight agreement
 */
export async function getFlightAgreementDeductions(agreementId: string): Promise<FlightAgreementDeduction[]> {
  const { data, error } = await supabase
    .from('flight_agreement_deductions')
    .select('*')
    .eq('agreement_id', agreementId)
    .order('deduction_sequence', { ascending: true });

  if (error) {
    console.error('Error fetching flight agreement deductions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create multiple deductions for a flight agreement
 */
export async function createFlightAgreementDeductions(deductionsData: CreateDeductionData[]): Promise<FlightAgreementDeduction[]> {
  const { data, error } = await supabase
    .from('flight_agreement_deductions')
    .insert(deductionsData as any)
    .select();

  if (error) {
    console.error('Error creating flight agreement deductions:', error);
    throw error;
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
): Promise<FlightAgreementDeduction> {
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

  const { data, error } = await supabase
    .from('flight_agreement_deductions')
    .update(updates as any)
    .eq('id', deductionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deduction status:', error);
    throw error;
  }

  return data;
}

/**
 * Get pending deductions for payroll processing
 */
export async function getPendingDeductions(payrollPeriod?: string): Promise<FlightAgreementDeduction[]> {
  let query = supabase
    .from('flight_agreement_deductions')
    .select(`
      *,
      flight_agreements!inner(
        staff_id,
        staff_name,
        department,
        status
      )
    `)
    .eq('status', 'Pending')
    .eq('flight_agreements.status', 'Active');

  if (payrollPeriod) {
    query = query.eq('payroll_period', payrollPeriod);
  }

  const { data, error } = await query
    .order('deduction_date', { ascending: true });

  if (error) {
    console.error('Error fetching pending deductions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get deductions due for processing (by date range)
 */
export async function getDeductionsDueForProcessing(
  startDate: string,
  endDate: string
): Promise<FlightAgreementDeduction[]> {
  const { data, error } = await supabase
    .from('flight_agreement_deductions')
    .select(`
      *,
      flight_agreements!inner(
        staff_id,
        staff_name,
        department,
        status
      )
    `)
    .eq('status', 'Pending')
    .eq('flight_agreements.status', 'Active')
    .gte('deduction_date', startDate)
    .lte('deduction_date', endDate)
    .order('deduction_date', { ascending: true });

  if (error) {
    console.error('Error fetching deductions due for processing:', error);
    throw error;
  }

  return data || [];
}

/**
 * Cancel flight agreement (sets status to Cancelled and cancels all pending deductions)
 */
export async function cancelFlightAgreement(id: string, reason?: string): Promise<void> {
  // Start a transaction to update both agreement and deductions
  const { error: agreementError } = await supabase
    .from('flight_agreements')
    .update({
      status: 'cancelled',
      notes: reason || 'Agreement cancelled'
    } as any)
    .eq('id', id);

  if (agreementError) {
    console.error('Error cancelling flight agreement:', agreementError);
    throw agreementError;
  }

  // Cancel all pending deductions
  const { error: deductionsError } = await supabase
    .from('flight_agreement_deductions')
    .update({ 
      status: 'Cancelled',
      notes: reason ? `Agreement cancelled: ${reason}` : 'Agreement cancelled'
    })
    .eq('agreement_id', id)
    .eq('status', 'Pending');

  if (deductionsError) {
    console.error('Error cancelling deductions:', deductionsError);
    throw deductionsError;
  }
}
