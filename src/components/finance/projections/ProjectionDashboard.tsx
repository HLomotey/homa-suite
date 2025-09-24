import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, Target, BarChart3, PieChart, Loader2, AlertTriangle, ArrowUp, ArrowDown, Percent, TrendingDown } from 'lucide-react';
import { useProjectionStats } from '@/hooks/projection/useProjectionStats';
import StatusDistributionChart from './charts/StatusDistributionChart';
import PriorityDistributionChart from './charts/PriorityDistributionChart';
import VarianceTrendChart from './charts/VarianceTrendChart';
import LocationDistributionChart from './charts/LocationDistributionChart';

// Projection Dashboard Component
const ProjectionDashboard = () => {
  // Fetch dashboard metrics and chart data
  const { metrics, chartData, loading, error } = useProjectionStats();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading projection dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  if (!metrics || !chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Projection Dashboard</h2>
          <p className="text-white/60">Real-time projection metrics and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Jan 25 - Jul 25, 2025</span>
          </div>
          <button className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md text-sm">
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Expected Revenue" 
          value={`$${(metrics.totalExpectedRevenue / 1000000).toFixed(1)}M`} 
          trend={metrics.revenueTrend}
          icon={<DollarSign className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard 
          title="Profit Margin" 
          value={`${metrics.totalActualRevenue > 0 ? (((metrics.totalActualRevenue - metrics.totalOperatingCosts) / metrics.totalActualRevenue * 100).toFixed(1)) : '0.0'}%`} 
          trend={metrics.revenueTrend}
          icon={<Percent className="h-5 w-5" />}
          color="green"
        />
        <StatsCard 
          title="Revenue per Hour" 
          value={`$${metrics.totalExpectedHours > 0 ? (metrics.totalActualRevenue / metrics.totalExpectedHours).toFixed(0) : '0'}`} 
          trend={metrics.activeTrend}
          icon={<Target className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard 
          title="Variance Impact" 
          value={`${metrics.avgVariancePercentage.toFixed(1)}%`} 
          trend={metrics.totalTrend}
          icon={<TrendingDown className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${metrics.totalActualRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-white/60">
              Total projected revenue across all locations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Operating Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${metrics.totalOperatingCosts.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-white/60">
              Actual operational costs from approved expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(metrics.totalActualRevenue - metrics.totalOperatingCosts).toLocaleString('en-US')}
            </div>
            <p className="text-xs text-white/60">
              Actual net profit after operational costs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">ROI Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalOperatingCosts > 0 ? (((metrics.totalActualRevenue - metrics.totalOperatingCosts) / metrics.totalOperatingCosts) * 100).toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-white/60">
              Return on investment percentage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="status-distribution" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="status-distribution">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="priority-distribution">Profit Margins</TabsTrigger>
          <TabsTrigger value="variance-trends">Financial Trends</TabsTrigger>
          <TabsTrigger value="location-analysis">Location Profitability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status-distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">Revenue by Status</CardTitle>
                <p className="text-sm text-white/60">Revenue distribution across projection statuses</p>
              </CardHeader>
              <CardContent className="h-80">
                <StatusDistributionChart data={chartData.statusDistribution} />
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">Profit Margin Analysis</CardTitle>
                <p className="text-sm text-white/60">Profit margins by location</p>
              </CardHeader>
              <CardContent className="h-80">
                <div className="space-y-4">
                  {chartData.revenueComparison.slice(0, 6).map((item, index) => {
                    const profitMargin = ((item.expected - (item.expected * 0.6)) / item.expected * 100);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-white/80 truncate flex-1">{item.name}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-400">
                            ${item.expected.toLocaleString()}
                          </span>
                          <span className={profitMargin > 35 ? "text-green-400" : profitMargin > 25 ? "text-yellow-400" : "text-red-400"}>
                            {profitMargin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="priority-distribution">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Profit Margin Distribution</CardTitle>
              <p className="text-sm text-white/60">Profit margins by priority level</p>
            </CardHeader>
            <CardContent className="h-96">
              <PriorityDistributionChart data={chartData.priorityDistribution} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance-trends">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Financial Performance Trends</CardTitle>
              <p className="text-sm text-white/60">Revenue and profit trends over time</p>
            </CardHeader>
            <CardContent className="h-96">
              <VarianceTrendChart data={chartData.varianceTrend} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location-analysis">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Location Profitability Analysis</CardTitle>
              <p className="text-sm text-white/60">Revenue and profit performance by location</p>
            </CardHeader>
            <CardContent className="h-96">
              <LocationDistributionChart data={chartData.locationDistribution} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  trend: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
}

const StatsCard = ({ title, value, trend, icon, color }: StatsCardProps) => {
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
        <span className={trend.direction === "up" ? "text-green-500" : "text-red-500"}>
          {trend.direction === "up" ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
          {trend.value}
        </span>
        <span className="text-white/40 ml-1">{trend.period}</span>
      </div>
    </div>
  );
};

export default ProjectionDashboard;
