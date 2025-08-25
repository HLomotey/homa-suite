import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";

interface GrossMarginProps {
  year?: number;
  month?: number;
}

export function GrossMargin({ year, month }: GrossMarginProps) {
  const { data: analytics, isLoading, error } = useFinanceAnalytics(year, month);

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
    // Calculate gross margin based on paid invoices vs total revenue
    const grossMargin = analytics.totalInvoices > 0 
      ? ((analytics.paidInvoices / analytics.totalInvoices) * 100)
      : 0;
    
    const previousMargin = 85; // Mock previous month for comparison
    const marginChange = grossMargin - previousMargin;
    
    content = (
      <>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{grossMargin.toFixed(1)}%</div>
          <div className={`flex items-center text-sm ${marginChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span>{marginChange >= 0 ? '+' : ''}{marginChange.toFixed(1)}% vs LM</span>
            {marginChange >= 0 ? (
              <ArrowUpRight className="ml-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="ml-1 h-4 w-4" />
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {analytics.paidInvoices} of {analytics.totalInvoices} invoices paid
        </div>
      </>
    );
  }
  
  // Always return the same component structure
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Payment Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
