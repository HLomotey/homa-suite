import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingDown, TrendingUp, FileText, CheckCircle, AlertTriangle, XCircle, Target, Receipt, Activity } from "lucide-react";
import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";
import { useExpenseAnalytics } from "@/hooks/finance/useExpenseAnalytics";
import { useProfitLoss } from "@/hooks/finance/useProfitLoss";
import { useRevenueForecasting } from "@/hooks/finance/useRevenueForecasting";


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
  const { data: expenseData, isLoading: isExpenseLoading } = useExpenseAnalytics(dateRanges);
  const { data: profitLossData, isLoading: isPLLoading } = useProfitLoss(dateRanges);
  const { data: forecastData, isLoading: isForecastLoading } = useRevenueForecasting();
  
  // State for dashboard tabs
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // Format percentage values
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
  };



  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Financial Dashboard</h3>
        <Badge variant="outline" className="ml-2">Enhanced Analytics</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Comprehensive financial performance and forecasting</p>
      </div>

      {/* Enhanced Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profit-loss">P&L Analysis</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analytics</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Tab Content */}

          <div className="grid grid-cols-4 gap-4">
            {/* Total Revenue Card */}
            <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
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

            {/* Total Expenses Card */}
            <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-100 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isExpenseLoading ? "Loading..." : formatCurrency(expenseData?.totalExpenses)}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-xs text-red-300">
                    {isExpenseLoading ? "Calculating..." : `${expenseData?.expenseCount || 0} transactions`}
                  </p>
                  <p className="text-xs text-red-200">
                    Approved: {formatCurrency(expenseData?.approvedExpenses)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Net Profit Card */}
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isPLLoading ? "Loading..." : formatCurrency(profitLossData?.currentPeriod.netProfit)}
                </div>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-blue-300">
                    {isPLLoading ? "Calculating..." : `${formatPercentage(profitLossData?.currentPeriod.profitMargin)} margin`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Projected Revenue Card */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Projected Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isForecastLoading ? "Loading..." : formatCurrency(forecastData?.projectedRevenue)}
                </div>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-purple-300">
                    {isForecastLoading ? "Calculating..." : `${formatPercentage(forecastData?.confidenceLevel)} confidence`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

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
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          {/* P&L Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(profitLossData?.currentPeriod.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expenses:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(profitLossData?.currentPeriod.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Net Profit:</span>
                    <span className={`font-bold ${(profitLossData?.currentPeriod.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profitLossData?.currentPeriod.netProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Margins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Margin:</span>
                    <span className="font-medium">
                      {formatPercentage(profitLossData?.currentPeriod.profitMargin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projected Margin:</span>
                    <span className="font-medium">
                      {formatPercentage(profitLossData?.currentPeriod.projectedProfitMargin)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Operating Margin:</span>
                    <span className="font-medium">
                      {formatPercentage(profitLossData?.keyMetrics.operatingMargin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Flow:</span>
                    <span className="font-medium">
                      {formatCurrency(profitLossData?.keyMetrics.cashFlow)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Runway:</span>
                    <span className="font-medium">
                      {profitLossData?.keyMetrics.runway?.toFixed(1) || 0} months
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profitLossData?.expenseBreakdown.slice(0, 8).map((expense, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium capitalize">{expense.category}</div>
                    <div className="text-lg font-bold">{formatCurrency(expense.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(expense.percentage)} of total
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* Expense Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(expenseData?.totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">{expenseData?.expenseCount} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(expenseData?.approvedExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(expenseData?.approvalMetrics.approvalRate)} approval rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(expenseData?.pendingExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  {expenseData?.approvalMetrics.pendingCount} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(expenseData?.averageExpenseAmount)}</div>
                <p className="text-xs text-muted-foreground">per transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseData?.expensesByCategory.slice(0, 6).map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{category.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.count} transactions • Avg: {formatCurrency(category.averageAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(category.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(category.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Payees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Top Payees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expenseData?.topPayees.slice(0, 5).map((payee, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <div>
                      <div className="font-medium">{payee.payee}</div>
                      <div className="text-sm text-muted-foreground">
                        {payee.count} transactions • {payee.categories.join(', ')}
                      </div>
                    </div>
                    <div className="font-bold">{formatCurrency(payee.amount)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          {/* Forecasting Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(forecastData?.currentRevenue)}</div>
                <p className="text-xs text-muted-foreground">Last month actual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forecastData?.growthRate ? `${forecastData.growthRate > 0 ? '+' : ''}${forecastData.growthRate.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Forecast Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(forecastData?.confidenceLevel)}</div>
                <p className="text-xs text-muted-foreground">Prediction accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">6-Month Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecastData?.forecastPeriods.map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{period.period}</div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {formatPercentage(period.confidence)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(period.projected)}</div>
                      <div className="text-sm text-muted-foreground">
                        {period.factors.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Opportunities</h4>
                  <ul className="space-y-1">
                    {forecastData?.keyInsights.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <ul className="space-y-1">
                    {forecastData?.keyInsights.riskFactors.map((risk, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
