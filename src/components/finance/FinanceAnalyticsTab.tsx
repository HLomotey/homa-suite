import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, TrendingUp, FileText, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";

interface DateRange {
  year: number;
  month: number;
  label: string;
}

export interface FinanceMetricsProps {
  dateRanges?: DateRange[];
}

export function FinanceAnalyticsTab({ dateRanges }: FinanceMetricsProps) {
  const { data: financeData, isLoading } = useFinanceAnalytics(dateRanges);
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueMetrics(dateRanges);
  
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

      <div className="grid grid-cols-3 gap-4">
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
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-blue-300">
                {isLoading ? "Calculating..." : `${formatCurrency(financeData?.averageInvoiceValue)} average value`}
              </p>
              {!isLoading && financeData && (
                <div className="text-xs text-blue-200 space-y-0.5">
                  <div>Paid: {financeData.paidInvoices}</div>
                  <div>Sent: {financeData.sentInvoices}</div>
                  <div>Overdue: {financeData.overdueInvoices}</div>
                  {financeData.pendingInvoices > 0 && <div>Pending: {financeData.pendingInvoices}</div>}
                  {financeData.cancelledInvoices > 0 && <div>Cancelled: {financeData.cancelledInvoices}</div>}
                </div>
              )}
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

      {/* Invoice Status Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {/* Paid Invoices Card */}
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Paid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : financeData?.paidInvoices || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-emerald-300">
                {isLoading ? "Calculating..." : financeData && financeData.totalInvoices > 0
                  ? `${((financeData.paidInvoices / financeData.totalInvoices) * 100).toFixed(1)}% of ${financeData.totalInvoices} total`
                  : "0% of total"}
              </p>
              {!isLoading && financeData && financeData.paidInvoices > 0 && (
                <p className="text-xs text-emerald-200">
                  Revenue: {formatCurrency((financeData.paidInvoices / financeData.totalInvoices) * financeData.totalRevenue)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sent Invoices Card */}
        <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : financeData?.sentInvoices || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-yellow-300">
                {isLoading ? "Calculating..." : financeData && financeData.totalInvoices > 0
                  ? `${(((financeData.sentInvoices || 0) / financeData.totalInvoices) * 100).toFixed(1)}% of ${financeData.totalInvoices} total`
                  : "0% of total"}
              </p>
              {!isLoading && financeData && financeData.sentInvoices > 0 && (
                <p className="text-xs text-yellow-200">
                  Awaiting Payment: {formatCurrency(((financeData.sentInvoices || 0) / financeData.totalInvoices) * financeData.totalRevenue)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Invoices Card */}
        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : financeData?.overdueInvoices || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-red-300">
                {isLoading ? "Calculating..." : financeData && financeData.totalInvoices > 0
                  ? `${(((financeData.overdueInvoices || 0) / financeData.totalInvoices) * 100).toFixed(1)}% of ${financeData.totalInvoices} total`
                  : "0% of total"}
              </p>
              {!isLoading && financeData && financeData.overdueInvoices > 0 && (
                <p className="text-xs text-red-200">
                  Outstanding: {formatCurrency(((financeData.overdueInvoices || 0) / financeData.totalInvoices) * financeData.totalRevenue)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Status Card - Shows pending/cancelled if they exist */}
        {!isLoading && financeData && (financeData.pendingInvoices > 0 || financeData.cancelledInvoices > 0) && (
          <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border-gray-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-100 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Other Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(financeData?.pendingInvoices || 0) + (financeData?.cancelledInvoices || 0)}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {financeData.pendingInvoices > 0 && (
                  <p className="text-xs text-gray-300">
                    Pending: {financeData.pendingInvoices}
                  </p>
                )}
                {financeData.cancelledInvoices > 0 && (
                  <p className="text-xs text-gray-300">
                    Cancelled: {financeData.cancelledInvoices}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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

        {/* Collection Rate Card */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : `${financeData?.collectionRate?.toFixed(1) || 0}%`}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-purple-300">
                {isLoading ? "Calculating..." : "Payment success rate"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
