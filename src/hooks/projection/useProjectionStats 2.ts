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

      // Fetch actual revenue from paid invoices
      const { data: paidInvoices, error: invoicesError } = await supabase
        .from('finance_invoices')
        .select(`
          client_name,
          date_paid,
          line_total,
          invoice_status
        `)
        .eq('invoice_status', 'paid')
        .not('date_paid', 'is', null) as { data: any[] | null; error: any };

      if (invoicesError) {
        console.warn('Error fetching invoice data:', invoicesError);
      }

      // Fetch staff locations for mapping
      const { data: staffLocations, error: locationsError } = await supabase
        .from('staff_locations')
        .select('location_description') as { data: any[] | null; error: any };

      if (locationsError) {
        console.warn('Error fetching staff locations:', locationsError);
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
      
      // Calculate actual revenue from paid invoices
      const actualRevenueFromInvoices = (paidInvoices || []).reduce((sum: number, invoice: any) => {
        return sum + (parseFloat(invoice.line_total) || 0);
      }, 0);
      
      const totalActualRevenue = actualRevenueFromInvoices;
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

      // Calculate actual trends from data
      const currentMonth = new Date().toISOString().substring(0, 7);
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 7);
      
      // Calculate current vs last month metrics
      const currentMonthProjections = projections.filter(p => 
        p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === currentMonth
      ).length;
      
      const lastMonthProjections = projections.filter(p => 
        p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === lastMonth
      ).length;
      
      const currentMonthRevenue = (paidInvoices || []).filter(invoice => 
        invoice.date_paid && new Date(invoice.date_paid).toISOString().substring(0, 7) === currentMonth
      ).reduce((sum, invoice) => sum + (parseFloat(invoice.line_total) || 0), 0);
      
      const lastMonthRevenue = (paidInvoices || []).filter(invoice => 
        invoice.date_paid && new Date(invoice.date_paid).toISOString().substring(0, 7) === lastMonth
      ).reduce((sum, invoice) => sum + (parseFloat(invoice.line_total) || 0), 0);
      
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return { value: "0%", direction: "up" as const, period: "vs last month" };
        const change = ((current - previous) / previous) * 100;
        return {
          value: `${Math.abs(change).toFixed(1)}%`,
          direction: change >= 0 ? "up" as const : "down" as const,
          period: "vs last month"
        };
      };
      
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
        totalTrend: calculateTrend(currentMonthProjections, lastMonthProjections),
        activeTrend: calculateTrend(
          projections.filter(p => p.status === 'ACTIVE' && p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === currentMonth).length,
          projections.filter(p => p.status === 'ACTIVE' && p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === lastMonth).length
        ),
        approvedTrend: calculateTrend(
          projections.filter(p => p.status === 'APPROVED' && p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === currentMonth).length,
          projections.filter(p => p.status === 'APPROVED' && p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === lastMonth).length
        ),
        revenueTrend: calculateTrend(currentMonthRevenue, lastMonthRevenue),
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

      // Create location mapping from client names to location descriptions
      const locationMapping = (staffLocations || []).reduce((acc: Record<string, string>, location: any) => {
        // Simple mapping - in production, you'd need a proper mapping table
        const locationDesc = location.location_description.toLowerCase();
        acc[locationDesc] = location.location_description;
        return acc;
      }, {} as Record<string, string>);

      // Calculate location stats from projections
      const locationStats = projections.reduce((acc: Record<string, { projections: number; expectedRevenue: number; actualRevenue: number }>, projection: any) => {
        const locationName = projection.staff_locations?.location_description || projection.location_description;
        if (!acc[locationName]) {
          acc[locationName] = { projections: 0, expectedRevenue: 0, actualRevenue: 0 };
        }
        acc[locationName].projections += 1;
        acc[locationName].expectedRevenue += projection.expected_revenue || 0;
        return acc;
      }, {} as Record<string, { projections: number; expectedRevenue: number; actualRevenue: number }>);

      // Add actual revenue from invoices to location stats
      (paidInvoices || []).forEach((invoice: any) => {
        const clientName = invoice.client_name.toLowerCase();
        // Try to match client name to location description
        const matchedLocation = Object.keys(locationMapping).find(loc => 
          clientName.includes(loc) || loc.includes(clientName)
        );
        
        if (matchedLocation) {
          const locationName = locationMapping[matchedLocation];
          if (locationStats[locationName]) {
            locationStats[locationName].actualRevenue += parseFloat(invoice.line_total) || 0;
          }
        }
      });

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
        revenueComparison: Object.entries(locationStats).slice(0, 10).map(([location, stats]) => ({
          name: location.substring(0, 20) + (location.length > 20 ? '...' : ''),
          expected: (stats as { projections: number; expectedRevenue: number; actualRevenue: number }).expectedRevenue,
          actual: (stats as { projections: number; expectedRevenue: number; actualRevenue: number }).actualRevenue,
        })),
        hoursComparison: projections.slice(0, 10).map((projection: any) => ({
          name: projection.title.substring(0, 20) + (projection.title.length > 20 ? '...' : ''),
          expected: projection.expected_hours || 0,
          actual: projection.actual_hours || 0,
        })),
        varianceTrend: generateRevenueVarianceTrend(paidInvoices || [], projections),
        locationDistribution: Object.entries(locationStats).map(([location, stats]) => ({
          location,
          projections: (stats as { projections: number; expectedRevenue: number; actualRevenue: number }).projections,
          revenue: (stats as { projections: number; expectedRevenue: number; actualRevenue: number }).actualRevenue || (stats as { projections: number; expectedRevenue: number; actualRevenue: number }).expectedRevenue,
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

  const generateRevenueVarianceTrend = (paidInvoices: any[], projections: any[]): Array<{ date: string; variance: number; projections: number; actualRevenue: number; expectedRevenue: number }> => {
    // Group paid invoices by month based on payment date
    const monthlyActualRevenue = (paidInvoices || []).reduce((acc: Record<string, number>, invoice: any) => {
      if (invoice.date_paid) {
        const monthStr = new Date(invoice.date_paid).toISOString().substring(0, 7);
        acc[monthStr] = (acc[monthStr] || 0) + (parseFloat(invoice.line_total) || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    // Group projections by month based on projection date
    const monthlyExpectedRevenue = projections.reduce((acc: Record<string, number>, projection: any) => {
      if (projection.projection_date) {
        const monthStr = new Date(projection.projection_date).toISOString().substring(0, 7);
        acc[monthStr] = (acc[monthStr] || 0) + (projection.expected_revenue || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    // Generate trend data for the last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7);
      
      const actualRevenue = monthlyActualRevenue[monthStr] || 0;
      const expectedRevenue = monthlyExpectedRevenue[monthStr] || 0;
      const variance = expectedRevenue > 0 ? ((actualRevenue - expectedRevenue) / expectedRevenue) * 100 : 0;
      const projectionCount = projections.filter(p => 
        p.projection_date && new Date(p.projection_date).toISOString().substring(0, 7) === monthStr
      ).length;
      
      months.push({
        date: monthStr,
        variance,
        projections: projectionCount,
        actualRevenue,
        expectedRevenue,
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
