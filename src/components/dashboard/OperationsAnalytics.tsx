import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, TrendingDown, TrendingUp } from "lucide-react";
import { operationsAnalytics } from "./data";
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export function OperationsAnalytics() {
  // Create data for the chart
  const chartData = [
    { name: "Jan", orders: 280, fillRate: 82, daysToFill: 14, placementRate: 88 },
    { name: "Feb", orders: 300, fillRate: 84, daysToFill: 13, placementRate: 89 },
    { name: "Mar", orders: 310, fillRate: 85, daysToFill: 13, placementRate: 90 },
    { name: "Apr", orders: 325, fillRate: 86, daysToFill: 12.5, placementRate: 90 },
    { name: "May", orders: 335, fillRate: 86.5, daysToFill: 12.2, placementRate: 90.5 },
    { name: "Jun", orders: 342, fillRate: 87, daysToFill: 12, placementRate: 91 },
  ];

  // Chart config for styling
  const chartConfig = {
    orders: {
      label: "Job Orders",
      theme: { light: "#ef4444", dark: "#ef4444" },
    },
    fillRate: {
      label: "Fill Rate (%)",
      theme: { light: "#3b82f6", dark: "#3b82f6" },
    },
    daysToFill: {
      label: "Days to Fill",
      theme: { light: "#22c55e", dark: "#22c55e" },
    },
    placementRate: {
      label: "Placement Rate (%)",
      theme: { light: "#a855f7", dark: "#a855f7" },
    },
  };

  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Field Operations</h3>
        <Badge variant="outline" className="ml-2">OPS</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Job orders and placement performance</p>
      </div>

      {/* Operations Performance Chart */}
      <Card className="col-span-2 mb-4">
        <CardHeader>
          <CardTitle>Operations Performance (6-Month Trend)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <RechartsPrimitive.ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} />
                <RechartsPrimitive.XAxis dataKey="name" />
                <RechartsPrimitive.YAxis yAxisId="left" orientation="left" />
                <RechartsPrimitive.YAxis yAxisId="right" orientation="right" />
                <RechartsPrimitive.Tooltip />
                <RechartsPrimitive.Legend />
                <RechartsPrimitive.Bar yAxisId="left" dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                <RechartsPrimitive.Line yAxisId="right" type="monotone" dataKey="fillRate" stroke="var(--color-fillRate)" strokeWidth={2} dot={{ r: 4 }} />
                <RechartsPrimitive.Line yAxisId="right" type="monotone" dataKey="daysToFill" stroke="var(--color-daysToFill)" strokeWidth={2} dot={{ r: 4 }} />
                <RechartsPrimitive.Line yAxisId="right" type="monotone" dataKey="placementRate" stroke="var(--color-placementRate)" strokeWidth={2} dot={{ r: 4 }} />
              </RechartsPrimitive.ComposedChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Operations Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mt-2">
        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-800/30">
          <CardHeader className="pb-1 pt-2">
            <CardTitle className="text-xs font-medium text-red-100">Total Job Orders</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-xl font-bold text-white">{operationsAnalytics.totalJobOrders}</div>
            <div className="flex items-center">
              {operationsAnalytics.totalJobOrdersChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.totalJobOrdersChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.totalJobOrdersChange > 0 ? "+" : ""}{operationsAnalytics.totalJobOrdersChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
          <CardHeader className="pb-1 pt-2">
            <CardTitle className="text-xs font-medium text-blue-100">Fill Rate</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-xl font-bold text-white">{operationsAnalytics.fillRate}%</div>
            <div className="flex items-center">
              {operationsAnalytics.fillRateChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.fillRateChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.fillRateChange > 0 ? "+" : ""}{operationsAnalytics.fillRateChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30">
          <CardHeader className="pb-1 pt-2">
            <CardTitle className="text-xs font-medium text-green-100">Days to Fill</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-xl font-bold text-white">{operationsAnalytics.daysToFill}</div>
            <div className="flex items-center">
              {operationsAnalytics.daysToFillChange < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.daysToFillChange < 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.daysToFillChange > 0 ? "+" : ""}{operationsAnalytics.daysToFillChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
