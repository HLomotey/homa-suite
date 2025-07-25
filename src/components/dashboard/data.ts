// Dashboard data module
// Contains interfaces and mock data for dashboard components

// HR Analytics Data
export interface HRAnalytics {
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
}

// Finance Analytics Data
export interface FinanceAnalytics {
  dailyRevenue: number;
  dailyRevenueChange: number;
  grossMargin: number;
  grossMarginChange: number;
  netProfit: number;
  netProfitChange: number;
  cashFlow: number;
  costPerHire: number;
}

// Operations Analytics Data
export interface OperationsAnalytics {
  totalJobOrders: number;
  totalJobOrdersChange: number;
  fillRate: number;
  fillRateChange: number;
  daysToFill: number;
  daysToFillChange: number;
  placementRate: number;
  placementRateChange: number;
}

// Mock data for dashboard
export const hrAnalytics: HRAnalytics = {
  headCount: 1247,
  headCountChange: 5.2,
  retentionRate: 94,
  retentionRateChange: 2.5,
  terminations: 23,
  terminationsChange: -3.1,
  daysToHire: 18,
  daysToHireChange: -10.5,
  avgDailyHours: 8.2,
  employeeSatisfaction: 89
};

export const financeAnalytics: FinanceAnalytics = {
  dailyRevenue: 2400000, // $2.4M
  dailyRevenueChange: 3.8,
  grossMargin: 68,
  grossMarginChange: -1.2,
  netProfit: 890000, // $890K
  netProfitChange: 12.5,
  cashFlow: 1200000, // $1.2M
  costPerHire: 4200
};

export const operationsAnalytics: OperationsAnalytics = {
  totalJobOrders: 342,
  totalJobOrdersChange: 2.1,
  fillRate: 87,
  fillRateChange: 3.4,
  daysToFill: 12,
  daysToFillChange: -5.8,
  placementRate: 91,
  placementRateChange: 1.7
};

// Recent activities data
export interface Activity {
  id: number;
  type: 'hr' | 'finance' | 'operations' | 'property';
  title: string;
  description: string;
  timestamp: string;
}

export const recentActivities: Activity[] = [
  {
    id: 1,
    type: 'hr',
    title: 'New Employee Onboarded',
    description: 'John Smith joined as Senior Developer',
    timestamp: '2h ago'
  },
  {
    id: 2,
    type: 'finance',
    title: 'Payment Received',
    description: '$45,231.89 from Client #1234',
    timestamp: '3h ago'
  },
  {
    id: 3,
    type: 'operations',
    title: 'Job Order Filled',
    description: 'Position ID #5678 filled successfully',
    timestamp: '5h ago'
  },
  {
    id: 4,
    type: 'property',
    title: 'New Property Added',
    description: 'Property #9012 added to inventory',
    timestamp: '8h ago'
  },
  {
    id: 5,
    type: 'finance',
    title: 'Invoice Generated',
    description: 'Invoice #3456 for $12,500.00',
    timestamp: '10h ago'
  }
];

// Reports data
export interface Report {
  id: string;
  name: string;
  type: 'hr' | 'finance' | 'operations' | 'property';
  date: string;
  size: string;
  downloadUrl: string;
}

export const recentReports: Report[] = [
  {
    id: 'rep-001',
    name: 'HR Monthly Report - June 2024',
    type: 'hr',
    date: '2024-07-01',
    size: '2.4 MB',
    downloadUrl: '#'
  },
  {
    id: 'rep-002',
    name: 'Financial Statement Q2 2024',
    type: 'finance',
    date: '2024-07-15',
    size: '3.8 MB',
    downloadUrl: '#'
  },
  {
    id: 'rep-003',
    name: 'Operations Performance - June 2024',
    type: 'operations',
    date: '2024-07-05',
    size: '1.7 MB',
    downloadUrl: '#'
  },
  {
    id: 'rep-004',
    name: 'Property Occupancy Report - Q2 2024',
    type: 'property',
    date: '2024-07-10',
    size: '5.2 MB',
    downloadUrl: '#'
  }
];
