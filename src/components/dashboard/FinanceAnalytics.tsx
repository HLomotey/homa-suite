import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";
import { useQueryClient } from "@tanstack/react-query";

interface FinanceAnalyticsProps {
  year?: number;
  month?: number;
}

export function FinanceAnalytics({ year, month }: FinanceAnalyticsProps) {
  const queryClient = useQueryClient();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useFinanceAnalytics(year, month);
  const { data: revenue, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueMetrics(year, month);
  
  const handleRefresh = async () => {
    await Promise.all([
      refetchAnalytics(),
      refetchRevenue()
    ]);
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  if (analyticsLoading || revenueLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 h-full">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading finance data...</span>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="grid gap-4 grid-cols-1 h-full">
        <div className="flex items-center justify-center h-48">
          <p className="text-red-500">Error loading finance data: {analyticsError.message}</p>
        </div>
      </div>
    );
  }

  if (!analytics || !revenue) return null;

  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Finance & Accounting</h3>
        <Badge variant="outline" className="ml-2">
          FIN
        </Badge>
        <p className="text-sm text-muted-foreground ml-auto">
          Financial performance and revenue analytics
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={analyticsLoading || revenueLoading}
          className="ml-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(analytics.totalRevenue)}
            </div>
            <div className="flex items-center mt-1">
              {revenue.growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p
                className={`text-xs ${
                  revenue.growthRate > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {revenue.growthRate > 0 ? "+" : ""}
                {revenue.growthRate.toFixed(1)}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Invoices Card */}
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.totalInvoices.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-blue-300">
                Avg: {formatCurrency(analytics.averageInvoiceValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Paid Invoices Card */}
        <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">
              Paid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.paidInvoices.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-amber-300">
                {((analytics.paidInvoices / analytics.totalInvoices) * 100).toFixed(1)}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending/Overdue Card */}
        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(analytics.pendingInvoices + analytics.overdueInvoices + analytics.sentInvoices).toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-orange-300">
                {analytics.overdueInvoices} overdue, {analytics.sentInvoices} sent
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* This Month Revenue Card */}
        <Card className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-100">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(revenue.thisMonthRevenue)}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-cyan-300">
                Last month: {formatCurrency(revenue.lastMonthRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Client Card */}
        <Card className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border-violet-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-100">
              Top Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white truncate">
              {analytics.topClients[0]?.client_name || 'N/A'}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-violet-300">
                {formatCurrency(analytics.topClients[0]?.total_revenue || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
