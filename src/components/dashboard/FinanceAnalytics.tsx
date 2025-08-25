import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, FileText, CheckCircle, Clock, AlertCircle, Send, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function FinanceAnalytics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const queryClient = useQueryClient();

  const { data: financeData, isLoading, error, isError, refetch } = useFinanceAnalytics(selectedYear, selectedMonth);
  const { data: revenueData, isLoading: isRevenueLoading, refetch: refetchRevenue } = useRevenueMetrics(selectedYear, selectedMonth);
  
  const handleRefresh = () => {
    refetch();
    refetchRevenue();
  };

  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Loading state
  if (isLoading || isRevenueLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Finance Analytics</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refreshing...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-36 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Finance Analytics</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Finance Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            <Button className="mt-4" variant="outline" onClick={handleRefresh}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Finance Analytics</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financeData?.totalRevenue)}</div>
            {revenueData && (
              <p className="text-xs text-muted-foreground">
                {revenueData.growthRate > 0 ? (
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {revenueData.growthRate.toFixed(1)}% from last month
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    {Math.abs(revenueData.growthRate).toFixed(1)}% from last month
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Total Invoices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeData?.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(financeData?.averageInvoiceValue)} average value
            </p>
          </CardContent>
        </Card>

        {/* Paid Invoices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financeData?.paidInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              {financeData && financeData.totalInvoices > 0
                ? ((financeData.paidInvoices / financeData.totalInvoices) * 100).toFixed(0)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Invoices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                financeData?.averageInvoiceValue && financeData?.averageInvoiceValue > 0
                  ? financeData.averageInvoiceValue * ((financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0))
                  : 0
              )}{" "}
              outstanding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>
            Revenue trends over the past {financeData?.monthlyRevenue?.length || 0} months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {financeData?.monthlyRevenue && financeData.monthlyRevenue.length > 0 ? (
            <div className="h-[200px]">
              <div className="flex h-full items-end gap-2">
                {financeData.monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...financeData.monthlyRevenue.map((m) => m.revenue));
                  const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="relative flex h-full w-full flex-col justify-end">
                      <div
                        className="bg-primary rounded-md w-full animate-in"
                        style={{ height: `${height}%` }}
                      />
                      <span className="mt-1 text-center text-xs text-muted-foreground">
                        {month.month}
                      </span>
                      <span className="text-center text-xs font-medium">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No monthly revenue data available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
            <CardDescription>Current status of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {financeData?.statusDistribution && financeData.statusDistribution.length > 0 ? (
              <div className="space-y-4">
                {financeData.statusDistribution.map((status, index) => {
                  let badgeColor = "";
                  let icon = null;

                  switch (status.status.toLowerCase()) {
                    case "paid":
                      badgeColor = "bg-green-100 text-green-800";
                      icon = <CheckCircle className="h-4 w-4 mr-1" />;
                      break;
                    case "pending":
                      badgeColor = "bg-yellow-100 text-yellow-800";
                      icon = <Clock className="h-4 w-4 mr-1" />;
                      break;
                    case "overdue":
                      badgeColor = "bg-red-100 text-red-800";
                      icon = <AlertCircle className="h-4 w-4 mr-1" />;
                      break;
                    case "sent":
                      badgeColor = "bg-blue-100 text-blue-800";
                      icon = <Send className="h-4 w-4 mr-1" />;
                      break;
                    default:
                      badgeColor = "bg-gray-100 text-gray-800";
                  }

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className={`mr-2 ${badgeColor} flex items-center`}>
                          {icon}
                          {status.status}
                        </Badge>
                        <span>{status.count} invoices</span>
                      </div>
                      <span className="text-sm font-medium">{status.percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No status distribution data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Clients by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {financeData?.topClients && financeData.topClients.length > 0 ? (
              <div className="space-y-4">
                {financeData.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{client.client_name || 'Unknown Client'}</p>
                      <p className="text-xs text-muted-foreground">{client.invoice_count} invoices</p>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(client.total_revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No client data available</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Data Completeness Indicator */}
      {financeData && !financeData.isDataComplete && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-amber-800">
                Note: Some finance data may be incomplete due to large dataset size. The displayed metrics represent the available data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Month/Year Selector */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const date = new Date();
            setSelectedYear(date.getFullYear());
            setSelectedMonth(date.getMonth() + 1);
          }}
        >
          Reset to Current
        </Button>
      </div>
      
      {/* Data Source Information */}
      <div className="text-xs text-muted-foreground text-right">
        Data source: finance_invoices table | Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
