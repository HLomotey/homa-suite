import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Invoice, SummaryMetrics } from "../types";
import { supabase } from "@/integration/supabase/client";

// Function to fetch the total line amount from the database
async function fetchTotalLineAmount(): Promise<number> {
  try {
    // Use RPC function or aggregate query instead of malformed sum syntax
    const { data, error } = await supabase
      .rpc('get_finance_invoices_total');

    if (error) {
      console.error('Error fetching total line amount:', error);
      return 0;
    }
    
    // Log the response to help debug
    console.log('Total line amount response:', data);
    
    // RPC function returns a simple numeric value
    if (data === null || data === undefined) return 0;
    
    // Convert to number if it's a string
    if (typeof data === 'string') {
      return parseFloat(data) || 0;
    }
    
    // Return as number if it's already a number
    if (typeof data === 'number') {
      return data;
    }
    
    // If we get here, log the unexpected format and return 0
    console.warn('Unexpected response format from RPC function:', data);
    return 0;
  } catch (err) {
    console.error('Exception in fetchTotalLineAmount:', err);
    return 0;
  }
}

export function useSummaryMetrics(invoices: Invoice[], totalCount: number): SummaryMetrics {
  // Fetch the total line amount directly from the database
  const { data: totalLineAmount = 0, isLoading } = useQuery({
    queryKey: ['finance_invoices_total_line_amount'],
    queryFn: fetchTotalLineAmount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const summaryMetrics = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        totalInvoiceCount: 0,
        totalQuantity: 0,
        totalLineAmount: isLoading ? 0 : totalLineAmount
      };
    }

    return {
      totalInvoiceCount: totalCount,
      totalQuantity: invoices.reduce((sum, inv) => sum + inv.quantity, 0),
      // Use the total from the database query instead of calculating from paginated invoices
      totalLineAmount: isLoading ? 0 : totalLineAmount
    };
  }, [invoices, totalCount, totalLineAmount, isLoading]);

  return summaryMetrics;
}
