import {
  useFinanceAnalytics,
  useRevenueMetrics,
} from "@/hooks/finance/useFinanceAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Receipt,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
} from "lucide-react";
import { useState } from "react";

export function FinanceAnalytics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // --- keep code from kwame ---
  const {
    data: financeData,
    isLoading,
    error,
    isError,
    refetch,
  } = useFinanceAnalytics(selectedYear, selectedMonth);

  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    refetch: refetchRevenue,
  } = useRevenueMetrics(selectedYear, selectedMonth);

  // Derived metrics
  const revenueGrowth = revenueData?.growthRate ?? 0;
  const paidPercentage =
    (financeData?.totalInvoices ?? 0) > 0
      ? ((financeData?.paidInvoices ?? 0) / (financeData?.totalInvoices ?? 0)) * 100
      : 0;
  const loading = isLoading || isRevenueLoading;

  const outstandingAmount =
    financeData?.averageInvoiceValue
      ? financeData.averageInvoiceValue *
        ((financeData?.pendingInvoices ?? 0) + (financeData?.overdueInvoices ?? 0))
      : 0;

  const handleRefresh = () => {
    void refetch();
    void refetchRevenue();
  };
  // --- end keep ---

  // Currency formatter
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || Number.isNaN(value)) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-medium text-slate-900">Finance</h3>
            <Badge variant="secondary" className="text-xs">Finance</Badge>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <h4 className="text-sm font-medium text-red-900">
                  Failed to load finance data
                </h4>
                <p className="text-xs text-red-700 mt-1">
                  {error instanceof Error ? error.message : "An unknown error occurred"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: loading ? "..." : formatCurrency(financeData?.totalRevenue || 0),
      change: revenueGrowth,
      icon: DollarSign,
      loading,
    },
    {
      title: "Total Invoices",
      value: loading ? "..." : (financeData?.totalInvoices ?? 0).toLocaleString(),
      loading,
    },
    {
      title: "Paid Invoices",
      value: loading ? "..." : (financeData?.paidInvoices ?? 0).toLocaleString(),
      loading,
    },
    {
      title: "Outstanding Amount",
      value: loading ? "..." : formatCurrency(outstandingAmount),
      icon: AlertCircle,
      loading,
    },
    {
      title: "Avg Invoice Value",
      value: loading ? "..." : formatCurrency(financeData?.averageInvoiceValue || 0),
      loading,
    },
    {
      title: "Payment Rate",
      value: loading ? "..." : `${paidPercentage.toFixed(0)}%`,
      icon: Target,
      loading,
    },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900">Finance</h3>
          <Badge variant="secondary" className="text-xs">Finance</Badge>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">{metric.title}</p>
                {"icon" in metric && metric.icon ? (
                  <metric.icon className="h-3 w-3 text-slate-400" />
                ) : null}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">{metric.value}</p>
                {metric.change !== undefined && !metric.loading && (
                  <div className="flex items-center text-xs">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={metric.change > 0 ? "text-emerald-600" : "text-red-600"}>
                      {metric.change > 0 ? "+" : ""}
                      {metric.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Extras */}
        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Outstanding Invoices</p>
              <Clock className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {loading
                ? "..."
                : ((financeData?.pendingInvoices ?? 0) + (financeData?.overdueInvoices ?? 0)).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Collection Rate</p>
              <CheckCircle className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {loading ? "..." : `${paidPercentage.toFixed(0)}%`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Invoices</p>
              <Receipt className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {loading ? "..." : (financeData?.totalInvoices ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
