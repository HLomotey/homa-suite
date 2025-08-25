import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, TrendingUp, FileText, CheckCircle, Clock } from "lucide-react";
import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";

export interface FinanceMetricsProps {
  year?: number;
  month?: number;
}

export function FinanceAnalyticsTab({ year, month }: FinanceMetricsProps) {
  const { data: financeData, isLoading } = useFinanceAnalytics(year, month);
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueMetrics(year, month);
  
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

  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Finance Analytics</h3>
        <Badge variant="outline" className="ml-2">Finance</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Revenue and financial performance metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : formatCurrency(financeData?.totalRevenue)}
            </div>
            <div className="flex items-center mt-1">
              {isLoading || isRevenueLoading ? null : revenueData?.growthRate && revenueData.growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${isLoading || isRevenueLoading ? "text-gray-400" : revenueData?.growthRate && revenueData.growthRate > 0 ? "text-green-500" : "text-red-500"}`}>
                {isLoading || isRevenueLoading ? "Calculating..." : revenueData?.growthRate ? `${revenueData.growthRate > 0 ? "+" : ""}${revenueData.growthRate.toFixed(1)}% from last month` : "No change"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Invoices Card */}
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : financeData?.totalInvoices || 0}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-blue-300">
                {isLoading ? "Calculating..." : `${formatCurrency(financeData?.averageInvoiceValue)} average value`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Paid Invoices Card */}
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : financeData?.paidInvoices || 0}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-emerald-300">
                {isLoading ? "Calculating..." : financeData && financeData.totalInvoices > 0
                  ? `${((financeData.paidInvoices / financeData.totalInvoices) * 100).toFixed(0)}% of total`
                  : "0% of total"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Invoices Card */}
        <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : (financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0)}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-amber-300">
                {isLoading ? "Calculating..." : formatCurrency(
                  financeData?.averageInvoiceValue && financeData?.averageInvoiceValue > 0
                    ? financeData.averageInvoiceValue * ((financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0))
                    : 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Monthly Revenue Card */}
        <Card className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border-indigo-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading || isRevenueLoading ? "Loading..." : formatCurrency(revenueData?.thisMonthRevenue)}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-indigo-300">
                {isLoading || isRevenueLoading ? "Calculating..." : `vs ${formatCurrency(revenueData?.lastMonthRevenue)} last month`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Invoice Value Card */}
        <Card className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border-violet-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-100">Avg Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : formatCurrency(financeData?.averageInvoiceValue)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
