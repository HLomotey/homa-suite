import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Invoice, SummaryMetrics } from "../types";
import { supabase } from "@/integration/supabase/client";

// Function to fetch the total line amount from the database
async function fetchTotalLineAmount(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('finance_invoices')
      .select('sum(line_total)')
      .single();

    if (error) {
      console.error('Error fetching total line amount:', error);
      return 0;
    }
    
    // Log the response to help debug
    console.log('Total line amount response:', data);
    
    // Handle different response formats
    if (!data) return 0;
    
    // Cast to unknown first to avoid TypeScript errors
    const rawData = data as unknown;
    
    // Check all possible response formats
    if (typeof rawData === 'object') {
      // Format 1: { sum: "123.45" } or { sum: 123.45 }
      if ('sum' in rawData && rawData.sum !== null) {
        if (typeof rawData.sum === 'string') {
          return parseFloat(rawData.sum) || 0;
        } else if (typeof rawData.sum === 'number') {
          return rawData.sum;
        }
      }
      
      // Format 2: Nested object with sum property
      const anyData = rawData as any;
      if (anyData.sum && typeof anyData.sum === 'object') {
        // Try to access common properties that might contain the sum
        const possibleProps = ['line_total', 'value', 'total'];
        for (const prop of possibleProps) {
          if (prop in anyData.sum) {
            const value = anyData.sum[prop];
            if (typeof value === 'string') {
              return parseFloat(value) || 0;
            } else if (typeof value === 'number') {
              return value;
            }
          }
        }
      }
    }
    
    // If we get here, log the unexpected format and return 0
    console.warn('Unexpected response format from sum query:', data);
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
