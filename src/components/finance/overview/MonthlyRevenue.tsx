import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";

export function MonthlyRevenue() {
  const { data: revenue, isLoading, error } = useRevenueMetrics();

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !revenue) {
    return (
      <Card className="bg-background border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">Error loading data</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
