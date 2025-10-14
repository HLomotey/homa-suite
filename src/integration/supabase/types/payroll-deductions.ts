/**
 * Payroll Deductions Type Definitions
 * Based on the actual table structure with Position ID and deduction amounts
 */

export interface PayrollDeduction {
  id: string;
  position_id: string;
  bcd_bus_card_deduction: number;
  hdd_hang_dep_ded_deduction: number;
  rnt_rent_deduction: number;
  trn_transport_subs_deduction: number;
  start_period: string;
  end_period: string;
  created_at: string;
  updated_at: string;
  // Mapped from external_staff
  staff_name?: string;
  home_department?: string;
}

export interface CreatePayrollDeduction {
  position_id: string;
  bcd_bus_card_deduction?: number;
  hdd_hang_dep_ded_deduction?: number;
  rnt_rent_deduction?: number;
  trn_transport_subs_deduction?: number;
  start_period: string;
  end_period: string;
}

export interface UpdatePayrollDeduction {
  position_id?: string;
  bcd_bus_card_deduction?: number;
  hdd_hang_dep_ded_deduction?: number;
  rnt_rent_deduction?: number;
  trn_transport_subs_deduction?: number;
  start_period?: string;
  end_period?: string;
}

export interface PayrollDeductionSummary {
  total_records: number;
  total_bus_card: number;
  total_security_deposit: number;
  total_rent: number;
  total_transport: number;
  total_all_deductions: number;
}

// Excel upload interface for processing uploaded files
export interface PayrollDeductionExcelRow {
  'Position ID': string;
  'BCD_Bus Card_Deduction': number | string;
  'Security_Deposit_Deduction': number | string;
  'RNT_Rent_Deduction': number | string;
  'TRN_Transport Subs_Deduction': number | string;
  'start_period': string;
  'end_period': string;
}
