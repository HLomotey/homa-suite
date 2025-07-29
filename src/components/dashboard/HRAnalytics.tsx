import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingDown, TrendingUp } from "lucide-react";
import { hrAnalytics } from "./data";

export function HRAnalytics() {
  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Human Resources</h3>
        <Badge variant="outline" className="ml-2">HR</Badge>
        <p className="text-sm text-muted-foreground ml-auto">Employee management and satisfaction metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Head Count Card */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Head Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hrAnalytics.headCount.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              {hrAnalytics.headCountChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${hrAnalytics.headCountChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {hrAnalytics.headCountChange > 0 ? "+" : ""}{hrAnalytics.headCountChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Retention Rate Card */}
        <Card className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 border-pink-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-100">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hrAnalytics.retentionRate}%</div>
            <div className="flex items-center mt-1">
              {hrAnalytics.retentionRateChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${hrAnalytics.retentionRateChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {hrAnalytics.retentionRateChange > 0 ? "+" : ""}{hrAnalytics.retentionRateChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terminations Card */}
        <Card className="bg-gradient-to-br from-fuchsia-900/40 to-fuchsia-800/20 border-fuchsia-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-fuchsia-100">Terminations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hrAnalytics.terminations}</div>
            <div className="flex items-center mt-1">
              {hrAnalytics.terminationsChange < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${hrAnalytics.terminationsChange < 0 ? "text-green-500" : "text-red-500"}`}>
                {hrAnalytics.terminationsChange > 0 ? "+" : ""}{hrAnalytics.terminationsChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Days to Hire Card */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Days to Hire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hrAnalytics.daysToHire}</div>
            <div className="flex items-center mt-1">
              {hrAnalytics.daysToHireChange < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${hrAnalytics.daysToHireChange < 0 ? "text-green-500" : "text-red-500"}`}>
                {hrAnalytics.daysToHireChange > 0 ? "+" : ""}{hrAnalytics.daysToHireChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Avg Daily Hours Card */}
        <Card className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border-violet-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-100">Avg Daily Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hrAnalytics.avgDailyHours}</div>
          </CardContent>
        </Card>

        {/* Employee Satisfaction Card */}
        <Card className="bg-gradient-to-br from-rose-900/40 to-rose-800/20 border-rose-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-100">Employee Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hrAnalytics.employeeSatisfaction}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
