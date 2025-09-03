import { useHRAnalytics } from "@/hooks/analytics/useHRAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Clock, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HRDrillDownModal } from "./drill-down/HRDrillDownModal";

export function HRAnalytics() {
  const queryClient = useQueryClient();
  const { data: hrAnalytics, loading, error, refetch } = useHRAnalytics();
  const [drillDownView, setDrillDownView] = useState<string | null>(null);

  const handleRefresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['hr-analytics'] });
  };

  const handleCardClick = (view: string) => {
    setDrillDownView(view);
  };

  const closeDrillDown = () => {
    setDrillDownView(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">HR Analytics</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">HR Analytics</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading HR analytics</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">HR Analytics</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Head Count */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
          onClick={() => handleCardClick('headcount')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Head Count
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {hrAnalytics?.headCount?.toLocaleString() || 0}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {(hrAnalytics?.headCountChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={(hrAnalytics?.headCountChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {(hrAnalytics?.headCountChange || 0) >= 0 ? '+' : ''}{hrAnalytics?.headCountChange || 0}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Retention Rate */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
          onClick={() => handleCardClick('retention')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Retention Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {hrAnalytics?.retentionRate?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {(hrAnalytics?.retentionRateChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={(hrAnalytics?.retentionRateChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {(hrAnalytics?.retentionRateChange || 0) >= 0 ? '+' : ''}{hrAnalytics?.retentionRateChange || 0}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Terminations */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
          onClick={() => handleCardClick('terminations')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Terminations
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {hrAnalytics?.terminations || 0}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {(hrAnalytics?.terminationsChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={(hrAnalytics?.terminationsChange || 0) >= 0 ? 'text-red-600' : 'text-green-600'}>
                {(hrAnalytics?.terminationsChange || 0) >= 0 ? '+' : ''}{hrAnalytics?.terminationsChange || 0}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Tenure */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
          onClick={() => handleCardClick('tenure')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Tenure
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {hrAnalytics?.daysToHire || 0}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {(hrAnalytics?.daysToHireChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={(hrAnalytics?.daysToHireChange || 0) >= 0 ? 'text-red-600' : 'text-green-600'}>
                {(hrAnalytics?.daysToHireChange || 0) >= 0 ? '+' : ''}{hrAnalytics?.daysToHireChange || 0}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Hires */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
          onClick={() => handleCardClick('hires')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent Hires
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              30d
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {hrAnalytics?.recentHires?.length || 0}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+{hrAnalytics?.employeeSatisfaction || 0}%</span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Modal */}
      {drillDownView && (
        <HRDrillDownModal
          isOpen={!!drillDownView}
          onClose={closeDrillDown}
          view={drillDownView}
          hrData={hrAnalytics}
        />
      )}
    </div>
  );
}
