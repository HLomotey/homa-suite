import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { ProjectionMetrics, ProjectionChartData } from '@/types/projection';
import { toast } from 'sonner';

export const useProjectionStats = () => {
  const [metrics, setMetrics] = useState<ProjectionMetrics | null>(null);
  const [chartData, setChartData] = useState<ProjectionChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectionMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all projections with related data
      const { data: projections, error: projectionsError } = await supabase
        .from('projections')
        .select(`
          *,
          staff_locations!fk_projections_location (
            location_description
          )
        `) as { data: any[] | null; error: any };

      if (projectionsError) {
        throw projectionsError;
      }

      if (!projections || projections.length === 0) {
        setMetrics({
          totalProjections: 0,
          activeProjections: 0,
          approvedProjections: 0,
          underReviewProjections: 0,
          totalExpectedRevenue: 0,
          totalActualRevenue: 0,
          totalExpectedHours: 0,
          totalActualHours: 0,
          avgVariancePercentage: 0,
          avgEstimatorImpact: 0,
          totalTrend: { value: "0%", direction: "up", period: "vs last month" },
          activeTrend: { value: "0%", direction: "up", period: "vs last month" },
          approvedTrend: { value: "0%", direction: "up", period: "vs last month" },
          revenueTrend: { value: "0%", direction: "up", period: "vs last month" },
        });
        setChartData({
          statusDistribution: [],
          priorityDistribution: [],
          revenueComparison: [],
          hoursComparison: [],
          varianceTrend: [],
          locationDistribution: [],
        });
        return;
      }

      // Calculate metrics
      const totalProjections = projections.length;
      const activeProjections = projections.filter((p: any) => p.status === 'ACTIVE').length;
      const approvedProjections = projections.filter((p: any) => p.status === 'APPROVED').length;
      const underReviewProjections = projections.filter((p: any) => p.status === 'UNDER_REVIEW').length;

      const totalExpectedRevenue = projections.reduce((sum: number, p: any) => sum + (p.expected_revenue || 0), 0);
      const totalActualRevenue = projections.reduce((sum: number, p: any) => sum + (p.actual_revenue || 0), 0);
      const totalExpectedHours = projections.reduce((sum: number, p: any) => sum + (p.expected_hours || 0), 0);
      const totalActualHours = projections.reduce((sum: number, p: any) => sum + (p.actual_hours || 0), 0);

      const avgVariancePercentage = projections
        .filter((p: any) => p.variance_percentage !== null)
        .reduce((sum: number, p: any) => sum + (p.variance_percentage || 0), 0) / 
        projections.filter((p: any) => p.variance_percentage !== null).length || 0;

      const avgEstimatorImpact = projections
        .filter((p: any) => p.estimator_percentage !== null)
        .reduce((sum: number, p: any) => sum + (p.estimator_percentage || 0), 0) / 
        projections.filter((p: any) => p.estimator_percentage !== null).length || 0;

      // Mock trend data (in a real app, you'd compare with previous period)
      const metrics: ProjectionMetrics = {
        totalProjections,
        activeProjections,
        approvedProjections,
        underReviewProjections,
        totalExpectedRevenue,
        totalActualRevenue,
        totalExpectedHours,
        totalActualHours,
        avgVariancePercentage,
        avgEstimatorImpact,
        totalTrend: { value: "15%", direction: "up", period: "vs last month" },
        activeTrend: { value: "12%", direction: "up", period: "vs last month" },
        approvedTrend: { value: "18%", direction: "up", period: "vs last month" },
        revenueTrend: { value: "25%", direction: "up", period: "vs last month" },
      };

      // Prepare chart data
      const statusCounts = projections.reduce((acc: Record<string, number>, projection: any) => {
        acc[projection.status] = (acc[projection.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityCounts = projections.reduce((acc: Record<string, number>, projection: any) => {
        acc[projection.priority] = (acc[projection.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const locationStats = projections.reduce((acc: Record<string, { projections: number; revenue: number }>, projection: any) => {
        const locationName = projection.staff_locations?.location_description || projection.location_description;
        if (!acc[locationName]) {
          acc[locationName] = { projections: 0, revenue: 0 };
        }
        acc[locationName].projections += 1;
        acc[locationName].revenue += projection.actual_revenue || projection.expected_revenue || 0;
        return acc;
      }, {} as Record<string, { projections: number; revenue: number }>);

      const chartData: ProjectionChartData = {
        statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value: value as number,
          color: getStatusColor(name),
        })),
        priorityDistribution: Object.entries(priorityCounts).map(([name, value]) => ({
          name,
          value: value as number,
          color: getPriorityColor(name),
        })),
        revenueComparison: projections.slice(0, 10).map((projection: any) => ({
          name: projection.title.substring(0, 20) + (projection.title.length > 20 ? '...' : ''),
          expected: projection.expected_revenue || 0,
          actual: projection.actual_revenue || 0,
        })),
        hoursComparison: projections.slice(0, 10).map((projection: any) => ({
          name: projection.title.substring(0, 20) + (projection.title.length > 20 ? '...' : ''),
          expected: projection.expected_hours || 0,
          actual: projection.actual_hours || 0,
        })),
        varianceTrend: generateMockVarianceTrend(projections),
        locationDistribution: Object.entries(locationStats).map(([location, stats]) => ({
          location,
          projections: (stats as { projections: number; revenue: number }).projections,
          revenue: (stats as { projections: number; revenue: number }).revenue,
        })),
      };

      setMetrics(metrics);
      setChartData(chartData);
    } catch (err: any) {
      console.error('Error fetching projection metrics:', err);
      setError(err.message || 'Failed to fetch projection metrics');
      toast.error('Failed to fetch projection metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      DRAFT: '#6b7280',
      ACTIVE: '#10b981',
      UNDER_REVIEW: '#f59e0b',
      APPROVED: '#8b5cf6',
      ARCHIVED: '#374151',
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      LOW: '#10b981',
      MEDIUM: '#3b82f6',
      HIGH: '#f59e0b',
      URGENT: '#ef4444',
    };
    return colors[priority] || '#6b7280';
  };

  const generateMockVarianceTrend = (projections: any[]): Array<{ date: string; variance: number; projections: number }> => {
    // Generate mock trend data for the last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7);
      
      // Mock data - in real app, calculate actual variance
      const variance = (Math.random() - 0.5) * 20; // -10% to +10% variance
      const projectionCount = Math.floor(Math.random() * 15) + 5;
      
      months.push({
        date: monthStr,
        variance,
        projections: projectionCount,
      });
    }
    
    return months;
  };

  useEffect(() => {
    fetchProjectionMetrics();
  }, []);

  return {
    metrics,
    chartData,
    loading,
    error,
    refetch: fetchProjectionMetrics,
  };
};
