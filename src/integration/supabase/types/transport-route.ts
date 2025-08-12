export interface DatabaseRoute {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRouteSchedule {
  id: string;
  route_id: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
  created_at: string;
  updated_at: string;
}

export interface DatabaseCombinedRoute {
  id: string;
  name: string;
  description?: string;
  created_by: string; // User ID of the manager who created it
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
}

export interface DatabaseCombinedRouteDetail {
  id: string;
  combined_route_id: string;
  route_id: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRouteAssignment {
  id: string;
  combined_route_id: string;
  vehicle_id: string;
  driver_id: string; // User ID of the driver
  start_date: string;
  end_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRouteExecutionLog {
  id: string;
  route_assignment_id: string;
  execution_date: string;
  start_time: string;
  end_time?: string;
  status: 'started' | 'completed' | 'delayed' | 'cancelled';
  delay_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Frontend types with more user-friendly structure
export interface FrontendRoute {
  id: string;
  name: string;
  description: string;
  schedules: FrontendRouteSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface FrontendRouteSchedule {
  id: string;
  routeId: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
}

export interface FrontendCombinedRoute {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  status: 'active' | 'inactive';
  routes: FrontendCombinedRouteDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface FrontendCombinedRouteDetail {
  id: string;
  combinedRouteId: string;
  routeId: string;
  routeName: string;
  order: number;
  schedules?: FrontendRouteSchedule[];
}

export interface FrontendRouteAssignment {
  id: string;
  combinedRouteId?: string;
  combinedRouteName?: string;
  routeId?: string;
  routeName?: string;
  vehicleId: string;
  vehicleInfo?: string; // e.g., "Toyota Hiace (ABC123)"
  driverId: string;
  driverName?: string;
  startDate: string;
  endDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  executionLogs?: FrontendRouteExecutionLog[];
}

export interface FrontendRouteExecutionLog {
  id: string;
  routeAssignmentId: string;
  executionDate: string;
  startTime: string;
  endTime?: string;
  status: 'started' | 'completed' | 'delayed' | 'cancelled';
  delayReason?: string;
  notes: string;
}

// Mapping functions
export function mapDatabaseRouteToFrontend(dbRoute: DatabaseRoute, schedules: DatabaseRouteSchedule[] = []): FrontendRoute {
  return {
    id: dbRoute.id,
    name: dbRoute.name,
    description: dbRoute.description || '',
    schedules: schedules.map(mapDatabaseRouteScheduleToFrontend),
    createdAt: dbRoute.created_at,
    updatedAt: dbRoute.updated_at
  };
}

export function mapDatabaseRouteScheduleToFrontend(dbSchedule: DatabaseRouteSchedule): FrontendRouteSchedule {
  return {
    id: dbSchedule.id,
    routeId: dbSchedule.route_id,
    day: dbSchedule.day,
    startTime: dbSchedule.start_time,
    endTime: dbSchedule.end_time
  };
}

export function mapFrontendRouteToDatabaseRoute(frontendRoute: FrontendRoute): Omit<DatabaseRoute, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: frontendRoute.name,
    description: frontendRoute.description
  };
}

export function mapFrontendRouteScheduleToDatabaseRouteSchedule(
  frontendSchedule: FrontendRouteSchedule
): Omit<DatabaseRouteSchedule, 'id' | 'created_at' | 'updated_at'> {
  return {
    route_id: frontendSchedule.routeId,
    day: frontendSchedule.day,
    start_time: frontendSchedule.startTime,
    end_time: frontendSchedule.endTime
  };
}

export function mapDatabaseCombinedRouteToFrontend(
  dbCombinedRoute: DatabaseCombinedRoute, 
  details: (DatabaseCombinedRouteDetail & { route_name: string })[] = []
): FrontendCombinedRoute {
  return {
    id: dbCombinedRoute.id,
    name: dbCombinedRoute.name,
    description: dbCombinedRoute.description || '',
    createdBy: dbCombinedRoute.created_by,
    status: dbCombinedRoute.status,
    routes: details.map(detail => ({
      id: detail.id,
      combinedRouteId: detail.combined_route_id,
      routeId: detail.route_id,
      routeName: detail.route_name,
      order: detail.order
    })),
    createdAt: dbCombinedRoute.created_at,
    updatedAt: dbCombinedRoute.updated_at
  };
}

export function mapFrontendCombinedRouteToDatabaseCombinedRoute(
  frontendCombinedRoute: FrontendCombinedRoute
): Omit<DatabaseCombinedRoute, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: frontendCombinedRoute.name,
    description: frontendCombinedRoute.description,
    created_by: frontendCombinedRoute.createdBy,
    status: frontendCombinedRoute.status
  };
}

export function mapFrontendCombinedRouteDetailToDatabaseCombinedRouteDetail(
  detail: FrontendCombinedRouteDetail
): Omit<DatabaseCombinedRouteDetail, 'id' | 'created_at' | 'updated_at'> {
  return {
    combined_route_id: detail.combinedRouteId,
    route_id: detail.routeId,
    order: detail.order
  };
}

export function mapDatabaseRouteAssignmentToFrontend(
  dbAssignment: DatabaseRouteAssignment & { 
    combined_route_name?: string;
    vehicle_info?: string;
    driver_name?: string;
  }
): FrontendRouteAssignment {
  return {
    id: dbAssignment.id,
    combinedRouteId: dbAssignment.combined_route_id,
    combinedRouteName: dbAssignment.combined_route_name || '',
    vehicleId: dbAssignment.vehicle_id,
    vehicleInfo: dbAssignment.vehicle_info,
    driverId: dbAssignment.driver_id,
    driverName: dbAssignment.driver_name,
    startDate: dbAssignment.start_date,
    endDate: dbAssignment.end_date || undefined,
    status: dbAssignment.status,
    notes: dbAssignment.notes || ''
  };
}

export function mapFrontendRouteAssignmentToDatabaseRouteAssignment(
  frontendAssignment: FrontendRouteAssignment
): Omit<DatabaseRouteAssignment, 'id' | 'created_at' | 'updated_at'> {
  return {
    combined_route_id: frontendAssignment.combinedRouteId,
    vehicle_id: frontendAssignment.vehicleId,
    driver_id: frontendAssignment.driverId,
    start_date: frontendAssignment.startDate,
    end_date: frontendAssignment.endDate,
    status: frontendAssignment.status,
    notes: frontendAssignment.notes
  };
}

export function mapDatabaseRouteExecutionLogToFrontend(
  dbLog: DatabaseRouteExecutionLog
): FrontendRouteExecutionLog {
  return {
    id: dbLog.id,
    routeAssignmentId: dbLog.route_assignment_id,
    executionDate: dbLog.execution_date,
    startTime: dbLog.start_time,
    endTime: dbLog.end_time || undefined,
    status: dbLog.status,
    delayReason: dbLog.delay_reason || undefined,
    notes: dbLog.notes || ''
  };
}

export function mapFrontendRouteExecutionLogToDatabaseRouteExecutionLog(
  frontendLog: FrontendRouteExecutionLog
): Omit<DatabaseRouteExecutionLog, 'id' | 'created_at' | 'updated_at'> {
  return {
    route_assignment_id: frontendLog.routeAssignmentId,
    execution_date: frontendLog.executionDate,
    start_time: frontendLog.startTime,
    end_time: frontendLog.endTime,
    status: frontendLog.status,
    delay_reason: frontendLog.delayReason,
    notes: frontendLog.notes
  };
}
