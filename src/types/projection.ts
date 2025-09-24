export type ProjectionStatus = 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'APPROVED' | 'ARCHIVED';
export type ProjectionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Projection {
  id: string;
  title: string;
  description?: string;
  location_id: string;
  location_description: string;
  billing_period_id: string;
  billing_period_name: string;
  expected_hours: number;
  expected_revenue: number;
  actual_hours?: number;
  actual_revenue?: number;
  status: ProjectionStatus;
  priority: ProjectionPriority;
  projection_date: string;
  review_date?: string;
  estimator_percentage?: number;
  estimated_hours?: number;
  estimated_revenue?: number;
  variance_percentage?: number;
  notes?: string;
  // Expenditure fields (computed based on expected_revenue)
  readonly monthly_gross_wages_salaries?: number; // 68% of expected_revenue
  readonly monthly_gross_income?: number; // 32% of expected_revenue
  readonly payroll_taxes?: number; // 8% of monthly_gross_wages_salaries
  readonly admin_cost?: number; // 10% of monthly_gross_wages_salaries
  readonly management_payroll_expenses?: number; // 3% of monthly_gross_wages_salaries
  estimated_other?: number; // Manual input
  readonly employee_engagement?: number; // 2% of monthly_gross_wages_salaries
  readonly health_insurance_benefits?: number; // 6% of monthly_gross_wages_salaries
  readonly travel?: number; // 1.5% of monthly_gross_wages_salaries
  readonly other_benefits?: number; // 2% of monthly_gross_wages_salaries
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateProjectionRequest {
  title: string;
  description?: string;
  location_id: string;
  billing_period_id: string;
  expected_hours: number;
  expected_revenue: number;
  status?: ProjectionStatus;
  priority?: ProjectionPriority;
  projection_date: string;
  review_date?: string;
  estimator_percentage?: number;
  notes?: string;
  // Expenditure fields - only manual input fields for create/update requests
  monthly_gross_wages_salaries?: number; // Manual input - base for calculations
  monthly_gross_income?: number; // Manual input
  estimated_other?: number; // Manual input
}

export interface UpdateProjectionRequest extends Partial<CreateProjectionRequest> {
  actual_hours?: number;
  actual_revenue?: number;
  variance_percentage?: number;
}

export interface ProjectionWithDetails extends Projection {
  location_description: string;
  billing_period_start_date: string;
  billing_period_end_date: string;
}

export interface ProjectionMetrics {
  totalProjections: number;
  activeProjections: number;
  approvedProjections: number;
  underReviewProjections: number;
  totalExpectedRevenue: number;
  totalActualRevenue: number;
  totalOperatingCosts: number;
  totalExpectedHours: number;
  totalActualHours: number;
  avgVariancePercentage: number;
  avgEstimatorImpact: number;
  totalTrend: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  activeTrend: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  approvedTrend: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  revenueTrend: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
}

export interface ProjectionChartData {
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  priorityDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  revenueComparison: Array<{
    name: string;
    expected: number;
    actual: number;
  }>;
  hoursComparison: Array<{
    name: string;
    expected: number;
    actual: number;
  }>;
  varianceTrend: Array<{
    date: string;
    variance: number;
    projections: number;
  }>;
  locationDistribution: Array<{
    location: string;
    projections: number;
    revenue: number;
  }>;
}

export interface ProjectionFormData {
  title: string;
  description: string;
  locationId: string;
  billingPeriodId: string;
  expectedHours: number;
  expectedRevenue: number;
  status: ProjectionStatus;
  priority: ProjectionPriority;
  projectionDate: string;
  reviewDate: string;
  estimatorPercentage: number;
  notes: string;
}
