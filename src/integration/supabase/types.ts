/**
 * Main types aggregation file for Supabase integration
 * This file exports all types from the various type files for easy access
 */

// Re-export database types
export type { Database, Json } from './types/database';

// Re-export user and profile types from consolidated file
export type {
  User,
  Profile,
  UserStatus,
  UserRole,
  FrontendUser,
  UserWithProfile,
  UserPreferences,
  UserActivity
} from './types/user-profile';

// Re-export department types
export type { Department, FrontendDepartment } from './types/department';

// Re-export role types
export type { Role, FrontendRole } from './types/role';

// Re-export property types
export type { 
  Property, 
  PropertyStatus, 
  PropertyType, 
  FrontendProperty 
} from './types/property';

// Re-export room types
export type { 
  Room, 
  RoomStatus, 
  RoomType, 
  FrontendRoom 
} from './types/room';

// Re-export assignment types
export type { 
  Assignment, 
  AssignmentStatus, 
  PaymentStatus, 
  FrontendAssignment 
} from './types/assignment';

// Re-export operations types
export type {
  JobOrder,
  JobOrderStatus,
  RegionPerformance,
  TopPerformer,
  ClientSatisfaction,
  JobOrderTrend,
  TimeToFillTrend,
  JobType,
  FrontendJobOrder,
  FrontendRegionPerformance,
  FrontendTopPerformer,
  FrontendClientSatisfaction,
  FrontendJobOrderTrend,
  FrontendTimeToFillTrend,
  FrontendJobType
} from './types/operations';

// Re-export helper functions
export { 
  mapDatabaseUserToFrontend,
  mapDatabaseProfileToProfile 
} from './types/user-profile';

export { mapDatabaseDepartmentToFrontend } from './types/department';
export { mapDatabaseRoleToFrontend } from './types/role';
export { mapDatabasePropertyToFrontend } from './types/property';
export { mapDatabaseRoomToFrontend } from './types/room';
export { mapDatabaseAssignmentToFrontend } from './types/assignment';
export {
  mapDatabaseJobOrderToFrontend,
  mapDatabaseRegionPerformanceToFrontend,
  mapDatabaseTopPerformerToFrontend,
  mapDatabaseClientSatisfactionToFrontend,
  mapDatabaseJobOrderTrendToFrontend,
  mapDatabaseTimeToFillTrendToFrontend,
  mapDatabaseJobTypeToFrontend
} from './types/operations';


