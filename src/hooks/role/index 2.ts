/**
 * Role module index file
 * Exports all role-related API functions and hooks
 */

// Re-export API functions
export {
  fetchRoles,
  fetchRoleById,
  fetchRoleByName,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions
} from './api';

// Re-export hooks
export {
  useRoles,
  useRole,
  useRoleByName,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions
} from './useRole';
