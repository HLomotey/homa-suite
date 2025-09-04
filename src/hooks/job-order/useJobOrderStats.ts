import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { JobOrderStats, JobOrderDashboardMetrics, JobOrderChartData } from '@/types/job-order';

export const useJobOrderStats = () => {
  const [stats, setStats] = useState<JobOrderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('job_order_stats')
        .select('*');

      if (fetchError) throw fetchError;

      setStats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job order statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};

export const useJobOrderDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<JobOrderDashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<JobOrderChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current metrics
      const { data: currentData, error: currentError } = await supabase
        .from('job_orders_with_details')
        .select('*');

      if (currentError) throw currentError;

      // Fetch previous period data for trends (30 days ago)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: previousData, error: previousError } = await supabase
        .from('job_orders_with_details')
        .select('*')
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (previousError) throw previousError;

      // Calculate current metrics
      const totalJobOrders = currentData?.length || 0;
      const activeJobOrders = currentData?.filter(jo => 
        ['IN_PROGRESS', 'APPROVED', 'APPROVAL_PENDING'].includes(jo.status)
      ).length || 0;
      const completedJobOrders = currentData?.filter(jo => jo.status === 'COMPLETED').length || 0;
      const overdueJobOrders = currentData?.filter(jo => jo.is_overdue).length || 0;
      
      const avgFillPercentage = currentData?.length ? 
        currentData.reduce((sum, jo) => sum + jo.fill_percentage, 0) / currentData.length : 0;
      
      const completedWithDays = currentData?.filter(jo => 
        jo.status === 'COMPLETED' && jo.completed_at && jo.requested_at
      );
      const avgCompletionDays = completedWithDays?.length ? 
        completedWithDays.reduce((sum, jo) => {
          const days = Math.floor(
            (new Date(jo.completed_at!).getTime() - new Date(jo.requested_at).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / completedWithDays.length : 0;

      // Calculate previous metrics for trends
      const prevTotalJobOrders = previousData?.length || 0;
      const prevActiveJobOrders = previousData?.filter(jo => 
        ['IN_PROGRESS', 'APPROVED', 'APPROVAL_PENDING'].includes(jo.status)
      ).length || 0;
      const prevCompletedJobOrders = previousData?.filter(jo => jo.status === 'COMPLETED').length || 0;
      const prevOverdueJobOrders = previousData?.filter(jo => jo.is_overdue).length || 0;

      // Calculate trends
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return { value: '0%', direction: 'up' as const };
        const change = ((current - previous) / previous) * 100;
        return {
          value: `${Math.abs(change).toFixed(1)}%`,
          direction: change >= 0 ? 'up' as const : 'down' as const
        };
      };

      const dashboardMetrics: JobOrderDashboardMetrics = {
        totalJobOrders,
        activeJobOrders,
        completedJobOrders,
        overdueJobOrders,
        avgFillPercentage,
        avgCompletionDays,
        totalTrend: { ...calculateTrend(totalJobOrders, prevTotalJobOrders), period: 'vs last month' },
        activeTrend: { ...calculateTrend(activeJobOrders, prevActiveJobOrders), period: 'vs last month' },
        completedTrend: { ...calculateTrend(completedJobOrders, prevCompletedJobOrders), period: 'vs last month' },
        overdueTrend: { ...calculateTrend(overdueJobOrders, prevOverdueJobOrders), period: 'vs last month' }
      };

      // Prepare chart data
      const statusCounts = currentData?.reduce((acc, jo) => {
        acc[jo.status] = (acc[jo.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const priorityCounts = currentData?.reduce((acc, jo) => {
        acc[jo.priority] = (acc[jo.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalJobOrders > 0 ? (count / totalJobOrders) * 100 : 0
      }));

      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
        percentage: totalJobOrders > 0 ? (count / totalJobOrders) * 100 : 0
      }));

      // Generate completion trend data for last 30 days
      const completionTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const completed = currentData?.filter(jo => 
          jo.completed_at && jo.completed_at.startsWith(dateStr)
        ).length || 0;
        
        const created = currentData?.filter(jo => 
          jo.created_at.startsWith(dateStr)
        ).length || 0;

        completionTrend.push({
          date: dateStr,
          completed,
          created
        });
      }

      // Fill rate by organization
      const orgStats = currentData?.reduce((acc, jo) => {
        if (!acc[jo.organization_name || 'Unknown']) {
          acc[jo.organization_name || 'Unknown'] = { totalOrders: 0, totalFillRate: 0 };
        }
        acc[jo.organization_name || 'Unknown'].totalOrders += 1;
        acc[jo.organization_name || 'Unknown'].totalFillRate += jo.fill_percentage;
        return acc;
      }, {} as Record<string, { totalOrders: number; totalFillRate: number }>) || {};

      const fillRateByOrganization = Object.entries(orgStats).map(([organization, stats]) => ({
        organization,
        fillRate: stats.totalOrders > 0 ? stats.totalFillRate / stats.totalOrders : 0,
        totalOrders: stats.totalOrders
      }));

      const chartData: JobOrderChartData = {
        statusDistribution,
        priorityDistribution,
        completionTrend,
        fillRateByOrganization
      };

      setMetrics(dashboardMetrics);
      setChartData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    metrics,
    chartData,
    loading,
    error,
    fetchDashboardData
  };
};
