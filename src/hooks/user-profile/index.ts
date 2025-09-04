/**
 * User Profile module index file
 * Exports all user profile-related API functions and hooks
 */

// Re-export User API functions
export {
  fetchUsers,
  fetchUserById,
  fetchUsersByRole,
  fetchUsersByDepartment,
  fetchUsersByStatus,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole
} from './user-api';

// Re-export Profile API functions
export {
  fetchUserWithProfile,
  upsertProfile,
  updateUserPreferences
} from './profile-api';

// Re-export Activity API functions
export {
  logUserActivity,
  fetchUserActivities
} from './activity-api';

// Re-export types and utilities
export type { UserActivity, UserPreferences } from './utils';
export { profileToFrontendUser } from './utils';

// Re-export hooks
export {
  useUsers,
  useUser,
  useUserWithProfile,
  useUsersByRole,
  useUsersByDepartment,
  useUsersByStatus,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
  useUpdateUserRole,
  useUpsertProfile,
  useUpdateUserPreferences,
  useLogUserActivity,
  useUserActivities
} from './useUserProfile';

// Re-export enhanced user hooks
export {
  useEnhancedUsers
} from './useEnhancedUsers';
