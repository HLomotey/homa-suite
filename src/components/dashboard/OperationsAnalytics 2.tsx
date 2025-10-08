import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Users, CheckCircle, Clock, Target, TrendingUp, TrendingDown, Loader2, Briefcase } from "lucide-react";
import { useOperationsAnalytics } from '@/hooks/analytics/useOperationsAnalytics';

export function OperationsAnalytics() {
  const { data: analyticsData, isLoading, error } = useOperationsAnalytics();

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Operations Analytics</h3>
            <p className="text-sm text-muted-foreground">Job orders and placement metrics</p>
          </div>
        </div>
        <Card className="bg-background/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">Failed to load operations analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Job Orders",
      value: isLoading ? "..." : analyticsData?.metrics.totalJobOrders.toString() || "0",
      change: isLoading ? "..." : `${analyticsData?.metrics.totalJobOrdersChange >= 0 ? '+' : ''}${analyticsData?.metrics.totalJobOrdersChange.toFixed(1)}%`,
      changeType: (analyticsData?.metrics.totalJobOrdersChange || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: Briefcase,
      color: "text-orange-600",
      loading: isLoading
    },
    {
      title: "Fill Rate", 
      value: isLoading ? "..." : `${analyticsData?.metrics.fillRate.toFixed(1)}%` || "0%",
      change: isLoading ? "..." : `${analyticsData?.metrics.fillRateChange >= 0 ? '+' : ''}${analyticsData?.metrics.fillRateChange.toFixed(1)}%`,
      changeType: (analyticsData?.metrics.fillRateChange || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: Target,
      color: "text-green-600",
      loading: isLoading
    },
    {
      title: "Avg Time to Fill",
      value: isLoading ? "..." : `${analyticsData?.metrics.avgTimeToFill.toFixed(0)} days` || "0 days",
      change: isLoading ? "..." : `${analyticsData?.metrics.avgTimeToFillChange >= 0 ? '+' : ''}${analyticsData?.metrics.avgTimeToFillChange.toFixed(1)}%`,
      changeType: (analyticsData?.metrics.avgTimeToFillChange || 0) <= 0 ? "increase" as const : "decrease" as const, // Lower time is better
      icon: Clock,
      color: "text-blue-600",
      loading: isLoading
    },
    {
      title: "Placement Rate",
      value: isLoading ? "..." : `${analyticsData?.metrics.placementRate.toFixed(1)}%` || "0%",
      change: isLoading ? "..." : `${analyticsData?.metrics.placementRateChange >= 0 ? '+' : ''}${analyticsData?.metrics.placementRateChange.toFixed(1)}%`,
      changeType: (analyticsData?.metrics.placementRateChange || 0) >= 0 ? "increase" as const : "decrease" as const,
      icon: CheckCircle,
      color: "text-purple-600",
      loading: isLoading
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Operations Analytics</h3>
          <p className="text-sm text-muted-foreground">Job orders and placement metrics</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Real-time
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-background/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {metric.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <span className={`text-lg font-bold ${metric.color}`}>
                          {metric.value}
                        </span>
                        <div className={`flex items-center text-xs ${
                          metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {metric.change}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
