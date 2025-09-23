import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingDown, TrendingUp, FileText, CheckCircle, AlertTriangle, XCircle, Target, Receipt, Activity } from "lucide-react";
import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";
import { useFinanceExpenses } from "@/hooks/finance";
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
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { data: financeData, isLoading } = useFinanceAnalytics(year, month);
  const { data: revenueData, isLoading: isRevenueLoading } = useRevenueMetrics(dateRanges);
  const { data: expenses = [], isLoading: isExpenseLoading } = useFinanceExpenses();
  const { data: forecastData, isLoading: isForecastLoading } = useRevenueForecasting();
  
  // State for dashboard tabs
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate expense analytics from real data
  const expenseData = React.useMemo(() => {
    console.log('FinanceAnalyticsTab: Processing expenses:', expenses.length, 'expenses');
    if (!expenses.length) {
      return {
        totalExpenses: 0,
        approvedExpenses: 0,
        pendingExpenses: 0,
        rejectedExpenses: 0,
        expenseCount: 0,
        averageExpenseAmount: 0,
        expensesByCategory: [],
        expensesByDepartment: [],
        topPayees: [],
        approvalMetrics: {
          approvalRate: 100,
          avgApprovalTime: 0,
          pendingCount: 0,
          rejectedCount: 0,
        },
      };
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || expense.total || 0), 0);
    const expenseCount = expenses.length;
    const averageExpenseAmount = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    
    // Calculate approval status metrics
    const approvedExpenses = expenses
      .filter(expense => expense.approvalStatus === 'approved')
      .reduce((sum, expense) => sum + (expense.amount || expense.total || 0), 0);
    
    const pendingExpenses = expenses
      .filter(expense => expense.approvalStatus === 'pending' || !expense.approvalStatus)
      .reduce((sum, expense) => sum + (expense.amount || expense.total || 0), 0);
    
    const rejectedExpenses = expenses
      .filter(expense => expense.approvalStatus === 'rejected')
      .reduce((sum, expense) => sum + (expense.amount || expense.total || 0), 0);
    
    const approvedCount = expenses.filter(expense => expense.approvalStatus === 'approved').length;
    const pendingCount = expenses.filter(expense => expense.approvalStatus === 'pending' || !expense.approvalStatus).length;
    const rejectedCount = expenses.filter(expense => expense.approvalStatus === 'rejected').length;
    
    const approvalRate = expenseCount > 0 ? (approvedCount / expenseCount) * 100 : 0;
    
    console.log('FinanceAnalyticsTab: Calculated totals:', {
      totalExpenses,
      expenseCount,
      averageExpenseAmount
    });

    // Category breakdown
    const categoryData = expenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += (expense.amount || expense.total || 0);
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const expensesByCategory = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        averageAmount: data.count > 0 ? data.amount / data.count : 0,
        monthOverMonthChange: 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Company/Department breakdown
    const departmentData = expenses.reduce((acc, expense) => {
      const department = expense.company || 'Unassigned';
      if (!acc[department]) {
        acc[department] = { amount: 0, count: 0 };
      }
      acc[department].amount += (expense.amount || expense.total || 0);
      acc[department].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const expensesByDepartment = Object.entries(departmentData)
      .map(([department, data]) => ({
        department,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top payees
    const payeeData = expenses.reduce((acc, expense) => {
      const payee = expense.payee || 'Unknown';
      if (!acc[payee]) {
        acc[payee] = { amount: 0, count: 0, categories: new Set() };
      }
      acc[payee].amount += (expense.amount || expense.total || 0);
      acc[payee].count += 1;
      acc[payee].categories.add(expense.category || 'other');
      return acc;
    }, {} as Record<string, { amount: number; count: number; categories: Set<string> }>);

    const topPayees = Object.entries(payeeData)
      .map(([payee, data]) => ({
        payee,
        amount: data.amount,
        count: data.count,
        categories: Array.from(data.categories),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      totalExpenses,
      approvedExpenses,
      pendingExpenses,
      rejectedExpenses,
      expenseCount,
      averageExpenseAmount,
      expensesByCategory,
      expensesByDepartment,
      topPayees,
      approvalMetrics: {
        approvalRate,
        avgApprovalTime: 0, // Could be calculated if we track approval timestamps
        pendingCount,
        rejectedCount,
      },
    };
  }, [expenses]);
  
  // Calculate P&L data from real expense and revenue data
  const profitLossData = React.useMemo(() => {
    const revenue = financeData?.metrics?.totalRevenue || 0;
    const totalExpenses = expenseData.totalExpenses; // Real expense data from finance_expenses table
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      currentPeriod: {
        revenue,
        expenses: totalExpenses, // Using real expense data
        projectedRevenue: forecastData?.projectedRevenue || 0,
        projectedExpenses: totalExpenses,
        grossProfit: netProfit,
        netProfit,
        profitMargin,
        projectedProfitMargin: profitMargin,
      },
      expenseBreakdown: expenseData.expensesByCategory.map(cat => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
        budgetVariance: 0,
        projectedAmount: 0,
      })),
      keyMetrics: {
        totalRevenue: revenue,
        totalExpenses: totalExpenses, // Using real expense data
        totalProjectedRevenue: forecastData?.projectedRevenue || 0,
        totalProjectedExpenses: totalExpenses,
        operatingMargin: profitMargin,
        cashFlow: netProfit,
        burnRate: totalExpenses, // Using real expense data
        runway: totalExpenses > 0 ? revenue / totalExpenses : 0,
      },
    };
  }, [financeData, expenseData, forecastData]);
  
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
                  {isLoading ? "Loading..." : formatCurrency(financeData?.metrics?.totalRevenue)}
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
                <div className="text-xs text-red-200 mt-1">
                  Real data from finance_expenses
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
                  {isLoading ? "Loading..." : formatCurrency(profitLossData?.currentPeriod.netProfit)}
                </div>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-blue-300">
                    {isLoading ? "Calculating..." : `${formatPercentage(profitLossData?.currentPeriod.profitMargin)} margin`}
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
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? "Loading..." : financeData?.metrics?.totalInvoices || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-blue-300">
                {isLoading ? "Calculating..." : `${formatCurrency(financeData?.metrics?.averageInvoiceValue)} average value`}
              </p>
              {!isLoading && financeData && (
                <div className="text-xs text-blue-200 space-y-0.5">
                  <div>Paid: {financeData.metrics.paidInvoices}</div>
                  <div>Sent: {financeData.metrics.pending}</div>
                  <div>Overdue: {financeData.metrics.overdue}</div>
                  {financeData.metrics.cancelledInvoices > 0 && <div>Cancelled: {financeData.metrics.cancelledInvoices}</div>}
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
              {isLoading ? "Loading..." : formatCurrency(financeData?.metrics?.averageInvoiceValue)}
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
              {isLoading ? "Loading..." : financeData?.metrics?.paidInvoices || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-emerald-300">
                {isLoading ? "Calculating..." : financeData && financeData.metrics.totalInvoices > 0
                  ? `${((financeData.metrics.paidInvoices / financeData.metrics.totalInvoices) * 100).toFixed(1)}% of ${financeData.metrics.totalInvoices} total`
                  : "0% of total"}
              </p>
              {!isLoading && financeData && financeData.metrics.paidInvoices > 0 && (
                <p className="text-xs text-emerald-200">
                  Revenue: {formatCurrency((financeData.metrics.paidInvoices / financeData.metrics.totalInvoices) * financeData.metrics.totalRevenue)}
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
              {isLoading ? "Loading..." : financeData?.metrics?.pending || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-yellow-300">
                {isLoading ? "Calculating..." : financeData && financeData.metrics.totalInvoices > 0
                  ? `${(((financeData.metrics.pending || 0) / financeData.metrics.totalInvoices) * 100).toFixed(1)}% of ${financeData.metrics.totalInvoices} total`
                  : "0% of total"}
              </p>
              {!isLoading && financeData && financeData.metrics.pending > 0 && (
                <p className="text-xs text-yellow-200">
                  Awaiting Payment: {formatCurrency(((financeData.metrics.pending || 0) / financeData.metrics.totalInvoices) * financeData.metrics.totalRevenue)}
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
              {isLoading ? "Loading..." : financeData?.metrics?.overdue || 0}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-red-300">
                {isLoading ? "Calculating..." : financeData && financeData.metrics.totalInvoices > 0
                  ? `${(((financeData.metrics.overdue || 0) / financeData.metrics.totalInvoices) * 100).toFixed(1)}% of ${financeData.metrics.totalInvoices} total`
                  : "0% of total"}
              </p>
              {!isLoading && financeData && financeData.metrics.overdue > 0 && (
                <p className="text-xs text-red-200">
                  Outstanding: {formatCurrency(((financeData.metrics.overdue || 0) / financeData.metrics.totalInvoices) * financeData.metrics.totalRevenue)}
                </p>
              )}
            </div>
          </CardContent>
            </Card>

            {/* Additional Status Card - Shows pending/cancelled if they exist */}
            {!isLoading && financeData && financeData.metrics.cancelledInvoices > 0 && (
              <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border-gray-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-100 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {financeData?.metrics?.cancelledInvoices || 0}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-xs text-gray-300">
                  Cancelled: {financeData.metrics.cancelledInvoices}
                </p>
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
              {isLoading ? "Loading..." : `${financeData?.metrics?.collectionRate?.toFixed(1) || 0}%`}
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
          <div className="grid grid-cols-5 gap-4">
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approved
                </CardTitle>
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Pending
                </CardTitle>
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(expenseData?.rejectedExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  {expenseData?.approvalMetrics.rejectedCount} rejected
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

          {/* Department/Company Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Expenses by Company/Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseData?.expensesByDepartment.slice(0, 6).map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{dept.department}</div>
                      <div className="text-sm text-muted-foreground">
                        {dept.count} transactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(dept.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(dept.percentage)}
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
                <div className="text-2xl font-bold">{formatCurrency(financeData?.metrics?.totalRevenue)}</div>
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
                {forecastData?.forecastPeriods?.map((period, index) => (
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
                        {period.factors?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="p-3 bg-muted rounded-lg text-center text-muted-foreground">
                    No forecast periods available
                  </div>
                )}
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
                    {forecastData?.keyInsights?.opportunities?.map((opportunity, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {opportunity}
                      </li>
                    )) || (
                      <li className="text-sm text-muted-foreground">
                        No opportunities identified
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <ul className="space-y-1">
                    {forecastData?.keyInsights?.riskFactors?.map((risk, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        {risk}
                      </li>
                    )) || (
                      <li className="text-sm text-muted-foreground">
                        No risk factors identified
                      </li>
                    )}
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
