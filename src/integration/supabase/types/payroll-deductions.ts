/**
 * Payroll Deductions Type Definitions
 */

export interface PayrollDeduction {
  id: string;
  payroll_name: string;
  payroll_company_code: string | null;
  location_description: string | null;
  adv_advance_pay_deduction: number;
  bcd_bus_card_deduction: number;
  hdd_drug_dep_dtet_deduction: number;
  rnt_rent_deduction: number;
  trn_transport_subs_deduction: number;
  position_id: string | null;
  start_period: string | null;
  end_period: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePayrollDeduction {
  payroll_name: string;
  payroll_company_code?: string | null;
  location_description?: string | null;
  adv_advance_pay_deduction?: number;
  bcd_bus_card_deduction?: number;
  hdd_drug_dep_dtet_deduction?: number;
  rnt_rent_deduction?: number;
  trn_transport_subs_deduction?: number;
  position_id?: string | null;
  start_period?: string | null;
  end_period?: string | null;
}

export interface UpdatePayrollDeduction {
  payroll_name?: string;
  payroll_company_code?: string | null;
  location_description?: string | null;
  adv_advance_pay_deduction?: number;
  bcd_bus_card_deduction?: number;
  hdd_drug_dep_dtet_deduction?: number;
  rnt_rent_deduction?: number;
  trn_transport_subs_deduction?: number;
  position_id?: string | null;
  start_period?: string | null;
  end_period?: string | null;
}

export interface PayrollDeductionSummary {
  total_records: number;
  total_advance_pay: number;
  total_bus_card: number;
  total_drug_dep: number;
  total_rent: number;
  total_transport: number;
  total_all_deductions: number;
}
