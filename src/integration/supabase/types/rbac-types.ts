// Role-Based Access Control Types
// These types match the database schema defined in 20250820_role_based_access_control.sql

export interface Module {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  module_id: string;
  action_id: string;
  permission_key: string; // e.g., 'dashboard:view'
  display_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: string;
  granted_by?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_primary: boolean;
  assigned_at: string;
  assigned_by?: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  is_granted: boolean; // true = granted, false = explicitly denied
  granted_at: string;
  granted_by?: string;
  expires_at?: string;
}

// Enhanced types with joined data
export interface PermissionWithDetails extends Permission {
  module: Module;
  action: Action;
}

export interface RoleWithPermissions extends Role {
  permissions: PermissionWithDetails[];
}

export interface UserRoleWithDetails extends UserRole {
  role: Role;
}

export interface UserWithRoles {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  user_roles?: UserRoleWithDetails[];
  primary_role?: Role;
  is_primary_role?: boolean; // Used for role-user listing
}

export interface UserPermissionWithDetails extends UserPermission {
  permission: PermissionWithDetails;
}

export interface UserPermissionSummary {
  user_id: string;
  roles: Role[];
  primary_role?: Role;
  role_permissions: PermissionWithDetails[];
  custom_permissions: UserPermissionWithDetails[];
  effective_permissions: string[]; // Final computed permissions
}

// API request/response types
export interface CreateRoleRequest {
  name: string;
  display_name: string;
  description?: string;
  permission_ids: string[];
}

export interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
  is_primary?: boolean;
}

export interface UpdateUserRolesRequest {
  user_id: string;
  role_ids: string[];
  primary_role_id?: string;
}

export interface UpdateUserPermissionsRequest {
  user_id: string;
  permissions: {
    permission_id: string;
    is_granted: boolean;
    expires_at?: string;
  }[];
}

// Permission checking utilities
export interface PermissionChecker {
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
  canViewModule: (moduleName: string) => boolean;
  canEditModule: (moduleName: string) => boolean;
  canCreateInModule: (moduleName: string) => boolean;
  canDeleteInModule: (moduleName: string) => boolean;
  canAdminModule: (moduleName: string) => boolean;
}
