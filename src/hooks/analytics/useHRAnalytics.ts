import { useState, useEffect } from "react";

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
  avgDailyHoursChange: number;
  employeeSatisfaction: number;
  employeeSatisfactionChange: number;
  employees: any[];
}

// Mock data for 6-card layout
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
  avgDailyHoursChange: 0.3,
  employeeSatisfaction: 89,
  employeeSatisfactionChange: 2.1,
  employees: [
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
  ]
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
