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
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react";
import { operationsAnalytics } from "./data";

// Stats Card Component matching properties dashboard style
interface StatsCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
  isLoading?: boolean;
}

const StatsCard = ({ title, value, trend, icon, color, isLoading = false }: StatsCardProps) => {
  const colorClasses = {
    blue: "bg-blue-950/40 border-blue-800/30 text-blue-500",
    green: "bg-green-950/40 border-green-800/30 text-green-500",
    amber: "bg-amber-950/40 border-amber-800/30 text-amber-500",
    purple: "bg-purple-950/40 border-purple-800/30 text-purple-500",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-white/60">{title}</span>
        <div className="p-2 rounded-full bg-white/5">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center text-xs">
        {!isLoading && trend && (
          <>
            <span className={trend.direction === "up" ? "text-green-500" : "text-red-500"}>
              {trend.direction === "up" ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
              {trend.value}
            </span>
            <span className="text-white/40 ml-1">{trend.period}</span>
          </>
        )}
      </div>
    </div>
  );
};

export function OperationsAnalytics() {
  const isLoading = false; // Set to true when implementing real data loading

  // Main metrics following properties dashboard pattern
  const mainMetrics = [
    {
      title: "Total Properties",
      value: "24",
      trend: { value: "+15%", direction: "up" as "up" | "down", period: "vs last month" },
      icon: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardList className="h-5 w-5" />,
      color: "blue" as const
    },
    {
      title: "Total Revenue", 
      value: "$45,231.89",
      trend: { value: "+20.1%", direction: "up" as "up" | "down", period: "vs last month" },
      icon: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />,
      color: "green" as const
    },
    {
      title: "Active Tenants",
      value: "573",
      trend: { value: "+180.1%", direction: "up" as "up" | "down", period: "vs last month" },
      icon: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />,
      color: "amber" as const
    },
    {
      title: "Pending Payments",
      value: "12",
      trend: { value: "+19%", direction: "up" as "up" | "down", period: "vs last month" },
      icon: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />,
      color: "purple" as const
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Operations Analytics</h3>
        <Badge variant="secondary" className="text-xs">Real-time</Badge>
      </div>

      {/* Main Stats Cards - 4 columns matching properties dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainMetrics.map((metric, index) => (
          <StatsCard
            key={index}
            title={metric.title}
            value={isLoading ? "--" : metric.value}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Secondary metrics in smaller cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Fill Rate</p>
              <Target className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">{operationsAnalytics.fillRate}%</p>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{operationsAnalytics.fillRateChange}%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Days to Fill</p>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">{operationsAnalytics.daysToFill}</p>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{operationsAnalytics.daysToFillChange}%</span>
              <span className="text-muted-foreground ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Active Orders</p>
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">{operationsAnalytics.totalJobOrders}</p>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{operationsAnalytics.totalJobOrdersChange}%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">94%</p>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+2.1%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
