import { MonthlyRevenue } from "./overview/MonthlyRevenue";
import { GrossMargin } from "./overview/GrossMargin";
import { EBITDA } from "./overview/EBITDA";
import { OperatingExpenses } from "./overview/OperatingExpenses";
import { RevenueProfitTrend } from "./overview/RevenueProfitTrend";
import { RevenueByClient } from "./overview/RevenueByClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Target,
  Users
} from "lucide-react";

interface FinanceOverviewProps {
  year?: number;
  month?: number;
}

export function FinanceOverview({ year, month }: FinanceOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Financial Overview</h2>
        <Badge variant="secondary" className="text-xs">Dashboard</Badge>
      </div>
      
      {/* Key Metrics Row - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MonthlyRevenue year={year} month={month} />
        <GrossMargin year={year} month={month} />
        <EBITDA year={year} month={month} />
        <OperatingExpenses year={year} month={month} />
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">80.0%</p>
            <p className="text-xs text-green-600">Above target (75%)</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
              <AlertCircle className="h-3 w-3 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">$570K</p>
            <p className="text-xs text-orange-600">95 invoices pending</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Avg Collection</p>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">22 days</p>
            <p className="text-xs text-muted-foreground">Industry avg: 30 days</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Chart - Revenue Profit Trend */}
      <Card className="bg-background border-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-medium text-foreground">Revenue & Profit Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <RevenueProfitTrend />
        </CardContent>
      </Card>
      
      {/* Secondary Chart - Revenue By Client */}
      <Card className="bg-background border-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-medium text-foreground">Revenue By Client</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <RevenueByClient />
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Key Insights</h4>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-green-600">✓ Strong revenue growth in Q2 2025</p>
              <p className="text-blue-600">📊 Top 2 clients represent 29% of revenue</p>
              <p className="text-orange-600">⚠️ Monitor aging receivables over 60 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Action Items</h4>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-red-600">🔴 Follow up on 90+ day overdue accounts</p>
              <p className="text-yellow-600">🟡 Review payment terms for slow-paying clients</p>
              <p className="text-blue-600">🔵 Consider early payment discounts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
