import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Users, CheckCircle, Clock, Target, TrendingUp, TrendingDown, Loader2, Briefcase } from "lucide-react";

export function OperationsAnalytics() {
  const metrics = [
    {
      title: "Total Job Orders",
      value: "342",
      change: "-3.8%",
      changeType: "decrease" as const,
      icon: Briefcase,
      color: "text-orange-600",
      loading: false
    },
    {
      title: "Fill Rate", 
      value: "87%",
      change: "+2.3%",
      changeType: "increase" as const,
      icon: Target,
      color: "text-green-600",
      loading: false
    },
    {
      title: "Avg Time to Fill",
      value: "12 days",
      change: "-5.8%",
      changeType: "decrease" as const,
      icon: Clock,
      color: "text-blue-600",
      loading: false
    },
    {
      title: "Placement Rate",
      value: "91%",
      change: "+1.8%",
      changeType: "increase" as const,
      icon: CheckCircle,
      color: "text-purple-600",
      loading: false
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
