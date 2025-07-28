/**
 * User Profile API functions for Supabase integration
 * These functions handle direct communication with Supabase for user and profile data
 */

import { supabase } from "../../integration/supabase/client";
import {
  User,
  Profile,
  FrontendUser,
  UserWithProfile,
  UserStatus,
  UserRole,
  UserPreferences,
  UserActivity,
  mapDatabaseUserToFrontend,
  mapDatabaseProfileToProfile
} from "../../integration/supabase/types";

/**
 * Fetch all users from Supabase
 * @returns Promise with array of users
 */
export const fetchUsers = async (): Promise<FrontendUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Fetch a single user by ID
 * @param id User ID
 * @returns Promise with user data
 */
export const fetchUserById = async (
  id: string
): Promise<FrontendUser> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Fetch a user with their profile information
 * @param id User ID
 * @returns Promise with user and profile data
 */
export const fetchUserWithProfile = async (
  id: string
): Promise<UserWithProfile> => {
  // Fetch user
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (userError) {
    console.error(`Error fetching user with ID ${id}:`, userError);
    throw new Error(userError.message);
  }

  const user = mapDatabaseUserToFrontend(userData as User);

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" which is fine - user might not have a profile yet
    console.error(`Error fetching profile for user ${id}:`, profileError);
    throw new Error(profileError.message);
  }

  const profile = profileData 
    ? mapDatabaseProfileToProfile(profileData as Profile)
    : undefined;

  return {
    ...user,
    profile
  };
};

/**
 * Fetch users by role
 * @param role User role to filter by
 * @returns Promise with array of users
 */
export const fetchUsersByRole = async (
  role: UserRole
): Promise<FrontendUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", role)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Fetch users by department
 * @param department Department to filter by
 * @returns Promise with array of users
 */
export const fetchUsersByDepartment = async (
  department: string
): Promise<FrontendUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("department", department)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching users in department ${department}:`, error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Fetch users by status
 * @param status User status to filter by
 * @returns Promise with array of users
 */
export const fetchUsersByStatus = async (
  status: UserStatus
): Promise<FrontendUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("status", status)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching users with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Create a new user
 * @param user User data to create
 * @returns Promise with created user data
 */
export const createUser = async (
  user: Omit<FrontendUser, "id">
): Promise<FrontendUser> => {
  // Convert frontend user to database format
  const dbUser = {
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status,
    last_active: user.lastActive || null,
    permissions: user.permissions || null,
    avatar_url: user.avatar || null
  };

  const { data, error } = await supabase
    .from("users")
    .insert(dbUser)
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Update an existing user
 * @param id User ID
 * @param user User data to update
 * @returns Promise with updated user data
 */
export const updateUser = async (
  id: string,
  user: Partial<Omit<FrontendUser, "id">>
): Promise<FrontendUser> => {
  // Convert frontend user to database format
  const dbUser: any = {};
  
  if (user.name !== undefined) dbUser.name = user.name;
  if (user.email !== undefined) dbUser.email = user.email;
  if (user.role !== undefined) dbUser.role = user.role;
  if (user.department !== undefined) dbUser.department = user.department;
  if (user.status !== undefined) dbUser.status = user.status;
  if (user.lastActive !== undefined) dbUser.last_active = user.lastActive;
  if (user.permissions !== undefined) dbUser.permissions = user.permissions;
  if (user.avatar !== undefined) dbUser.avatar_url = user.avatar;

  const { data, error } = await supabase
    .from("users")
    .update(dbUser)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Delete a user
 * @param id User ID
 * @returns Promise with success status
 */
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Create or update a user profile
 * @param userId User ID
 * @param profile Profile data to create or update
 * @returns Promise with created/updated profile data
 */
export const upsertProfile = async (
  userId: string,
  profile: {
    bio?: string | null;
    preferences?: Record<string, any> | null;
    avatarUrl?: string | null;
  }
): Promise<Profile> => {
  // Convert frontend profile to database format
  const dbProfile = {
    user_id: userId,
    bio: profile.bio,
    preferences: profile.preferences,
    avatar_url: profile.avatarUrl
  };

  // Check if profile already exists
  const { data: existingData, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (checkError) {
    console.error(`Error checking existing profile:`, checkError);
    throw new Error(checkError.message);
  }

  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing profile
    const { data, error } = await supabase
      .from("profiles")
      .update(dbProfile)
      .eq("id", existingData[0].id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating profile:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from("profiles")
      .insert(dbProfile)
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating profile:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  }

  return result as Profile;
};

/**
 * Update user status
 * @param id User ID
 * @param status New user status
 * @returns Promise with updated user data
 */
export const updateUserStatus = async (
  id: string,
  status: UserStatus
): Promise<FrontendUser> => {
  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Update user role
 * @param id User ID
 * @param role New user role
 * @returns Promise with updated user data
 */
export const updateUserRole = async (
  id: string,
  role: UserRole
): Promise<FrontendUser> => {
  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating role for user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Update user preferences
 * @param userId User ID
 * @param preferences User preferences to update
 * @returns Promise with updated profile data
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: UserPreferences
): Promise<Profile> => {
  // Check if profile already exists
  const { data: existingData, error: checkError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1);

  if (checkError) {
    console.error(`Error checking existing profile:`, checkError);
    throw new Error(checkError.message);
  }

  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing profile preferences
    const currentPreferences = existingData[0].preferences || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    const { data, error } = await supabase
      .from("profiles")
      .update({ preferences: updatedPreferences })
      .eq("id", existingData[0].id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating preferences:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  } else {
    // Create new profile with preferences
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        preferences
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating profile with preferences:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  }

  return result as Profile;
};

/**
 * Log user activity
 * @param activity User activity data to log
 * @returns Promise with created activity data
 */
export const logUserActivity = async (
  activity: Omit<UserActivity, "id" | "timestamp">
): Promise<UserActivity> => {
  const dbActivity = {
    user_id: activity.userId,
    action: activity.action,
    details: activity.details || {},
    ip: activity.ip,
    user_agent: activity.userAgent
  };

  const { data, error } = await supabase
    .from("user_activities")
    .insert(dbActivity)
    .select()
    .single();

  if (error) {
    console.error(`Error logging user activity:`, error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    action: data.action,
    details: data.details,
    timestamp: data.created_at,
    ip: data.ip,
    userAgent: data.user_agent
  };
};

/**
 * Fetch user activities for a specific user
 * @param userId User ID
 * @returns Promise with array of user activities
 */
export const fetchUserActivities = async (
  userId: string
): Promise<UserActivity[]> => {
  const { data, error } = await supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching activities for user ${userId}:`, error);
    throw new Error(error.message);
  }

  return (data || []).map(activity => ({
    id: activity.id,
    userId: activity.user_id,
    action: activity.action,
    details: activity.details,
    timestamp: activity.created_at,
    ip: activity.ip,
    userAgent: activity.user_agent
  }));
};
