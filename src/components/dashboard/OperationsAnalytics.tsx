import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Target, Clock, RefreshCw, TrendingUp, TrendingDown, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OperationsDrillDownModal } from "./drill-down/OperationsDrillDownModal";
import { operationsAnalytics } from "./data";
import * as React from "react";
import { ChartContainer } from "@/components/ui/chart";

export function OperationsAnalytics() {
  const [drillDownView, setDrillDownView] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
        <ClipboardList className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-semibold">Field Operations</h3>
        <Badge variant="outline" className="ml-2">OPS</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Job orders and placement performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Job Orders */}
        <Card 
          className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-slate-800/30 cursor-pointer hover:bg-slate-800/40 transition-colors"
          onClick={() => setDrillDownView('job-orders')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Job Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{operationsAnalytics.totalJobOrders}</div>
            <div className="flex items-center mt-1">
              {operationsAnalytics.totalJobOrdersChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.totalJobOrdersChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.totalJobOrdersChange > 0 ? "+" : ""}{operationsAnalytics.totalJobOrdersChange}% from last month
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Click for job orders list</p>
          </CardContent>
        </Card>

        {/* Fill Rate */}
        <Card 
          className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30 cursor-pointer hover:bg-blue-800/40 transition-colors"
          onClick={() => setDrillDownView('fill-rate')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Fill Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{operationsAnalytics.fillRate}%</div>
            <div className="flex items-center mt-1">
              {operationsAnalytics.fillRateChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.fillRateChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.fillRateChange > 0 ? "+" : ""}{operationsAnalytics.fillRateChange}% from last month
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Click for fill rate analysis</p>
          </CardContent>
        </Card>

        {/* Days to Fill */}
        <Card 
          className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30 cursor-pointer hover:bg-green-800/40 transition-colors"
          onClick={() => setDrillDownView('days-to-fill')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Days to Fill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{operationsAnalytics.daysToFill}</div>
            <div className="flex items-center mt-1">
              {operationsAnalytics.daysToFillChange < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.daysToFillChange < 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.daysToFillChange > 0 ? "+" : ""}{operationsAnalytics.daysToFillChange}% from last month
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Click for time to fill report</p>
          </CardContent>
        </Card>

        {/* Placement Rate */}
        <Card 
          className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30 cursor-pointer hover:bg-purple-800/40 transition-colors"
          onClick={() => setDrillDownView('placement-rate')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Placement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">91%</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-500">
                +2.1% from last month
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Click for placement analysis</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <Card className="mt-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            6-Month Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="fillRate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="daysToFill" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="placementRate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      {drillDownView && (
        <OperationsDrillDownModal
          view={drillDownView}
          onClose={() => setDrillDownView(null)}
          operationsData={operationsAnalytics}
        />
      )}
    </div>
  );
}
