import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, TrendingDown, TrendingUp } from "lucide-react";
import { operationsAnalytics } from "./data";

export function OperationsAnalytics() {
  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Field Operations</h3>
        <Badge variant="outline" className="ml-2">OPS</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Job orders and placement performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Job Orders Card */}
        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Total Job Orders</CardTitle>
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
          </CardContent>
        </Card>

        {/* Fill Rate Card */}
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Fill Rate</CardTitle>
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
          </CardContent>
        </Card>

        {/* Days to Fill Card */}
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Days to Fill</CardTitle>
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
          </CardContent>
        </Card>

        {/* Placement Rate Card */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{operationsAnalytics.placementRate}%</div>
            <div className="flex items-center mt-1">
              {operationsAnalytics.placementRateChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${operationsAnalytics.placementRateChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {operationsAnalytics.placementRateChange > 0 ? "+" : ""}{operationsAnalytics.placementRateChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
