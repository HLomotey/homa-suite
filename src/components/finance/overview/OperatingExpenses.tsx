import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";

interface OperatingExpensesProps {
  year?: number;
  month?: number;
}

export function OperatingExpenses({ year, month }: OperatingExpensesProps) {
  const { data: analytics, isLoading, error } = useFinanceAnalytics(year, month);

  if (isLoading) {
    return (
      <Card className="bg-background border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Outstanding
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

  if (error || !analytics) {
    return (
      <Card className="bg-background border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Outstanding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">Error loading data</div>
        </CardContent>
      </Card>
    );
  }

  const outstandingInvoices = analytics.pendingInvoices + analytics.overdueInvoices + analytics.sentInvoices;
  const previousOutstanding = 45; // Mock previous month for comparison
  const outstandingChange = outstandingInvoices - previousOutstanding;
  const percentChange = previousOutstanding > 0 ? (outstandingChange / previousOutstanding) * 100 : 0;
  
  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Outstanding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{outstandingInvoices}</div>
          <div className={`flex items-center text-sm ${percentChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span>{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}% vs LM</span>
            {percentChange <= 0 ? (
              <ArrowDownRight className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpRight className="ml-1 h-4 w-4" />
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {analytics.overdueInvoices} overdue, {analytics.sentInvoices} sent
        </div>
      </CardContent>
    </Card>
  );
}
