/**
 * User Profile module index file
 * Exports all user profile-related API functions and hooks
 */

// Re-export API functions
export {
  fetchUsers,
  fetchUserById,
  fetchUserWithProfile,
  fetchUsersByRole,
  fetchUsersByDepartment,
  fetchUsersByStatus,
  createUser,
  updateUser,
  deleteUser,
  upsertProfile,
  updateUserStatus,
  updateUserRole,
  updateUserPreferences,
  logUserActivity,
  fetchUserActivities
} from './api';

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
