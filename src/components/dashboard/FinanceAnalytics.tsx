import { useFinanceAnalytics, useRevenueMetrics } from "@/hooks/finance/useFinanceAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, FileText, CheckCircle, Clock, AlertCircle, Send, RefreshCw, BarChart3, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function FinanceAnalytics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const queryClient = useQueryClient();

  const { data: financeData, isLoading, error, isError, refetch } = useFinanceAnalytics(selectedYear, selectedMonth);
  const { data: revenueData, isLoading: isRevenueLoading, refetch: refetchRevenue } = useRevenueMetrics(selectedYear, selectedMonth);
  
  // Calculate derived metrics
  const revenueGrowth = revenueData?.growthRate || 0;
  const paidPercentage = financeData?.totalInvoices > 0 ? (financeData.paidInvoices / financeData.totalInvoices) * 100 : 0;
  
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
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-900 to-indigo-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-blue-300" />
            Finance Analytics
          </h2>
          <Button variant="secondary" size="sm" disabled className="bg-blue-800 hover:bg-blue-700 text-white border-none">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Refreshing...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-[#0a101f] border border-blue-900/30 rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="p-4">
                  <div className="h-5 w-5 bg-blue-800/50 rounded-full mb-3"></div>
                  <div className="h-4 w-24 bg-blue-800/50 rounded mb-3"></div>
                  <div className="h-8 w-36 bg-blue-800/50 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-blue-800/50 rounded"></div>
                </div>
              </div>
            ))}
        </div>
        <div className="bg-[#0a101f] border border-blue-900/30 rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="p-4 border-b border-blue-900/30">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-blue-800/50 rounded-full mr-2"></div>
              <div>
                <div className="h-5 w-32 bg-blue-800/50 rounded mb-1"></div>
                <div className="h-4 w-24 bg-blue-800/50 rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-6 flex justify-center items-center">
            <div className="h-40 w-full bg-blue-800/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-900 to-indigo-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-blue-300" />
            Finance Analytics
          </h2>
          <Button variant="secondary" size="sm" onClick={handleRefresh} className="bg-blue-800 hover:bg-blue-700 text-white border-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <div className="bg-[#0a101f] border border-red-900/30 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-red-900/30">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              <h3 className="text-lg font-medium text-red-300">Error Loading Finance Data</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-white mb-4">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            <Button className="bg-red-600 hover:bg-red-700 text-white border-none" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-900 to-indigo-900 p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-blue-300" />
          Finance Analytics
        </h2>
        <Button variant="secondary" size="sm" onClick={handleRefresh} className="bg-blue-800 hover:bg-blue-700 text-white border-none">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <div className="bg-[#0a101f] border border-green-900/30 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-10 rounded-full -mt-8 -mr-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500 opacity-10 rounded-full -mb-4 -ml-4" />
            <DollarSign className="h-8 w-8 text-green-400 mb-2" />
            <h3 className="text-lg font-medium text-white">Total Revenue</h3>
            <div className="mt-1">
              <div className="text-3xl font-bold text-white">
                {formatCurrency(financeData?.totalRevenue || 0)}
              </div>
              <p className="text-green-300 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {revenueGrowth > 0 ? "+" : ""}
                {revenueGrowth.toFixed(1)}% from last month
              </p>
            </div>
          </div>
        </div>

        {/* Total Invoices Card */}
        <div className="bg-[#0a101f] border border-blue-900/30 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-900/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 opacity-10 rounded-full -mt-8 -mr-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500 opacity-10 rounded-full -mb-4 -ml-4" />
            <FileText className="h-8 w-8 text-blue-400 mb-2" />
            <h3 className="text-lg font-medium text-white">Total Invoices</h3>
            <div className="mt-1">
              <div className="text-3xl font-bold text-white">
                {financeData?.totalInvoices || 0}
              </div>
              <p className="text-blue-300">
                ${financeData?.averageInvoiceValue.toFixed(2)} average value
              </p>
            </div>
          </div>
        </div>

        {/* Paid Invoices Card */}
        <div className="bg-[#0a101f] border border-indigo-900/30 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-900/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 opacity-10 rounded-full -mt-8 -mr-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-500 opacity-10 rounded-full -mb-4 -ml-4" />
            <CheckCircle className="h-8 w-8 text-indigo-400 mb-2" />
            <h3 className="text-lg font-medium text-white">Paid Invoices</h3>
            <div className="mt-1">
              <div className="text-3xl font-bold text-white">
                {financeData?.paidInvoices || 0}
              </div>
              <p className="text-indigo-300">
                {paidPercentage.toFixed(0)}% of total
              </p>
            </div>
          </div>
        </div>

        {/* Outstanding Invoices Card */}
        <div className="bg-[#0a101f] border border-purple-900/30 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-10 rounded-full -mt-8 -mr-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500 opacity-10 rounded-full -mb-4 -ml-4" />
            <AlertCircle className="h-8 w-8 text-purple-400 mb-2" />
            <h3 className="text-lg font-medium text-white">Outstanding Invoices</h3>
            <div className="mt-1">
              <div className="text-3xl font-bold text-white">
                {(financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0)}
              </div>
              <p className="text-purple-300">
                {formatCurrency(
                  financeData?.averageInvoiceValue
                    ? financeData.averageInvoiceValue * ((financeData?.pendingInvoices || 0) + (financeData?.overdueInvoices || 0))
                    : 0
                )}{" "}
                outstanding
              </p>
            </div>
          </div>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-1">
        {/* Invoice Status Distribution */}
        <div className="bg-[#0a101f] border border-blue-900/30 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-blue-900/30">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
              <div>
                <h3 className="text-lg font-medium text-white">Current status</h3>
                <p className="text-sm text-blue-300">of all invoices</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {financeData?.statusDistribution && financeData.statusDistribution.length > 0 ? (
              <div className="space-y-6">
                {financeData.statusDistribution.map((status, index) => {
                  let badgeColor = "";
                  let progressColor = "";
                  let icon = null;

                  switch (status.status.toLowerCase()) {
                    case "paid":
                      badgeColor = "bg-green-900/40 text-green-300 border-green-800/50";
                      progressColor = "bg-green-500";
                      icon = <CheckCircle className="h-4 w-4 mr-1" />;
                      break;
                    case "pending":
                      badgeColor = "bg-yellow-900/40 text-yellow-300 border-yellow-800/50";
                      progressColor = "bg-yellow-500";
                      icon = <Clock className="h-4 w-4 mr-1" />;
                      break;
                    case "overdue":
                      badgeColor = "bg-red-900/40 text-red-300 border-red-800/50";
                      progressColor = "bg-red-500";
                      icon = <AlertCircle className="h-4 w-4 mr-1" />;
                      break;
                    case "sent":
                      badgeColor = "bg-blue-900/40 text-blue-300 border-blue-800/50";
                      progressColor = "bg-blue-500";
                      icon = <Send className="h-4 w-4 mr-1" />;
                      break;
                    default:
                      badgeColor = "bg-gray-900/40 text-gray-300 border-gray-800/50";
                      progressColor = "bg-gray-500";
                  }

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className={`mr-2 ${badgeColor} flex items-center shadow-sm`}>
                            {icon}
                            {status.status}
                          </Badge>
                          <span className="text-white">{status.count} invoices</span>
                        </div>
                        <span className="text-sm font-medium text-white">{status.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-blue-900/30 rounded-full h-2.5">
                        <div 
                          className={`${progressColor} h-2.5 rounded-full`} 
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-blue-800 mb-3" />
                <p className="text-center text-blue-400">No status distribution data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Data Completeness Indicator */}
      {financeData && !financeData.isDataComplete && (
        <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg shadow-md">
          <div className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
              <p className="text-amber-300">
                Note: Some finance data may be incomplete due to large dataset size. The displayed metrics represent the available data.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Month/Year Selector */}
      <div className="flex justify-end space-x-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md"
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
      <div className="text-xs text-blue-400 text-right p-2 inline-block ml-auto mt-2">
        Data source: finance_invoices table | Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
