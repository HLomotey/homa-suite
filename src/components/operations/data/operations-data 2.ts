// Mock data for Operations dashboard

export const jobOrderData = [
  { month: "Jan", total: 298, filled: 267, pending: 31 },
  { month: "Feb", total: 312, filled: 278, pending: 34 },
  { month: "Mar", total: 285, filled: 251, pending: 34 },
  { month: "Apr", total: 334, filled: 295, pending: 39 },
  { month: "May", total: 356, filled: 312, pending: 44 },
  { month: "Jun", total: 342, filled: 298, pending: 44 },
];

export const fillRateData = [
  { region: "North", fillRate: 92, placements: 156 },
  { region: "South", fillRate: 87, placements: 134 },
  { region: "East", fillRate: 89, placements: 178 },
  { region: "West", fillRate: 85, placements: 142 },
  { region: "Central", fillRate: 91, placements: 167 },
];

export const timeToFillData = [
  { month: "Jan", avgDays: 14, target: 12 },
  { month: "Feb", avgDays: 13, target: 12 },
  { month: "Mar", avgDays: 15, target: 12 },
  { month: "Apr", avgDays: 11, target: 12 },
  { month: "May", avgDays: 12, target: 12 },
  { month: "Jun", avgDays: 12, target: 12 },
];

export const jobTypeData = [
  { type: "Permanent", count: 198, color: "#3b82f6" },
  { type: "Contract", count: 89, color: "#10b981" },
  { type: "Temporary", count: 55, color: "#f59e0b" },
];

export const placementTrendData = [
  { week: "Week 1", placements: 67, target: 70 },
  { week: "Week 2", placements: 72, target: 70 },
  { week: "Week 3", placements: 68, target: 70 },
  { week: "Week 4", placements: 74, target: 70 },
];

// Additional data for Operations dashboard
export const regionPerformanceData = [
  { region: "North", fillRate: 92, timeToFill: 11, clientSatisfaction: 4.7 },
  { region: "South", fillRate: 87, timeToFill: 13, clientSatisfaction: 4.5 },
  { region: "East", fillRate: 89, timeToFill: 12, clientSatisfaction: 4.6 },
  { region: "West", fillRate: 85, timeToFill: 14, clientSatisfaction: 4.3 },
  { region: "Central", fillRate: 91, timeToFill: 10, clientSatisfaction: 4.8 },
];

export const clientSatisfactionData = [
  { month: "Jan", score: 4.5 },
  { month: "Feb", score: 4.6 },
  { month: "Mar", score: 4.4 },
  { month: "Apr", score: 4.7 },
  { month: "May", score: 4.8 },
  { month: "Jun", score: 4.7 },
];

export const topPerformersData = [
  { name: "John Smith", placements: 42, fillRate: 94, region: "North" },
  { name: "Maria Garcia", placements: 38, fillRate: 91, region: "Central" },
  { name: "David Chen", placements: 35, fillRate: 89, region: "East" },
  { name: "Sarah Johnson", placements: 33, fillRate: 92, region: "North" },
  { name: "Michael Brown", placements: 31, fillRate: 87, region: "West" },
];

export const industryBreakdownData = [
  { industry: "Healthcare", percentage: 32, color: "#3b82f6" },
  { industry: "Technology", percentage: 28, color: "#10b981" },
  { industry: "Manufacturing", percentage: 18, color: "#f59e0b" },
  { industry: "Retail", percentage: 12, color: "#8b5cf6" },
  { industry: "Finance", percentage: 10, color: "#ec4899" },
];
