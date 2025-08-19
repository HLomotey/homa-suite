import { User } from "@/integration/supabase/types";

/**
 * Check if a user has permission for a specific module and action
 * @param user The user to check permissions for
 * @param module The module to check permission for
 * @param action The specific action to check (optional)
 * @returns Boolean indicating if the user has permission
 */
export function hasPermission(user: User | null, module: string, action?: string): boolean {
  if (!user) return false;
  
  // Check if user has admin role
  if (user.role === 'admin') return true;
  
  // Check user permissions based on their role
  switch (user.role) {
    case 'admin':
      return true;
    case 'staff':
      return hasStaffPermission(module, action);
    case 'tenant':
      return hasTenantPermission(module, action);
    default:
      return false;
  }
}

/**
 * Check if a staff member has permission for a specific module and action
 */
function hasStaffPermission(module: string, action?: string): boolean {
  // Staff-specific permissions
  switch (module) {
    case 'maintenance':
      // Staff can access staff-specific maintenance features
      return action === 'staff' || action === 'view';
    case 'properties':
      return action === 'view';
    default:
      return false;
  }
}

/**
 * Check if a tenant has permission for a specific module and action
 */
function hasTenantPermission(module: string, action?: string): boolean {
  // Tenant-specific permissions
  switch (module) {
    case 'maintenance':
      // Tenants can access tenant-specific maintenance features
      return action === 'tenant' || action === 'view';
    case 'billing':
      return action === 'view';
    default:
      return false;
  }
}
