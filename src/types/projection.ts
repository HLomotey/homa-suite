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
