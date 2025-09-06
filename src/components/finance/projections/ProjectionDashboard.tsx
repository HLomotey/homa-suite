import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, Target, BarChart3, PieChart, Loader2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
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
          title="Total Projections" 
          value={metrics.totalProjections.toLocaleString()} 
          trend={metrics.totalTrend}
          icon={<TrendingUp className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard 
          title="Active Projections" 
          value={metrics.activeProjections.toLocaleString()} 
          trend={metrics.activeTrend}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <StatsCard 
          title="Approved Projections" 
          value={metrics.approvedProjections.toLocaleString()} 
          trend={metrics.approvedTrend}
          icon={<CheckCircle className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard 
          title="Under Review" 
          value={metrics.underReviewProjections.toLocaleString()} 
          trend={metrics.revenueTrend}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Average Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.avgVariancePercentage.toFixed(1)}%</div>
            <p className="text-xs text-white/60">
              Average variance between expected and actual
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Total Expected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${metrics.totalExpectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-white/60">
              Combined expected revenue across all projections
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Estimator Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.avgEstimatorImpact.toFixed(1)}%</div>
            <p className="text-xs text-white/60">
              Average estimator adjustment percentage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="status-distribution" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="status-distribution">Status Distribution</TabsTrigger>
          <TabsTrigger value="priority-distribution">Priority Distribution</TabsTrigger>
          <TabsTrigger value="variance-trends">Variance Trends</TabsTrigger>
          <TabsTrigger value="location-analysis">Location Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status-distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">Status Distribution</CardTitle>
                <p className="text-sm text-white/60">Projection status breakdown</p>
              </CardHeader>
              <CardContent className="h-80">
                <StatusDistributionChart data={chartData.statusDistribution} />
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">Revenue Comparison</CardTitle>
                <p className="text-sm text-white/60">Expected vs Actual Revenue</p>
              </CardHeader>
              <CardContent className="h-80">
                <div className="space-y-4">
                  {chartData.revenueComparison.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/80 truncate flex-1">{item.name}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-400">
                          ${item.expected.toLocaleString()}
                        </span>
                        <span className="text-green-400">
                          ${item.actual.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="priority-distribution">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Priority Distribution</CardTitle>
              <p className="text-sm text-white/60">Projection priority breakdown</p>
            </CardHeader>
            <CardContent className="h-96">
              <PriorityDistributionChart data={chartData.priorityDistribution} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance-trends">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Variance Trends</CardTitle>
              <p className="text-sm text-white/60">Projection variance trends over time</p>
            </CardHeader>
            <CardContent className="h-96">
              <VarianceTrendChart data={chartData.varianceTrend} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location-analysis">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Location Analysis</CardTitle>
              <p className="text-sm text-white/60">Projection distribution by location</p>
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
