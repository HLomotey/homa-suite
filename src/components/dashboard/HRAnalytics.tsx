import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, TrendingUp, TrendingDown, Loader2, Building2 } from "lucide-react";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

export function HRAnalytics() {
  const { stats, statsLoading, externalStaff } = useExternalStaff();

  const { metrics, trendData } = useMemo(() => {
    // Calculate retention rate
    const retentionRate = stats.totalCount > 0 
      ? Math.round((stats.active / stats.totalCount) * 100 * 10) / 10 
      : 0;

    // Calculate departments count
    const departments = new Set(
      externalStaff.map(staff => staff["HOME DEPARTMENT"]).filter(Boolean)
    ).size;

    // Calculate new hires (mock trend data for now)
    const newHires = stats.active > 0 ? Math.floor(stats.active * 0.02) : 0;

    // Calculate monthly hiring vs termination trends
    const now = new Date();
    const monthlyTrends = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthHires = externalStaff.filter(staff => {
        if (!staff["HIRE DATE"]) return false;
        const hireDate = new Date(staff["HIRE DATE"]);
        return hireDate >= monthDate && hireDate < nextMonthDate;
      }).length;
      
      const monthTerminations = externalStaff.filter(staff => {
        if (!staff["TERMINATION DATE"]) return false;
        const termDate = new Date(staff["TERMINATION DATE"]);
        return termDate >= monthDate && termDate < nextMonthDate;
      }).length;
      
      // Calculate active staff at end of month
      const activeAtMonth = externalStaff.filter(staff => {
        const hireDate = staff["HIRE DATE"] ? new Date(staff["HIRE DATE"]) : null;
        const termDate = staff["TERMINATION DATE"] ? new Date(staff["TERMINATION DATE"]) : null;
        
        return hireDate && hireDate < nextMonthDate && (!termDate || termDate >= nextMonthDate);
      }).length;
      
      monthlyTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        hires: monthHires,
        terminations: monthTerminations,
        active: activeAtMonth,
        netChange: monthHires - monthTerminations
      });
    }

    const metricsData = [
      {
        title: "Total Employees",
        value: statsLoading ? "..." : stats.totalCount.toLocaleString(),
        change: "+5.2%",
        changeType: "increase" as const,
        icon: Users,
        color: "text-blue-600",
        loading: statsLoading
      },
      {
        title: "New Hires", 
        value: statsLoading ? "..." : newHires.toString(),
        change: "+12.5%",
        changeType: "increase" as const,
        icon: UserPlus,
        color: "text-green-600",
        loading: statsLoading
      },
      {
        title: "Retention Rate",
        value: statsLoading ? "..." : `${retentionRate}%`,
        change: "+2.1%",
        changeType: "increase" as const,
        icon: TrendingUp,
        color: "text-purple-600",
        loading: statsLoading
      },
      {
        title: "Departments",
        value: statsLoading ? "..." : departments.toString(),
        change: "0%",
        changeType: "increase" as const,
        icon: Building2,
        color: "text-amber-600",
        loading: statsLoading
      }
    ];

    return { metrics: metricsData, trendData: monthlyTrends };
  }, [stats, statsLoading, externalStaff]);

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
                    {metric.loading ? (
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
          {statsLoading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trend Chart */}
              <div className="h-32 flex items-end justify-between px-2">
                {trendData.map((month, index) => {
                  const maxValue = Math.max(...trendData.map(m => Math.max(m.hires, m.terminations, m.active / 10)));
                  const hireHeight = Math.max((month.hires / maxValue) * 100, 4);
                  const termHeight = Math.max((month.terminations / maxValue) * 100, 4);
                  const activeHeight = Math.max((month.active / 10 / maxValue) * 100, 4);
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-1">
                      <div className="flex items-end space-x-1 h-20">
                        <div 
                          className="w-2 bg-green-500 rounded-t-sm" 
                          style={{ height: `${hireHeight}%` }}
                          title={`Hires: ${month.hires}`}
                        />
                        <div 
                          className="w-2 bg-red-500 rounded-t-sm" 
                          style={{ height: `${termHeight}%` }}
                          title={`Terminations: ${month.terminations}`}
                        />
                        <div 
                          className="w-2 bg-blue-500 rounded-t-sm" 
                          style={{ height: `${activeHeight}%` }}
                          title={`Active: ${month.active}`}
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
                  Net Change: {trendData.reduce((sum, month) => sum + month.netChange, 0) > 0 ? '+' : ''}{trendData.reduce((sum, month) => sum + month.netChange, 0)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
