import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, TrendingUp, TrendingDown, Loader2, Building2 } from "lucide-react";
import { useHRAnalytics } from "@/hooks/analytics/useHRAnalytics";

export function HRAnalytics() {
  const { data: analyticsData, loading, error } = useHRAnalytics();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">HR Analytics</h3>
            <p className="text-sm text-muted-foreground">Staff metrics and trends</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    { 
      title: "Total Staff", 
      value: analyticsData.headCount, 
      change: `+${analyticsData.headCountChange}%`, 
      changeType: "increase" as const, 
      icon: Users, 
      color: "text-blue-600" 
    },
    { 
      title: "New Hires", 
      value: analyticsData.terminations, 
      change: `${analyticsData.terminationsChange}%`, 
      changeType: analyticsData.terminationsChange > 0 ? "increase" as const : "decrease" as const, 
      icon: UserPlus, 
      color: "text-green-600" 
    },
    { 
      title: "Retention Rate", 
      value: `${analyticsData.retentionRate.toFixed(1)}%`, 
      change: `+${analyticsData.retentionRateChange}%`, 
      changeType: "increase" as const, 
      icon: TrendingUp, 
      color: "text-purple-600" 
    },
    { 
      title: "Departments", 
      value: analyticsData.departmentMetrics.length, 
      change: "0%", 
      changeType: "neutral" as const, 
      icon: Building2, 
      color: "text-orange-600" 
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">HR Analytics</h3>
          <p className="text-sm text-muted-foreground">Workforce and talent metrics</p>
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
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <span className={`text-lg font-bold ${metric.color}`}>
                          {metric.value}
                        </span>
                        <div className={`flex items-center text-xs ${
                          metric.changeType === 'increase' ? 'text-green-600' : 
                          metric.changeType === 'decrease' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : metric.changeType === 'decrease' ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : null}
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
      
      {/* Hiring vs Termination Trend Analysis */}
      <Card className="bg-background/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Hiring vs Termination Trends</CardTitle>
          <CardDescription className="text-xs">6-month active workforce analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trend Chart */}
              <div className="h-32 flex items-end justify-between px-2">
                {analyticsData.trendData.map((month, index) => {
                  const maxValue = Math.max(...analyticsData.trendData.map(m => Math.max(m.hires, m.terminations, m.headCount / 10)));
                  const hireHeight = Math.max((month.hires / maxValue) * 100, 4);
                  const termHeight = Math.max((month.terminations / maxValue) * 100, 4);
                  const activeHeight = Math.max((month.headCount / 10 / maxValue) * 100, 4);
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-1">
                      <div className="flex items-end space-x-1 h-20">
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <div 
                          className="w-2 bg-green-500 rounded-t-sm" 
                          style={{ height: `${hireHeight}%` }}
                          title={`Hires: ${month.hires}`}
                        />
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <div 
                          className="w-2 bg-red-500 rounded-t-sm" 
                          style={{ height: `${termHeight}%` }}
                          title={`Terminations: ${month.terminations}`}
                        />
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <div 
                          className="w-2 bg-blue-500 rounded-t-sm" 
                          style={{ height: `${activeHeight}%` }}
                          title={`Active: ${month.headCount}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend and Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Hires</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Terminations</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Active (÷10)</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Net Change: {analyticsData.trendData.reduce((sum, month) => sum + month.netChange, 0) > 0 ? '+' : ''}{analyticsData.trendData.reduce((sum, month) => sum + month.netChange, 0)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
