import { useMemo } from "react";
import { Invoice, SummaryMetrics } from "../types";

export function useSummaryMetrics(invoices: Invoice[], totalCount: number): SummaryMetrics {
  const summaryMetrics = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        totalInvoiceCount: 0,
        totalQuantity: 0,
        totalLineAmount: 0
      };
    }

    return {
      totalInvoiceCount: totalCount,
      totalQuantity: invoices.reduce((sum, inv) => sum + inv.quantity, 0),
      totalLineAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.line_total), 0)
    };
  }, [invoices, totalCount]);

  return summaryMetrics;
}
