import { useState, useEffect } from "react";

export interface HRTrendData {
  month: string;
  hires: number;
  terminations: number;
  netChange: number;
  retentionRate: number;
  headCount: number;
}

export interface DepartmentMetrics {
  department: string;
  headCount: number;
  hires: number;
  terminations: number;
  retentionRate: number;
  avgTenure: number;
}

export interface HRAnalyticsData {
  headCount: number;
  headCountChange: number;
  retentionRate: number;
  retentionRateChange: number;
  terminations: number;
  terminationsChange: number;
  daysToHire: number;
  daysToHireChange: number;
  avgDailyHours: number;
  employeeSatisfaction: number;
  trendData: HRTrendData[];
  departmentMetrics: DepartmentMetrics[];
  recentHires: any[];
  recentTerminations: any[];
  topPerformingDepartments: any[];
  employees: any[];
}

// Mock data for stable functionality
const mockEmployees = [
  {
    id: "EMP-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Engineering",
    position: "Senior Software Engineer",
    status: "active",
    hireDate: "2022-03-15"
  },
  {
    id: "EMP-002", 
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Marketing",
    position: "Marketing Manager",
    status: "active",
    hireDate: "2021-08-20"
  },
  {
    id: "EMP-003",
    name: "Emily Rodriguez", 
    email: "emily.rodriguez@company.com",
    department: "Sales",
    position: "Sales Representative",
    status: "active",
    hireDate: "2023-01-10"
  }
];

const mockAnalyticsData: HRAnalyticsData = {
  headCount: 247,
  headCountChange: 3.2,
  retentionRate: 94.8,
  retentionRateChange: 1.5,
  terminations: 8,
  terminationsChange: -12.5,
  daysToHire: 28,
  daysToHireChange: -2.1,
  avgDailyHours: 8.2,
  employeeSatisfaction: 89,
  trendData: [
    { month: "Jan 2024", hires: 12, terminations: 3, netChange: 9, retentionRate: 95.2, headCount: 238 },
    { month: "Feb 2024", hires: 8, terminations: 5, netChange: 3, retentionRate: 94.1, headCount: 241 },
    { month: "Mar 2024", hires: 15, terminations: 2, netChange: 13, retentionRate: 95.8, headCount: 254 },
    { month: "Apr 2024", hires: 6, terminations: 4, netChange: 2, retentionRate: 94.5, headCount: 256 },
    { month: "May 2024", hires: 10, terminations: 7, netChange: 3, retentionRate: 93.9, headCount: 259 },
    { month: "Jun 2024", hires: 9, terminations: 3, netChange: 6, retentionRate: 95.1, headCount: 265 }
  ],
  departmentMetrics: [
    { department: "Engineering", headCount: 89, hires: 12, terminations: 2, retentionRate: 97.8, avgTenure: 2.8 },
    { department: "Sales", headCount: 45, hires: 8, terminations: 3, retentionRate: 93.3, avgTenure: 1.9 },
    { department: "Marketing", headCount: 32, hires: 5, terminations: 1, retentionRate: 96.9, avgTenure: 2.4 },
    { department: "Operations", headCount: 28, hires: 3, terminations: 2, retentionRate: 92.9, avgTenure: 3.1 },
    { department: "HR", headCount: 15, hires: 2, terminations: 0, retentionRate: 100.0, avgTenure: 4.2 }
  ],
  recentHires: mockEmployees.slice(0, 3),
  recentTerminations: [],
  topPerformingDepartments: [
    { department: "HR", retentionRate: 100.0 },
    { department: "Engineering", retentionRate: 97.8 },
    { department: "Marketing", retentionRate: 96.9 }
  ],
  employees: mockEmployees
};

export function useHRAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HRAnalyticsData>(mockAnalyticsData);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const refetch = async () => {
    setLoading(true);
    // Simulate refetch delay
    setTimeout(() => {
      setData({ ...mockAnalyticsData });
      setLoading(false);
    }, 300);
  };

  return {
    data,
    loading,
    error,
    refetch
  };
}
