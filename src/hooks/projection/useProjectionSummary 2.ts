import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';

export interface ProjectionSummaryData {
  company_name: string;
  location_description: string;
  location_id: string;
  year: number;
  month: number;
  month_name: string;
  year_period: string;
  month_period: string;
  projection_count: number;
  total_expected_hours: number;
  total_actual_hours: number;
  avg_expected_hours: number;
  avg_actual_hours: number;
  total_expected_revenue: number;
  total_actual_revenue: number;
  avg_expected_revenue: number;
  avg_actual_revenue: number;
  total_monthly_gross_wages_salaries: number;
  total_monthly_gross_income: number;
  total_payroll_taxes: number;
  total_admin_cost: number;
  total_management_payroll_expenses: number;
  total_estimated_other: number;
  total_employee_engagement: number;
  total_health_insurance_benefits: number;
  total_travel: number;
  total_other_benefits: number;
  total_expenditures: number;
  avg_variance_percentage: number;
  avg_estimator_percentage: number;
  draft_count: number;
  active_count: number;
  under_review_count: number;
  approved_count: number;
  archived_count: number;
  low_priority_count: number;
  medium_priority_count: number;
  high_priority_count: number;
  urgent_priority_count: number;
  earliest_projection_date: string;
  latest_projection_date: string;
  earliest_created_at: string;
  latest_updated_at: string;
}

export interface ProjectionSummaryFilters {
  company?: string;
  year?: number;
  groupBy?: 'year' | 'month';
}

export const useProjectionSummary = (filters?: ProjectionSummaryFilters) => {
  const [summaryData, setSummaryData] = useState<ProjectionSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('projection_summary')
        .select('*');

      // Apply filters
      if (filters?.company && filters.company !== 'ALL') {
        query = query.eq('company_name', filters.company);
      }

      if (filters?.year) {
        query = query.eq('year', filters.year);
      }

      // Order by company name, then year, then month
      query = query.order('company_name').order('year', { ascending: false }).order('month', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setSummaryData(data || []);
    } catch (err) {
      console.error('Error fetching projection summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projection summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [filters?.company, filters?.year, filters?.groupBy]);

  // Get unique companies and years from the data
  const getUniqueCompanies = () => {
    const companies = Array.from(new Set(summaryData.map(item => item.company_name)));
    return companies.sort();
  };

  const getUniqueYears = () => {
    const years = Array.from(new Set(summaryData.map(item => item.year)));
    return years.sort((a, b) => b - a);
  };

  // Filter data based on groupBy preference
  const getFilteredData = () => {
    if (filters?.groupBy === 'month') {
      return summaryData;
    }
    
    // For yearly grouping, aggregate monthly data by year
    const yearlyMap = new Map<string, ProjectionSummaryData>();
    
    summaryData.forEach(item => {
      const key = `${item.company_name}-${item.year}`;
      
      if (!yearlyMap.has(key)) {
        yearlyMap.set(key, {
          ...item,
          month: 0, // Reset month for yearly view
          month_name: '',
          month_period: item.year_period,
        });
      } else {
        const existing = yearlyMap.get(key)!;
        // Aggregate the values
        existing.projection_count += item.projection_count;
        existing.total_expected_hours += item.total_expected_hours;
        existing.total_actual_hours += item.total_actual_hours;
        existing.total_expected_revenue += item.total_expected_revenue;
        existing.total_actual_revenue += item.total_actual_revenue;
        existing.total_monthly_gross_wages_salaries += item.total_monthly_gross_wages_salaries;
        existing.total_monthly_gross_income += item.total_monthly_gross_income;
        existing.total_payroll_taxes += item.total_payroll_taxes;
        existing.total_admin_cost += item.total_admin_cost;
        existing.total_management_payroll_expenses += item.total_management_payroll_expenses;
        existing.total_estimated_other += item.total_estimated_other;
        existing.total_employee_engagement += item.total_employee_engagement;
        existing.total_health_insurance_benefits += item.total_health_insurance_benefits;
        existing.total_travel += item.total_travel;
        existing.total_other_benefits += item.total_other_benefits;
        existing.total_expenditures += item.total_expenditures;
        existing.draft_count += item.draft_count;
        existing.active_count += item.active_count;
        existing.under_review_count += item.under_review_count;
        existing.approved_count += item.approved_count;
        existing.archived_count += item.archived_count;
        existing.low_priority_count += item.low_priority_count;
        existing.medium_priority_count += item.medium_priority_count;
        existing.high_priority_count += item.high_priority_count;
        existing.urgent_priority_count += item.urgent_priority_count;
        
        // Update date ranges
        if (item.earliest_projection_date < existing.earliest_projection_date) {
          existing.earliest_projection_date = item.earliest_projection_date;
        }
        if (item.latest_projection_date > existing.latest_projection_date) {
          existing.latest_projection_date = item.latest_projection_date;
        }
      }
    });
    
    return Array.from(yearlyMap.values()).sort((a, b) => {
      if (a.company_name !== b.company_name) {
        return a.company_name.localeCompare(b.company_name);
      }
      return b.year - a.year;
    });
  };

  return {
    summaryData: getFilteredData(),
    loading,
    error,
    refetch: fetchSummaryData,
    getUniqueCompanies,
    getUniqueYears,
  };
};
