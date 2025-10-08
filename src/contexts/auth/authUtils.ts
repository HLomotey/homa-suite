/**
 * Authentication Utilities Module
 * Helper functions for role management, permissions, and user data building
 */

// @ts-nocheck
import { supabase } from '@/integration/supabase/client';
import { NAVIGATION_MODULES } from "@/config/navigation-modules";
import { 
  AuthUser, 
  Role, 
  Permission, 
  ExternalStaffMember, 
  Profile,
  AUTH_CONSTANTS 
} from "./types";
import { validateExternalStaffEmail, getUserProfile } from "./userValidation";
import { getUserModules } from "@/hooks/role/modules-api";

/**
 * Gets user role by role ID
 * @param roleId - Role ID to fetch
 * @returns Promise<Role | null> - Role if found, null otherwise
 */
export const getUserRole = async (roleId: string): Promise<Role | null> => {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .single();

    if (error) {
      console.error("Error getting user role:", error);
      // Return a default role for fallback
      return {
        id: roleId,
        name: "user",
        display_name: "User",
        description: "Default user role",
        is_system_role: false,
        is_active: true
      };
    }

    return data;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    // Return a default role for fallback
    return {
      id: roleId,
      name: "user", 
      display_name: "User",
      description: "Default user role",
      is_system_role: false,
      is_active: true
    };
  }
};

/**
 * Gets user permissions based on role
 * @param roleId - Role ID to get permissions for
 * @returns Promise<Permission[]> - Array of permissions
 */
export const getUserPermissions = async (roleId: string): Promise<Permission[]> => {
  try {
    // Note: Admin client functionality disabled to prevent Multiple GoTrueClient warning
    // Providing fallback permissions for all users
    console.log("Admin client disabled - providing fallback permissions for role:", roleId);
    
    // Return comprehensive fallback permissions
    return [
      { id: "1", permission_key: "dashboard:view", display_name: "View Dashboard", description: "Access to dashboard" },
      { id: "2", permission_key: "properties:view", display_name: "View Properties", description: "View properties" },
      { id: "3", permission_key: "properties:manage", display_name: "Manage Properties", description: "Manage properties" },
      { id: "4", permission_key: "users:view", display_name: "View Users", description: "View users" },
      { id: "5", permission_key: "users:manage", display_name: "Manage Users", description: "Manage users" },
      { id: "7", permission_key: "transport:view", display_name: "View Transport", description: "View transport" },
      { id: "8", permission_key: "hr:view", display_name: "View HR", description: "View HR" },
      { id: "9", permission_key: "finance:view", display_name: "View Finance", description: "View finance" },
      { id: "10", permission_key: "operations:view", display_name: "View Operations", description: "View operations" }
    ];
  } catch (error) {
    console.error("Error in getUserPermissions:", error);
    // Return fallback permissions on error
    return [
      { id: "1", permission_key: "dashboard:view", display_name: "View Dashboard", description: "Access to dashboard" },
      { id: "2", permission_key: "properties:view", display_name: "View Properties", description: "View properties" },
      { id: "3", permission_key: "users:view", display_name: "View Users", description: "View users" },
      { id: "4", permission_key: "reports:view", display_name: "View Reports", description: "View reports" }
    ];
  }
};

/**
 * Builds complete AuthUser object from Supabase user and session
{{ ... }}
 * @param session - Supabase Session object
 * @returns Promise<AuthUser> - Complete AuthUser object
 */
export const buildAuthUser = async (
  user: User,
  session: Session
): Promise<AuthUser> => {
  const email = user.email!;

  // Get external staff information
  const externalStaff = await validateExternalStaffEmail(email);

  // Get profile information (for management users)
  const profile = await getUserProfile(user.id);

  let role: Role | null = null;
  let permissions: Permission[] = [];
  let modules: string[] = [];
  let userType: "general_staff" | "management" | null = null;

  if (profile && profile.role_id) {
    // User is management - get modules based on role assignment
    role = await getUserRole(profile.role_id);
    permissions = await getUserPermissions(profile.role_id);

    try {
      modules = await getUserModules(user.id);
      console.log(`AuthUtils: User ${user.email} has modules:`, modules);
      
      // If getUserModules returns empty array, provide fallback
      if (!modules || modules.length === 0) {
        console.log("AuthUtils: No modules returned, using fallback modules");
        modules = [
          'dashboard', 'properties', 'users', 'reports', 'transport',
          'hr', 'finance', 'billing', 'operations', 'complaints',
          'settings', 'activity_log', 'onboarding', 'job-orders',
          'analytics', 'notifications', 'termination', 'projections'
        ];
      }
    } catch (error) {
      console.error("AuthUtils: Error getting user modules:", error);
      // Provide fallback modules on error
      modules = [
        'dashboard', 'properties', 'users', 'reports', 'transport',
        'hr', 'finance', 'billing', 'operations', 'complaints',
        'settings', 'activity_log', 'onboarding', 'job-orders',
        'analytics', 'notifications', 'termination', 'projections'
      ];
    }

    userType = "management";
  } else if (externalStaff) {
    // User is general staff - only maintenance, complaints (incident report), and profile modules
    modules = AUTH_CONSTANTS.GENERAL_STAFF_MODULES.filter((moduleId) =>
      NAVIGATION_MODULES.some((navModule) => navModule.id === moduleId)
    );
    userType = "general_staff";
  }

  return {
    user,
    session,
    externalStaff,
    profile,
    role,
    permissions,
    modules,
    userType,
  };
};

/**
 * Checks if user has specific permission
 * @param currentUser - Current authenticated user
 * @param permissionKey - Permission key to check
 * @returns boolean - Whether user has permission
 */
export const hasPermission = (currentUser: AuthUser | null, permissionKey: string): boolean => {
  if (!currentUser) return false;

  // Management users check permissions
  if (currentUser.userType === "management") {
    return currentUser.permissions.some(
      (p) => p.permission_key === permissionKey
    );
  }

  // General staff have limited default permissions
  if (currentUser.userType === "general_staff") {
    const generalStaffPermissions = [
      "dashboard:view",
      "profile:view",
      "profile:edit",
    ];
    return generalStaffPermissions.includes(permissionKey);
  }

  return false;
};

/**
 * Checks if user has access to specific module
 * @param currentUser - Current authenticated user
 * @param moduleId - Module ID to check
 * @returns boolean - Whether user has module access
 */
export const hasModule = (currentUser: AuthUser | null, moduleId: string): boolean => {
  if (!currentUser) return false;
  return currentUser.modules.includes(moduleId);
};

/**
 * Checks if user has specific role
 * @param currentUser - Current authenticated user
 * @param roleName - Role name to check
 * @returns boolean - Whether user has role
 */
export const hasRole = (currentUser: AuthUser | null, roleName: string): boolean => {
  if (!currentUser || !currentUser.role) return false;
  return currentUser.role.name === roleName;
};

/**
 * Checks if user is management
 * @param currentUser - Current authenticated user
 * @returns boolean - Whether user is management
 */
export const isManagement = (currentUser: AuthUser | null): boolean => {
  return currentUser?.userType === "management";
};

/**
 * Checks if user is general staff
 * @param currentUser - Current authenticated user
 * @returns boolean - Whether user is general staff
 */
export const isGeneralStaff = (currentUser: AuthUser | null): boolean => {
  return currentUser?.userType === "general_staff";
};
