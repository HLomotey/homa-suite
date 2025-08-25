import { MonthlyRevenue } from "./overview/MonthlyRevenue";
import { GrossMargin } from "./overview/GrossMargin";
import { EBITDA } from "./overview/EBITDA";
import { OperatingExpenses } from "./overview/OperatingExpenses";
import { RevenueProfitTrend } from "./overview/RevenueProfitTrend";
import { RevenueByClient } from "./overview/RevenueByClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface FinanceOverviewProps {
  year?: number;
  month?: number;
}

export function FinanceOverview({ year, month }: FinanceOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold tracking-tight">Financial Overview</h2>
      </div>
      
      {/* Key Metrics Row - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MonthlyRevenue year={year} month={month} />
        <GrossMargin year={year} month={month} />
        <EBITDA year={year} month={month} />
        <OperatingExpenses year={year} month={month} />
      </div>
      
      {/* Main Chart - Revenue Profit Trend */}
      <Card className="p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-medium">Revenue & Profit Trend</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <RevenueProfitTrend />
        </CardContent>
      </Card>
      
      {/* Secondary Chart - Revenue By Client */}
      <Card className="p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-medium">Revenue By Client</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <RevenueByClient />
        </CardContent>
      </Card>
    </div>
  );
}
