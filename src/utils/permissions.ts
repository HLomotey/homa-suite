// Permission types and utilities for the application
export type Permission = string;

export interface PermissionConfig {
  module: string;
  action: 'view' | 'edit' | 'create' | 'delete';
}

// Parse permission string into module and action
export const parsePermission = (permission: Permission): PermissionConfig => {
  const [module, action] = permission.split(':');
  return {
    module,
    action: action as 'view' | 'edit' | 'create' | 'delete'
  };
};

// Create permission string from module and action
export const createPermission = (module: string, action: 'view' | 'edit' | 'create' | 'delete'): Permission => {
  return `${module}:${action}`;
};

// Check if user has specific permission
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  // Remove role restrictions - grant access to all users
  return true;
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  // Remove role restrictions - grant access to all users
  return true;
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  // Remove role restrictions - grant access to all users
  return true;
};

// Check if user can view a specific module
export const canViewModule = (userPermissions: Permission[], module: string): boolean => {
  return hasPermission(userPermissions, createPermission(module, 'view'));
};

// Check if user can edit a specific module
export const canEditModule = (userPermissions: Permission[], module: string): boolean => {
  return hasPermission(userPermissions, createPermission(module, 'edit'));
};

// Default permissions for different roles
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    // Dashboard
    'dashboard:view', 'dashboard:edit',
    // Properties
    'properties:view', 'properties:edit',
    // Transport
    'transport:view', 'transport:edit',
    // HR
    'hr:view', 'hr:edit',
    // Finance
    'finance:view', 'finance:edit',
    // Operations
    'operations:view', 'operations:edit',
    // Staff
    'staff:view', 'staff:edit',
    // Billing
    'billing:view', 'billing:edit',
    // Users
    'users:view', 'users:edit',
    // Excel Uploads
    'uploads:view', 'uploads:create',
    // Attendance
    'attendance:view', 'attendance:edit',
    // Payroll
    'payroll:view', 'payroll:edit',
    // Settings
    'settings:view', 'settings:edit'
  ],
  manager: [
    // Dashboard
    'dashboard:view',
    // Properties
    'properties:view', 'properties:edit',
    // Transport
    'transport:view', 'transport:edit',
    // HR
    'hr:view', 'hr:edit',
    // Finance
    'finance:view',
    // Operations
    'operations:view', 'operations:edit',
    // Staff
    'staff:view', 'staff:edit',
    // Billing
    'billing:view',
    // Users
    'users:view',
    // Excel Uploads
    'uploads:view', 'uploads:create',
    // Attendance
    'attendance:view', 'attendance:edit',
    // Payroll
    'payroll:view',
    // Settings
    'settings:view'
  ],
  staff: [
    // Dashboard
    'dashboard:view',
    // Properties
    'properties:view',
    // Transport
    'transport:view',
    // HR
    'hr:view',
    // Operations
    'operations:view',
    // Staff
    'staff:view',
    // Excel Uploads
    'uploads:view',
    // Attendance
    'attendance:view',
    // Settings
    'settings:view'
  ],
  guest: [
    // Dashboard
    'dashboard:view',
    // Properties
    'properties:view',
    // Settings
    'settings:view'
  ]
};

// Get permissions for a role
export const getRolePermissions = (role: string): Permission[] => {
  return DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.guest;
};

// Merge role permissions with custom permissions
export const mergePermissions = (rolePermissions: Permission[], customPermissions: Permission[]): Permission[] => {
  const allPermissions = [...rolePermissions, ...customPermissions];
  // Remove duplicates
  return Array.from(new Set(allPermissions));
};
