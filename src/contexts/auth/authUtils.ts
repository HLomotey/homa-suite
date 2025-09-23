/**
 * Authentication Utilities Module
 * Helper functions for role management, permissions, and user data building
 */

import { User, Session } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integration/supabase";
import { getUserModules } from "@/hooks/role/modules-api";
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

/**
 * Gets user role by role ID
 * @param roleId - Role ID to fetch
 * @returns Promise<Role | null> - Role if found, null otherwise
 */
export const getUserRole = async (roleId: string): Promise<Role | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error getting user role:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
};

/**
 * Gets user permissions based on role
 * @param roleId - Role ID to get permissions for
 * @returns Promise<Permission[]> - Array of permissions
 */
export const getUserPermissions = async (roleId: string): Promise<Permission[]> => {
  try {
    // Check if this is an admin role (system role with admin privileges)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("name, is_system_role")
      .eq("id", roleId)
      .single();

    if (roleError) {
      console.error("Error getting role info:", roleError);
      return [];
    }

    // If it's an admin role, return all permissions
    if (
      roleData &&
      ((roleData as any).name === "Admin" || (roleData as any).is_system_role)
    ) {
      const { data: allPermissions, error: permError } = await supabaseAdmin
        .from("permissions")
        .select("id, permission_key, display_name, description")
        .eq("is_active", true);

      if (permError) {
        console.error("Error getting all permissions for admin:", permError);
        return [];
      }

      return allPermissions || [];
    }

    // For non-admin roles, get specific permissions
    const { data, error } = await supabaseAdmin
      .from("role_permissions")
      .select(`
        permissions!inner (
          id,
          permission_key,
          display_name,
          description,
          module_id,
          action_id
        )
      `)
      .eq("role_id", roleId);

    if (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }

    return data?.map((item: any) => item.permissions).filter(Boolean) || [];
  } catch (error) {
    console.error("Error in getUserPermissions:", error);
    return [];
  }
};

/**
 * Builds complete AuthUser object from Supabase user and session
 * @param user - Supabase User object
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
    } catch (error) {
      console.error("AuthUtils: Error getting user modules:", error);
      modules = [];
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
