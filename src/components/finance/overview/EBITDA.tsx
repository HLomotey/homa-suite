import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";

interface EBITDAProps {
  year?: number;
  month?: number;
}

export function EBITDA({ year, month }: EBITDAProps) {
  const { data: analytics, isLoading, error } = useFinanceAnalytics(year, month);

  const formatCurrency = (value: number): string => {
    // Display the exact value with 2 decimal places, no abbreviations
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Prepare content based on loading/error state
  let content;
  if (isLoading) {
    content = (
      <div className="flex items-center justify-center h-16">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  } else if (error || !analytics) {
    content = <div className="text-sm text-red-500">Error loading data</div>;
  } else {
    const previousCount = 280; // Mock previous month for comparison
    const countChange = analytics.totalInvoices - previousCount;
    const percentChange = previousCount > 0 ? (countChange / previousCount) * 100 : 0;
    
    content = (
      <>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{analytics.totalInvoices}</div>
          <div className={`flex items-center text-sm ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span>{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}% vs LM</span>
            {percentChange >= 0 ? (
              <ArrowUpRight className="ml-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="ml-1 h-4 w-4" />
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Avg: {formatCurrency(analytics.averageInvoiceValue)}
        </div>
      </>
    );
  }
  
  // Always return the same component structure
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Invoices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
