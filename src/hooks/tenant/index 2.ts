/**
 * Tenant module index file
 * Exports all tenant-related types, API functions, and hooks
 */

// Re-export types from types/tenant
export type {
  Tenant,
  TenantStatus,
  FrontendTenant,
} from "../../integration/supabase/types/tenant";

export { mapDatabaseTenantToFrontend } from "../../integration/supabase/types/tenant";

// Re-export API functions
export {
  fetchTenants,
  fetchTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  fetchTenantsByStatus,
  fetchTenantsByProperty,
} from "./api";

// Re-export hooks
export {
  useTenants,
  useTenant,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useTenantsByStatus,
  useTenantsByProperty,
} from "./useTenant";