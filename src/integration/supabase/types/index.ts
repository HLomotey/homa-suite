/**
 * Modular Database Types Index
 * This file exports all database types from their respective modules
 */

// Core database types
export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums } from './database';

// Complaint management types
export type * from './complaints';
export type * from './complaintCategory';

// HR and staff types
export type * from './hr';
export type { User, Profile, FrontendUser, UserWithProfile, UserPreferences, UserStatus } from './user-profile';
export type { Role, Permission, UserRole as RBACUserRole, RolePermission } from './rbac-types';

// Property and asset types
export type * from './property';
export type { Vehicle as DatabaseVehicle, VehicleStatus as DatabaseVehicleStatus } from './vehicle';
export type * from './transport';

// Operations types
export type * from './operations';
export type * from './operations-call';
export type { MaintenanceCategory as DatabaseMaintenanceCategory } from './maintenance';
export type * from './maintenance-type';

// Finance types
export type { TransactionType as DatabaseTransactionType } from './finance';
export type * from './staff-benefits';

// Inventory types
export type * from './inventory';

// Utility types
export type * from './utility';
export type * from './notifications';

// Base types
export type * from './base';
export type * from './department';
export type * from './location';
export type * from './staffLocation';

// Assignment and routing types
export type * from './assignment';

// Attendance and tracking types
export type * from './attendance';
export type * from './staffTransactionLog';

// Tenant and room types
export type * from './tenant';
export type * from './room';

// Reporting types
export type * from './month-end-reports';
export type * from './click-logs';

// Re-export commonly used types for convenience
export type {
  // Complaint types
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintAssetType,
  FrontendComplaint,
  ComplaintCategory,
  ComplaintSubcategory,
  ComplaintComment,
  ComplaintAttachment,
  ComplaintHistory,
  ComplaintRoutingRule,
  ComplaintSLA,
} from './complaints';

export type {
  // External staff types
  ExternalStaff,
  FrontendExternalStaff,
  CreateExternalStaff,
  UpdateExternalStaff,
} from './external-staff';

export type {
  // Base types
  BaseUser,
  BaseDepartment,
} from './base';
