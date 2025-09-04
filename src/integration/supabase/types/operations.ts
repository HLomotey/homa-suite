/**
 * Operations types for Supabase integration
 * These types define the operations data structure and related interfaces
 */

import { Json } from './database';

/**
 * JobOrder interface representing the job_orders table in Supabase
 */
export interface JobOrder {
  id: string;
  job_order_number: string;
  title: string;
  description?: string;
  
  // Organization & Location
  organization_id: string;
  organization_name?: string;
  site_location?: string;
  
  // Request Details
  seats_requested: number;
  seats_filled: number;
  fill_percentage: number;
  
  // Dates
  requested_at: string;
  requested_start_date?: string;
  due_date?: string;
  fill_by_date?: string;
  completed_at?: string;
  closed_at?: string;
  
  // Status & Priority
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVAL_PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'CANCELLED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  // Computed fields
  is_overdue: boolean;
  
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
  updated_at: string | null;
  created_by?: string;
  updated_by?: string;
}

/**
 * JobOrderStatus enum
 */
export type JobOrderStatus = 'filled' | 'pending';

/**
 * RegionPerformance interface representing the region_performance table in Supabase
 */
export interface RegionPerformance {
  id: string;
  region: string;
  fill_rate: number;
  time_to_fill: number;
  client_satisfaction: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * TopPerformer interface representing the top_performers table in Supabase
 */
export interface TopPerformer {
  id: string;
  name: string;
  region: string;
  placements: number;
  fill_rate: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * ClientSatisfaction interface representing the client_satisfaction table in Supabase
 */
export interface ClientSatisfaction {
  id: string;
  month: string;
  score: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * JobOrderTrend interface representing the job_order_trends table in Supabase
 */
export interface JobOrderTrend {
  id: string;
  month: string;
  total: number;
  filled: number;
  pending: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * TimeToFillTrend interface representing the time_to_fill_trends table in Supabase
 */
export interface TimeToFillTrend {
  id: string;
  month: string;
  avg_days: number;
  target: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * JobType interface representing the job_types table in Supabase
 */
export interface JobType {
  id: string;
  type: string;
  count: number;
  color: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend job order type that matches the structure in OperationsJobOrders.tsx
 */
export interface FrontendJobOrder {
  id: string;
  jobOrderId: string;
  client: string;
  position: string;
  status: JobOrderStatus;
  date: string;
  timeToFill: number | null;
}

/**
 * Frontend region performance type that matches the structure in OperationsPerformance.tsx
 */
export interface FrontendRegionPerformance {
  region: string;
  fillRate: number;
  timeToFill: number;
  clientSatisfaction: number;
}

/**
 * Frontend top performer type that matches the structure in OperationsPerformance.tsx
 */
export interface FrontendTopPerformer {
  name: string;
  region: string;
  placements: number;
  fillRate: number;
}

/**
 * Frontend client satisfaction type that matches the structure in operations-data.ts
 */
export interface FrontendClientSatisfaction {
  month: string;
  score: number;
}

/**
 * Frontend job order trend type that matches the structure in operations-data.ts
 */
export interface FrontendJobOrderTrend {
  month: string;
  total: number;
  filled: number;
  pending: number;
}

/**
 * Frontend time to fill trend type that matches the structure in operations-data.ts
 */
export interface FrontendTimeToFillTrend {
  month: string;
  avgDays: number;
  target: number;
}

/**
 * Frontend job type distribution that matches the structure in operations-data.ts
 */
export interface FrontendJobType {
  type: string;
  count: number;
  color: string;
}

/**
 * Maps a database job order to the frontend job order format
 */
export const mapDatabaseJobOrderToFrontend = (dbJobOrder: JobOrder): FrontendJobOrder => {
  return {
    id: dbJobOrder.id,
    jobOrderId: dbJobOrder.job_order_number,
    client: dbJobOrder.organization_name || dbJobOrder.organization_id,
    position: dbJobOrder.title,
    status: dbJobOrder.status as JobOrderStatus,
    date: dbJobOrder.created_at,
    timeToFill: dbJobOrder.completed_at && dbJobOrder.requested_at ? 
      Math.floor((new Date(dbJobOrder.completed_at).getTime() - new Date(dbJobOrder.requested_at).getTime()) / (1000 * 60 * 60 * 24)) : 
      null
  };
};

/**
 * Maps a database region performance to the frontend format
 */
export const mapDatabaseRegionPerformanceToFrontend = (
  dbRegionPerformance: RegionPerformance
): FrontendRegionPerformance => {
  return {
    region: dbRegionPerformance.region,
    fillRate: dbRegionPerformance.fill_rate,
    timeToFill: dbRegionPerformance.time_to_fill,
    clientSatisfaction: dbRegionPerformance.client_satisfaction
  };
};

/**
 * Maps a database top performer to the frontend format
 */
export const mapDatabaseTopPerformerToFrontend = (
  dbTopPerformer: TopPerformer
): FrontendTopPerformer => {
  return {
    name: dbTopPerformer.name,
    region: dbTopPerformer.region,
    placements: dbTopPerformer.placements,
    fillRate: dbTopPerformer.fill_rate
  };
};

/**
 * Maps a database client satisfaction to the frontend format
 */
export const mapDatabaseClientSatisfactionToFrontend = (
  dbClientSatisfaction: ClientSatisfaction
): FrontendClientSatisfaction => {
  return {
    month: dbClientSatisfaction.month,
    score: dbClientSatisfaction.score
  };
};

/**
 * Maps a database job order trend to the frontend format
 */
export const mapDatabaseJobOrderTrendToFrontend = (
  dbJobOrderTrend: JobOrderTrend
): FrontendJobOrderTrend => {
  return {
    month: dbJobOrderTrend.month,
    total: dbJobOrderTrend.total,
    filled: dbJobOrderTrend.filled,
    pending: dbJobOrderTrend.pending
  };
};

/**
 * Maps a database time to fill trend to the frontend format
 */
export const mapDatabaseTimeToFillTrendToFrontend = (
  dbTimeToFillTrend: TimeToFillTrend
): FrontendTimeToFillTrend => {
  return {
    month: dbTimeToFillTrend.month,
    avgDays: dbTimeToFillTrend.avg_days,
    target: dbTimeToFillTrend.target
  };
};

/**
 * Maps a database job type to the frontend format
 */
export const mapDatabaseJobTypeToFrontend = (
  dbJobType: JobType
): FrontendJobType => {
  return {
    type: dbJobType.type,
    count: dbJobType.count,
    color: dbJobType.color
  };
};
