/**
 * Route Assignment types for Supabase integration
 * These types define the route assignment structure and related interfaces
 */

import { Json } from './database';

/**
 * Assignment status enum
 */
export type AssignmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

/**
 * Execution status enum
 */
export type ExecutionStatus = 'started' | 'completed' | 'delayed' | 'cancelled';

/**
 * RouteAssignment interface representing the route_assignments table in Supabase
 */
export interface RouteAssignment {
  id: string;
  combined_route_id: string;
  vehicle_id: string;
  driver_id: string;
  start_date: string;
  end_date: string | null;
  status: AssignmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * RouteExecutionLog interface representing the route_execution_logs table in Supabase
 */
export interface RouteExecutionLog {
  id: string;
  route_assignment_id: string;
  execution_date: string;
  start_time: string;
  end_time: string | null;
  status: ExecutionStatus;
  delay_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend route assignment that matches the structure for frontend components
 */
export interface FrontendRouteAssignment {
  id: string;
  combinedRouteId: string;
  combinedRouteName?: string;
  vehicleId: string;
  vehicleInfo?: string;
  driverId: string;
  driverName?: string;
  startDate: string;
  endDate: string | null;
  status: AssignmentStatus;
  notes: string | null;
  routes?: Array<{
    id: string;
    routeId: string;
    routeName: string;
    order: number;
  }>;
  executionLogs?: FrontendRouteExecutionLog[];
}

/**
 * Frontend route execution log that matches the structure for frontend components
 */
export interface FrontendRouteExecutionLog {
  id: string;
  routeAssignmentId: string;
  executionDate: string;
  startTime: string;
  endTime: string | null;
  status: ExecutionStatus;
  delayReason: string | null;
  notes: string | null;
}

/**
 * Maps a database route assignment to the frontend route assignment format
 */
export function mapDatabaseRouteAssignmentToFrontend(dbAssignment: RouteAssignment): FrontendRouteAssignment {
  return {
    id: dbAssignment.id,
    combinedRouteId: dbAssignment.combined_route_id,
    vehicleId: dbAssignment.vehicle_id,
    driverId: dbAssignment.driver_id,
    startDate: dbAssignment.start_date,
    endDate: dbAssignment.end_date,
    status: dbAssignment.status,
    notes: dbAssignment.notes,
  };
}

/**
 * Maps a frontend route assignment to the database route assignment format
 */
export function mapFrontendRouteAssignmentToDatabase(frontendAssignment: FrontendRouteAssignment): RouteAssignment {
  return {
    id: frontendAssignment.id,
    combined_route_id: frontendAssignment.combinedRouteId,
    vehicle_id: frontendAssignment.vehicleId,
    driver_id: frontendAssignment.driverId,
    start_date: frontendAssignment.startDate,
    end_date: frontendAssignment.endDate,
    status: frontendAssignment.status,
    notes: frontendAssignment.notes,
    created_at: new Date().toISOString(),
    updated_at: null,
  };
}

/**
 * Maps a database route execution log to the frontend route execution log format
 */
export function mapDatabaseRouteExecutionLogToFrontend(dbLog: RouteExecutionLog): FrontendRouteExecutionLog {
  return {
    id: dbLog.id,
    routeAssignmentId: dbLog.route_assignment_id,
    executionDate: dbLog.execution_date,
    startTime: dbLog.start_time,
    endTime: dbLog.end_time,
    status: dbLog.status,
    delayReason: dbLog.delay_reason,
    notes: dbLog.notes,
  };
}

/**
 * Maps a frontend route execution log to the database route execution log format
 */
export function mapFrontendRouteExecutionLogToDatabase(frontendLog: FrontendRouteExecutionLog): RouteExecutionLog {
  return {
    id: frontendLog.id,
    route_assignment_id: frontendLog.routeAssignmentId,
    execution_date: frontendLog.executionDate,
    start_time: frontendLog.startTime,
    end_time: frontendLog.endTime,
    status: frontendLog.status,
    delay_reason: frontendLog.delayReason,
    notes: frontendLog.notes,
    created_at: new Date().toISOString(),
    updated_at: null,
  };
}
