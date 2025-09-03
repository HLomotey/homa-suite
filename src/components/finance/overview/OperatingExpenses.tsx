import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";

interface OperatingExpensesProps {
  year?: number;
  month?: number;
}

export function OperatingExpenses({ year, month }: OperatingExpensesProps) {
  const { data: analytics, isLoading, error } = useFinanceAnalytics(year, month);

  // Mock data based on dashboard screenshot
  const mockData = {
    outstanding: 74,
    previousOutstanding: 82,
    overdueCount: 28,
    sentCount: 46,
    totalValue: 285000,
    changePercent: -9.8,
    riskLevel: "medium"
  };

  const outstandingData = analytics ? {
    outstanding: (analytics.pendingInvoices || 0) + (analytics.overdueInvoices || 0) + (analytics.sentInvoices || 0) || mockData.outstanding,
    previousOutstanding: mockData.previousOutstanding,
    overdueCount: analytics.overdueInvoices || mockData.overdueCount,
    sentCount: analytics.sentInvoices || mockData.sentCount,
    totalValue: mockData.totalValue,
    changePercent: mockData.changePercent,
    riskLevel: mockData.riskLevel
  } : mockData;

  // Prepare content based on loading/error state
  let content;
  if (isLoading) {
    content = (
      <div className="flex items-center justify-center h-16">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  } else if (error && !analytics) {
    content = <div className="text-sm text-red-500">Error loading data</div>;
  } else {
    const isImprovement = outstandingData.changePercent < 0;
    const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;
    
    content = (
      <>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold text-foreground">
            {outstandingData.outstanding}
          </div>
          <div className={`flex items-center text-sm ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
            {isImprovement ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            <span>{outstandingData.changePercent.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            Value: {formatCurrency(outstandingData.totalValue)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <Badge variant={outstandingData.riskLevel === "low" ? "default" : "secondary"} className="text-xs">
              {outstandingData.riskLevel}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {outstandingData.overdueCount} overdue • {outstandingData.sentCount} sent
          </div>
        </div>
      </>
    );
  }
  
  return (
    <Card className="bg-background border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Outstanding
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {content}
      </CardContent>
    </Card>
  );
}
