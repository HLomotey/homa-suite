import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { financeAnalytics } from "./data";

export function FinanceAnalytics() {
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

  return (
    <div className="grid gap-4 grid-cols-1">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Finance & Accounting</h3>
        <Badge variant="outline" className="ml-2">FIN</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Financial performance and revenue analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Revenue Card */}
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(financeAnalytics.dailyRevenue)}</div>
            <div className="flex items-center mt-1">
              {financeAnalytics.dailyRevenueChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${financeAnalytics.dailyRevenueChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {financeAnalytics.dailyRevenueChange > 0 ? "+" : ""}{financeAnalytics.dailyRevenueChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gross Margin Card */}
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Gross Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{financeAnalytics.grossMargin}%</div>
            <div className="flex items-center mt-1">
              {financeAnalytics.grossMarginChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${financeAnalytics.grossMarginChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {financeAnalytics.grossMarginChange > 0 ? "+" : ""}{financeAnalytics.grossMarginChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(financeAnalytics.netProfit)}</div>
            <div className="flex items-center mt-1">
              {financeAnalytics.netProfitChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${financeAnalytics.netProfitChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {financeAnalytics.netProfitChange > 0 ? "+" : ""}{financeAnalytics.netProfitChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Client Satisfaction Card */}
        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Client Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">92%</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-500">
                +2.5% from last quarter
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Cash Flow Card */}
        <Card className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-100">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(financeAnalytics.cashFlow)}</div>
          </CardContent>
        </Card>

        {/* Cost Per Hire Card */}
        <Card className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border-violet-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-100">Cost Per Hire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${financeAnalytics.costPerHire.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
