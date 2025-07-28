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

// Re-export helper functions
export { 
  mapDatabaseUserToFrontend,
  mapDatabaseProfileToProfile 
} from './types/user-profile';

export { mapDatabaseDepartmentToFrontend } from './types/department';
export { mapDatabaseRoleToFrontend } from './types/role';


