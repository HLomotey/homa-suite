/**
 * User Profile hooks for Supabase integration
 * These hooks provide data fetching and state management for user and profile data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendUser,
  UserWithProfile,
  UserStatus,
  UserRole,
  UserActivity,
  Profile
} from "../../integration/supabase/types";
// Import from modular files
import * as userApi from "./user-api";
import * as profileApi from "./profile-api";
import * as activityApi from "./activity-api";
import { profileToFrontendUser, UserPreferences } from "./utils";
import { adminUserService } from "../../integration/supabase/admin-client";

/**
 * Hook for fetching all users
 * @returns Object containing users data, loading state, error state, and refetch function
 */
export const useUsers = () => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single user by ID
 * @param id User ID
 * @returns Object containing user data, loading state, error state, and refetch function
 */
export const useUser = (id: string) => {
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await userApi.fetchUserById(id);
      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { user, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a user with their profile information
 * @param id User ID
 * @returns Object containing user with profile data, loading state, error state, and refetch function
 */
export const useUserWithProfile = (id: string) => {
  const [userWithProfile, setUserWithProfile] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.fetchUserWithProfile(id);
      setUserWithProfile(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { userWithProfile, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching users by role
 * @param role User role to filter by
 * @returns Object containing users data, loading state, error state, and refetch function
 */
export const useUsersByRole = (role: UserRole) => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.fetchUsersByRole(role);
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching users by department
 * @param department Department to filter by
 * @returns Object containing users data, loading state, error state, and refetch function
 */
export const useUsersByDepartment = (department: string) => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!department) return;

    try {
      setLoading(true);
      setError(null);
      const data = await userApi.fetchUsersByDepartment(department);
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching users by status
 * @param status User status to filter by
 * @returns Object containing users data, loading state, error state, and refetch function
 */
export const useUsersByStatus = (status: UserStatus) => {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.fetchUsersByStatus(status);
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new user
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateUser = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdUser, setCreatedUser] = useState<FrontendUser | null>(null);

  const create = useCallback(
    async (userData: FrontendUser) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.createUser(userData);
        setCreatedUser(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdUser };
};

/**
 * Hook for updating a user
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateUser = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedUser, setUpdatedUser] = useState<FrontendUser | null>(null);

  const update = useCallback(
    async (
      id: string,
      userData: Partial<Omit<FrontendUser, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.updateUser(id, userData);
        setUpdatedUser(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedUser };
};

/**
 * Hook for deleting a user
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteUser = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First delete from database tables
      await userApi.deleteUser(id);
      
      // Then delete the auth user using admin privileges
      const authDeleteResult = await adminUserService.deleteAuthUser(id);
      
      if (!authDeleteResult.success) {
        console.warn('Failed to delete auth user:', authDeleteResult.error);
        // Don't throw error here as database deletion was successful
      }
      
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error, isDeleted };
};

/**
 * Hook for updating user status
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateUserStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedUser, setUpdatedUser] = useState<FrontendUser | null>(null);

  const updateStatus = useCallback(
    async (id: string, status: UserStatus) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.updateUserStatus(id, status);
        setUpdatedUser(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, error, updatedUser };
};

/**
 * Hook for updating user role
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateUserRole = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedUser, setUpdatedUser] = useState<FrontendUser | null>(null);

  const updateRole = useCallback(
    async (id: string, role: UserRole) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.updateUserRole(id, role);
        setUpdatedUser(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateRole, loading, error, updatedUser };
};

/**
 * Hook for creating or updating a user profile
 * @returns Object containing upsert function, loading state, and error state
 */
export const useUpsertProfile = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const upsert = useCallback(
    async (
      userId: string,
      profileData: Partial<Profile>
    ) => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileApi.upsertProfile(userId, profileData);
        setProfile(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { upsert, loading, error, profile };
};

/**
 * Hook for updating user preferences
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateUserPreferences = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const updatePreferences = useCallback(
    async (userId: string, preferences: UserPreferences) => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileApi.updateUserPreferences(userId, preferences);
        setProfile(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updatePreferences, loading, error, profile };
};

/**
 * Hook for logging user activity
 * @returns Object containing log function, loading state, and error state
 */
export const useLogUserActivity = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);

  const logActivity = useCallback(
    async (activityData: Omit<UserActivity, "id" | "timestamp">) => {
      try {
        setLoading(true);
        setError(null);
        const data = await activityApi.logUserActivity(activityData);
        setActivity(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { logActivity, loading, error, activity };
};

/**
 * Hook for fetching user activities
 * @param userId User ID to fetch activities for
 * @returns Object containing activities data, loading state, error state, and refetch function
 */
export const useUserActivities = (userId: string) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await activityApi.fetchUserActivities(userId);
      setActivities(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activities, loading, error, refetch: fetchData };
};
