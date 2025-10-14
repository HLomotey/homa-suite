import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { PayrollDeductionSummary } from "@/integration/supabase/types/payroll-deductions";

/**
 * Fetch payroll deduction summary statistics
 */
export const usePayrollDeductionSummary = (filters?: {
  startPeriod?: string;
  endPeriod?: string;
  companyCode?: string;
}) => {
  return useQuery({
    queryKey: ["payroll-deductions", "summary", filters],
    queryFn: async (): Promise<PayrollDeductionSummary> => {
      let query = (supabase
        .from("payroll_deductions") as any)
        .select("*");

      if (filters?.startPeriod) {
        query = query.gte("start_period", filters.startPeriod);
      }

      if (filters?.endPeriod) {
        query = query.lte("end_period", filters.endPeriod);
      }

      if (filters?.companyCode) {
        query = query.eq("payroll_company_code", filters.companyCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching payroll deduction summary:", error);
        throw error;
      }

      // Calculate totals
      const summary: PayrollDeductionSummary = {
        total_records: data?.length || 0,
        total_advance_pay: 0,
        total_bus_card: 0,
        total_drug_dep: 0,
        total_rent: 0,
        total_transport: 0,
        total_all_deductions: 0,
      };

      data?.forEach((record) => {
        summary.total_advance_pay += Number(record.adv_advance_pay_deduction) || 0;
        summary.total_bus_card += Number(record.bcd_bus_card_deduction) || 0;
        summary.total_drug_dep += Number(record.hdd_drug_dep_dtet_deduction) || 0;
        summary.total_rent += Number(record.rnt_rent_deduction) || 0;
        summary.total_transport += Number(record.trn_transport_subs_deduction) || 0;
      });

      summary.total_all_deductions =
        summary.total_advance_pay +
        summary.total_bus_card +
        summary.total_drug_dep +
        summary.total_rent +
        summary.total_transport;

      return summary;
    },
  });
};
