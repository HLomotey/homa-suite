import { User } from "@/integration/supabase/types";

/**
 * Check if a user has permission for a specific module and action
 * @param user The user to check permissions for
 * @param module The module to check permission for
 * @param action The specific action to check (optional)
 * @returns Boolean indicating if the user has permission
 */
export function hasPermission(user: User | null, module: string, action?: string): boolean {
  // Remove all role restrictions - grant access to all users
  return true;
}

/**
 * Check if a staff member has permission for a specific module and action
 * Role restrictions removed - all users have access
 */
function hasStaffPermission(module: string, action?: string): boolean {
  return true;
}

/**
 * Check if a tenant has permission for a specific module and action
 * Role restrictions removed - all users have access
 */
function hasTenantPermission(module: string, action?: string): boolean {
  return true;
}
