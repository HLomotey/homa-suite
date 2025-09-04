// Job Order Types based on migration schema

export type JobOrderStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REJECTED';

export type PlacementStatus = 
  | 'TENTATIVE'
  | 'CONFIRMED'
  | 'STARTED'
  | 'ENDED';

export type PriorityLevel = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export interface JobOrder {
  id: string;
  job_order_number: string;
  title: string;
  description?: string;
  
  // Organization & Location
  organization_id: string;
  site_location?: string;
  
  // Request Details
  seats_requested: number;
  seats_filled: number;
  
  // Dates
  requested_at: string;
  requested_start_date?: string;
  due_date?: string;
  fill_by_date?: string;
  completed_at?: string;
  closed_at?: string;
  
  // Status & Priority
  status: JobOrderStatus;
  priority: PriorityLevel;
  
  // People
  requestor_id?: string;
  hr_coordinator_id?: string;
  approver_id?: string;
  owner_id?: string;
  
  // Additional Information
  notes?: string;
  approval_notes?: string;
  rejection_reason?: string;
  completion_notes?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface JobOrderPosition {
  id: string;
  job_order_id: string;
  
  // Position Details
  role_title: string;
  shift_type?: string;
  site_location?: string;
  
  // Seat Information
  seats_requested: number;
  seats_filled: number;
  
  // Requirements
  requirements?: string;
  hourly_rate?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface JobOrderPlacement {
  id: string;
  job_order_id: string;
  position_id?: string;
  
  // Placement Details
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  
  // Status & Dates
  status: PlacementStatus;
  confirmed_at?: string;
  start_date?: string;
  end_date?: string;
  
  // Additional Information
  notes?: string;
  hourly_rate?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface JobOrderAuditLog {
  id: string;
  job_order_id: string;
  
  // Event Details
  event_type: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  
  // Context
  user_id?: string;
  timestamp: string;
  
  // Additional Data
  metadata?: Record<string, any>;
}

export interface JobOrderNotification {
  id: string;
  job_order_id: string;
  
  // Notification Details
  recipient_id: string;
  notification_type: string;
  title: string;
  message: string;
  
  // Status
  is_read: boolean;
  read_at?: string;
  
  // Metadata
  created_at: string;
  metadata?: Record<string, any>;
}

// View types
export interface JobOrderWithDetails extends JobOrder {
  organization_name?: string;
  organization_location?: string;
  requestor_name?: string;
  coordinator_name?: string;
  approver_name?: string;
  owner_name?: string;
  fill_percentage: number;
  is_overdue: boolean;
}

export interface JobOrderStats {
  organization_id: string;
  total_orders: number;
  completed_orders: number;
  active_orders: number;
  overdue_orders: number;
  avg_completion_days?: number;
  avg_fill_percentage: number;
}

// Dashboard metrics types
export interface JobOrderDashboardMetrics {
  totalJobOrders: number;
  activeJobOrders: number;
  completedJobOrders: number;
  overdueJobOrders: number;
  avgFillPercentage: number;
  avgCompletionDays: number;
  
  // Trends
  totalTrend: { value: string; direction: 'up' | 'down'; period: string };
  activeTrend: { value: string; direction: 'up' | 'down'; period: string };
  completedTrend: { value: string; direction: 'up' | 'down'; period: string };
  overdueTrend: { value: string; direction: 'up' | 'down'; period: string };
}

// Chart data types
export interface JobOrderChartData {
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  priorityDistribution: Array<{ priority: string; count: number; percentage: number }>;
  completionTrend: Array<{ date: string; completed: number; created: number }>;
  fillRateByOrganization: Array<{ organization: string; fillRate: number; totalOrders: number }>;
}

// Form types
export interface CreateJobOrderRequest {
  title: string;
  description?: string;
  organization_id: string;
  site_location?: string;
  seats_requested: number;
  requested_start_date?: string;
  due_date?: string;
  fill_by_date?: string;
  priority: PriorityLevel;
  notes?: string;
  positions?: Omit<JobOrderPosition, 'id' | 'job_order_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateJobOrderRequest extends Partial<CreateJobOrderRequest> {
  id: string;
  status?: JobOrderStatus;
  approval_notes?: string;
  rejection_reason?: string;
  completion_notes?: string;
}
