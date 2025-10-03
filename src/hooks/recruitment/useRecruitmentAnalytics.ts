import { useState, useEffect, useCallback } from 'react';
import { useExternalStaff } from '../external-staff/useExternalStaff';

export interface RecruitmentMetrics {
  openPositions: number;
  applications: number;
  interviews: number;
  offersMade: number;
  newHires: number;
  avgTimeToHire: number;
  offerAcceptanceRate: number;
  costPerHire: number;
  qualifiedCandidateRate: number;
}

export interface DepartmentHiringData {
  department: string;
  avgTimeToHire: number;
  newHires: number;
  openPositions: number;
}

export interface HiringTrend {
  month: string;
  hires: number;
  applications: number;
}

export interface SourceOfHire {
  source: string;
  count: number;
  percentage: number;
}

export interface RecruitmentFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface RecruitmentAnalyticsData {
  metrics: RecruitmentMetrics;
  departmentData: DepartmentHiringData[];
  hiringTrends: HiringTrend[];
  sourceOfHire: SourceOfHire[];
  funnelData: RecruitmentFunnelData[];
  loading: boolean;
  error: string | null;
}

export function useRecruitmentAnalytics(timeRange: string = '6m', department: string = 'all'): RecruitmentAnalyticsData {
  const { externalStaff, loading: staffLoading, error: staffError } = useExternalStaff();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<Omit<RecruitmentAnalyticsData, 'loading' | 'error'>>({
    metrics: {
      openPositions: 0,
      applications: 0,
      interviews: 0,
      offersMade: 0,
      newHires: 0,
      avgTimeToHire: 0,
      offerAcceptanceRate: 0,
      costPerHire: 0,
      qualifiedCandidateRate: 0,
    },
    departmentData: [],
    hiringTrends: [],
    sourceOfHire: [],
    funnelData: [],
  });

  const calculateDateRange = useCallback(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }
    
    return { startDate, endDate: now };
  }, [timeRange]);

  const filterByDepartment = useCallback((staff: any[]) => {
    if (department === 'all') return staff;
    
    return staff.filter(person => {
      const dept = person['HOME DEPARTMENT'] || person['BUSINESS UNIT'] || '';
      return dept.toLowerCase().includes(department.toLowerCase());
    });
  }, [department]);

  const calculateMetrics = useCallback(() => {
    if (!externalStaff || externalStaff.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { startDate, endDate } = calculateDateRange();
      
      // Filter staff by department
      const filteredStaff = filterByDepartment(externalStaff);
      
      // Calculate new hires in the time range
      const newHires = filteredStaff.filter(person => {
        if (!person['HIRE DATE']) return false;
        const hireDate = new Date(person['HIRE DATE']);
        return hireDate >= startDate && hireDate <= endDate;
      });

      // Calculate department-wise data
      const departmentMap = new Map<string, { hires: number; totalDays: number; count: number }>();
      
      newHires.forEach(person => {
        const dept = person['HOME DEPARTMENT'] || person['BUSINESS UNIT'] || 'Unknown';
        const hireDate = new Date(person['HIRE DATE']);
        
        // Estimate time to hire (assuming 30-60 days average based on department complexity)
        let estimatedTimeToHire = 45; // default
        if (dept.toLowerCase().includes('engineering')) estimatedTimeToHire = 60;
        else if (dept.toLowerCase().includes('sales')) estimatedTimeToHire = 35;
        else if (dept.toLowerCase().includes('hr')) estimatedTimeToHire = 40;
        else if (dept.toLowerCase().includes('finance')) estimatedTimeToHire = 50;
        else if (dept.toLowerCase().includes('operations')) estimatedTimeToHire = 42;
        else if (dept.toLowerCase().includes('support')) estimatedTimeToHire = 30;
        
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, { hires: 0, totalDays: 0, count: 0 });
        }
        
        const deptData = departmentMap.get(dept)!;
        deptData.hires += 1;
        deptData.totalDays += estimatedTimeToHire;
        deptData.count += 1;
      });

      const departmentData: DepartmentHiringData[] = Array.from(departmentMap.entries()).map(([dept, data]) => ({
        department: dept,
        avgTimeToHire: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
        newHires: data.hires,
        openPositions: Math.max(1, Math.round(data.hires * 0.3)), // Estimate open positions
      }));

      // Calculate hiring trends by month
      const monthlyHires = new Map<string, { hires: number; applications: number }>();
      const months = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthKey);
        monthlyHires.set(monthKey, { hires: 0, applications: 0 });
      }

      newHires.forEach(person => {
        const hireDate = new Date(person['HIRE DATE']);
        const monthKey = hireDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyHires.has(monthKey)) {
          const monthData = monthlyHires.get(monthKey)!;
          monthData.hires += 1;
          monthData.applications += Math.floor(Math.random() * 8) + 3; // Estimate 3-10 applications per hire
        }
      });

      const hiringTrends: HiringTrend[] = months.map(month => ({
        month,
        hires: monthlyHires.get(month)?.hires || 0,
        applications: monthlyHires.get(month)?.applications || 0,
      }));

      // Calculate source of hire (simulated data based on industry standards)
      const totalHires = newHires.length;
      const sourceOfHire: SourceOfHire[] = [
        { source: 'Job Boards', count: Math.round(totalHires * 0.35), percentage: 35 },
        { source: 'Referrals', count: Math.round(totalHires * 0.25), percentage: 25 },
        { source: 'LinkedIn', count: Math.round(totalHires * 0.20), percentage: 20 },
        { source: 'Other', count: Math.round(totalHires * 0.20), percentage: 20 },
      ];

      // Calculate recruitment funnel (estimated based on industry standards)
      const estimatedApplications = totalHires * 15; // Assume 15 applications per hire
      const funnelData: RecruitmentFunnelData[] = [
        { stage: 'Applications', count: Math.round(estimatedApplications), percentage: 100 },
        { stage: 'Screened', count: Math.round(estimatedApplications * 0.5), percentage: 50 },
        { stage: 'Interviewed', count: Math.round(estimatedApplications * 0.22), percentage: 22 },
        { stage: 'Offers', count: Math.round(estimatedApplications * 0.08), percentage: 8 },
        { stage: 'Hired', count: totalHires, percentage: Math.round((totalHires / estimatedApplications) * 100) },
      ];

      // Calculate overall metrics
      const avgTimeToHire = departmentData.length > 0 
        ? Math.round(departmentData.reduce((sum, dept) => sum + dept.avgTimeToHire, 0) / departmentData.length)
        : 42;

      const totalOpenPositions = departmentData.reduce((sum, dept) => sum + dept.openPositions, 0);
      const totalApplications = Math.round(estimatedApplications);
      const totalInterviews = funnelData.find(f => f.stage === 'Interviewed')?.count || 0;
      const totalOffers = funnelData.find(f => f.stage === 'Offers')?.count || 0;

      const metrics: RecruitmentMetrics = {
        openPositions: Math.max(totalOpenPositions, 1),
        applications: Math.max(totalApplications, 1),
        interviews: Math.max(totalInterviews, 1),
        offersMade: Math.max(totalOffers, 1),
        newHires: totalHires,
        avgTimeToHire,
        offerAcceptanceRate: totalOffers > 0 ? Math.round((totalHires / totalOffers) * 100) : 85,
        costPerHire: 4250, // Industry average
        qualifiedCandidateRate: 32, // Industry average
      };

      setAnalyticsData({
        metrics,
        departmentData,
        hiringTrends,
        sourceOfHire,
        funnelData,
      });

    } catch (err) {
      console.error('Error calculating recruitment metrics:', err);
      setError('Failed to calculate recruitment metrics');
    } finally {
      setLoading(false);
    }
  }, [externalStaff, timeRange, department, calculateDateRange, filterByDepartment]);

  useEffect(() => {
    if (!staffLoading) {
      calculateMetrics();
    }
  }, [staffLoading, calculateMetrics]);

  useEffect(() => {
    if (staffError) {
      setError(staffError);
      setLoading(false);
    }
  }, [staffError]);

  return {
    ...analyticsData,
    loading: loading || staffLoading,
    error: error || staffError,
  };
}
