import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { operationsAnalytics } from "./data";

export function OperationsAnalytics() {
  const metrics = [
    {
      title: "Total Job Orders",
      value: operationsAnalytics.totalJobOrders.toString(),
      change: operationsAnalytics.totalJobOrdersChange,
      icon: ClipboardList,
      loading: false,
    },
    {
      title: "Fill Rate",
      value: `${operationsAnalytics.fillRate}%`,
      change: operationsAnalytics.fillRateChange,
      icon: Target,
      loading: false,
    },
    {
      title: "Days to Fill",
      value: operationsAnalytics.daysToFill.toString(),
      change: operationsAnalytics.daysToFillChange,
      inverse: true, // Lower is better
      icon: Clock,
      loading: false,
    },
    {
      title: "Placement Rate",
      value: "91%",
      change: 2.1,
      icon: CheckCircle,
      loading: false,
    },
    {
      title: "Active Orders",
      value: "28",
      icon: BarChart3,
      loading: false,
    },
    {
      title: "Completion Rate",
      value: "94%",
      icon: Target,
      loading: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-slate-600" />
        <h3 className="text-sm font-medium text-slate-900">Operations</h3>
        <Badge variant="secondary" className="text-xs">
          Operations
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">
                  {metric.title}
                </p>
                {metric.icon && (
                  <metric.icon className="h-3 w-3 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">
                  {metric.value}
                </p>
                {metric.change !== undefined && !metric.loading && (
                  <div className="flex items-center text-xs">
                    {(
                      metric.inverse ? metric.change < 0 : metric.change > 0
                    ) ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span
                      className={`${
                        (metric.inverse ? metric.change < 0 : metric.change > 0)
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}%
                    </span>
                    <span className="text-slate-500 ml-1">vs last month</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Details Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">
                Pending Orders
              </p>
              <Clock className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {operationsAnalytics.totalJobOrders -
                Math.round(
                  operationsAnalytics.totalJobOrders *
                    (operationsAnalytics.fillRate / 100)
                )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">
                Avg Fill Time
              </p>
              <BarChart3 className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {operationsAnalytics.daysToFill} days
            </p>
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
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fillRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="daysToFill"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="placementRate"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
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
