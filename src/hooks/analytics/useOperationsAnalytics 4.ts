import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase/client';

// Database view interfaces
interface OperationsJobOrdersAnalytics {
  total_orders: number;
  completed_orders: number;
  open_orders: number;
  cancelled_orders: number;
  overall_fill_rate: number;
  avg_time_to_fill: string; // interval type from PostgreSQL
  recent_orders: number;
  recent_fills: number;
  urgent_orders: number;
  high_priority_orders: number;
  medium_priority_orders: number;
  low_priority_orders: number;
  locations_with_orders: number;
  departments_with_orders: number;
}

interface OperationsMonthlyTrends {
  year: number;
  month: number;
  month_start: string;
  month_name: string;
  total_orders: number;
  filled_orders: number;
  open_orders: number;
  cancelled_orders: number;
  monthly_fill_rate: number;
  avg_monthly_time_to_fill: string;
  urgent_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

interface OperationsDepartmentPerformance {
  department: string;
  total_orders: number;
  filled_orders: number;
  open_orders: number;
  department_fill_rate: number;
  avg_time_to_fill: string;
  urgent_orders: number;
  high_priority_orders: number;
  recent_orders: number;
  locations_served: number;
}

interface OperationsLocationPerformance {
  location_name: string;
  location_id: string;
  total_orders: number;
  filled_orders: number;
  open_orders: number;
  location_fill_rate: number;
  avg_time_to_fill: string;
  departments_served: number;
  recent_orders: number;
}

export interface OperationsMetrics {
  totalJobOrders: number;
  totalJobOrdersChange: number;
  fillRate: number;
  fillRateChange: number;
  avgTimeToFill: number; // in days
  avgTimeToFillChange: number;
  placementRate: number;
  placementRateChange: number;
  openOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  urgentOrders: number;
  highPriorityOrders: number;
}

export interface OperationsTrendData {
  month: string;
  totalOrders: number;
  filledOrders: number;
  fillRate: number;
}

export interface OperationsAnalyticsData {
  metrics: OperationsMetrics;
  trends: OperationsTrendData[];
  departmentPerformance: OperationsDepartmentPerformance[];
  locationPerformance: OperationsLocationPerformance[];
}

// Helper function to convert PostgreSQL interval to days
function intervalToDays(interval: string | null): number {
  if (!interval) return 0;
  
  // Parse PostgreSQL interval format (e.g., "12 days", "1 day 05:30:00", "05:30:00")
  const match = interval.match(/(\d+)\s*days?/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // If no days, try to parse hours and convert to days
  const timeMatch = interval.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    return Math.round(hours / 24 * 10) / 10; // Round to 1 decimal place
  }
  
  return 0;
}

export function useOperationsAnalytics() {
  return useQuery({
    queryKey: ['operations-analytics'],
    queryFn: async (): Promise<OperationsAnalyticsData> => {
      try {
        // Fetch main analytics summary
        const { data: mainAnalytics, error: mainError } = await supabase
          .from('operations_job_orders_analytics')
          .select('*')
          .single();

        if (mainError) throw mainError;

        // Fetch monthly trends (last 6 months)
        const { data: monthlyTrends, error: trendsError } = await supabase
          .from('operations_monthly_trends')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(6);

        if (trendsError) throw trendsError;

        // Fetch department performance
        const { data: departmentPerformance, error: deptError } = await supabase
          .from('operations_department_performance')
          .select('*')
          .order('total_orders', { ascending: false })
          .limit(10);

        if (deptError) throw deptError;

        // Fetch location performance
        const { data: locationPerformance, error: locError } = await supabase
          .from('operations_location_performance')
          .select('*')
          .order('total_orders', { ascending: false })
          .limit(10);

        if (locError) throw locError;

        const current = mainAnalytics as OperationsJobOrdersAnalytics;

        // Calculate metrics (for now without comparison since we don't have previous period data)
        const metrics: OperationsMetrics = {
          totalJobOrders: current.total_orders,
          totalJobOrdersChange: 0, // Would need previous period data
          fillRate: current.overall_fill_rate,
          fillRateChange: 0, // Would need previous period data
          avgTimeToFill: intervalToDays(current.avg_time_to_fill),
          avgTimeToFillChange: 0, // Would need previous period data
          placementRate: current.overall_fill_rate, // Using fill rate as placement rate
          placementRateChange: 0, // Would need previous period data
          openOrders: current.open_orders,
          completedOrders: current.completed_orders,
          cancelledOrders: current.cancelled_orders,
          urgentOrders: current.urgent_orders,
          highPriorityOrders: current.high_priority_orders,
        };

        // Generate trend data
        const trends: OperationsTrendData[] = (monthlyTrends as OperationsMonthlyTrends[] || [])
          .reverse() // Show oldest to newest
          .map(item => ({
            month: item.month_name,
            totalOrders: item.total_orders,
            filledOrders: item.filled_orders,
            fillRate: item.monthly_fill_rate,
          }));

        return {
          metrics,
          trends,
          departmentPerformance: departmentPerformance as OperationsDepartmentPerformance[] || [],
          locationPerformance: locationPerformance as OperationsLocationPerformance[] || [],
        };
      } catch (error) {
        console.error('Error fetching operations analytics:', error);
        throw new Error('Failed to fetch operations analytics');
      }
    },
  });
}
