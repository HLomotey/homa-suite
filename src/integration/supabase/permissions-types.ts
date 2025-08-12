// Database-driven permissions types
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
  // Joined data
  module?: Module;
  action?: Action;
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
  // Joined data
  permissions?: Permission[];
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: string;
  granted_by?: string;
  // Joined data
  role?: Role;
  permission?: Permission;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  is_granted: boolean; // true = granted, false = explicitly denied
  granted_at: string;
  granted_by?: string;
  expires_at?: string;
  // Joined data
  permission?: Permission;
}

// Frontend-friendly types
export interface PermissionWithDetails extends Permission {
  module: Module;
  action: Action;
}

export interface RoleWithPermissions extends Role {
  permissions: PermissionWithDetails[];
}

export interface UserPermissionSummary {
  user_id: string;
  role: Role;
  role_permissions: PermissionWithDetails[];
  custom_permissions: UserPermission[];
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
  permission_ids?: string[];
}

export interface CreateModuleRequest {
  name: string;
  display_name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateModuleRequest {
  display_name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreatePermissionRequest {
  module_id: string;
  action_id: string;
  display_name?: string;
  description?: string;
}

export interface UpdateUserPermissionsRequest {
  user_id: string;
  permissions: {
    permission_id: string;
    is_granted: boolean;
    expires_at?: string;
  }[];
}

// Permission checking utilities for database-driven system
export interface PermissionChecker {
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
  canViewModule: (moduleName: string) => boolean;
  canEditModule: (moduleName: string) => boolean;
  canCreateInModule: (moduleName: string) => boolean;
  canDeleteInModule: (moduleName: string) => boolean;
}
