import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";

interface MonthlyRevenueProps {
  year?: number;
  month?: number;
}

export function MonthlyRevenue({ year, month }: MonthlyRevenueProps) {
  const { data: revenue, isLoading, error } = useRevenueMetrics(year, month);

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
  } else if (error || !revenue) {
    content = <div className="text-sm text-red-500">Error loading data</div>;
  } else {
    content = (
      <>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{formatCurrency(revenue.thisMonthRevenue)}</div>
          <div className={`flex items-center text-sm ${revenue.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span>{revenue.growthRate >= 0 ? '+' : ''}{revenue.growthRate.toFixed(1)}% vs LM</span>
            {revenue.growthRate >= 0 ? (
              <ArrowUpRight className="ml-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="ml-1 h-4 w-4" />
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatCurrency(revenue.lastMonthRevenue)} previous month
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-semibold">Total Revenue:</span> {formatCurrency(revenue.totalRevenue || 0)}
        </div>
      </>
    );
  }
  
  // Always return the same component structure
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
