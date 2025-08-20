/**
 * User Profile API functions for Supabase integration
 * These functions handle direct communication with Supabase for user and profile data
 */

import { supabase } from "../../integration/supabase/client";
import { supabaseAdmin } from "../../integration/supabase/admin-client";
import {
  FrontendUser,
  User,
  Profile,
  UserRole,
  UserWithProfile,
  UserStatus,
  UserPreferences,
  UserActivity,
  mapDatabaseUserToFrontend,
  mapDatabaseProfileToProfile
} from "../../integration/supabase/types";
// Omit is a TypeScript built-in utility type, no need to import

/**
 * Fetch all users from Supabase
 * @returns Promise with array of users
 */
export const fetchUsers = async (): Promise<FrontendUser[]> => {
  console.log('🔍 [UPDATED API] Fetching users from database...', new Date().toISOString());
  
  // Check authentication status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('🔐 Auth status for users:', { user: user?.email || 'Not authenticated', authError });
  
  // Try to fetch from users table first
  const { data: usersData, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("email", { ascending: true });

  console.log('👥 Users table query result:', { 
    count: usersData?.length || 0, 
    data: usersData, 
    error: usersError 
  });

  // Also try to fetch from profiles table
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("email", { ascending: true });

  console.log('📋 Profiles table query result:', { 
    count: profilesData?.length || 0, 
    data: profilesData, 
    error: profilesError 
  });

  // If we have users data, use it
  if (usersData && usersData.length > 0) {
    console.log(`✅ Found ${usersData.length} users from users table`);
    return (usersData as User[]).map(mapDatabaseUserToFrontend);
  }

  // If we have profiles data, use it
  if (profilesData && profilesData.length > 0) {
    console.log(`✅ Found ${profilesData.length} profiles from profiles table`);
    return (profilesData as Profile[]).map(profile => ({
      id: profile.id,
      name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email.split('@')[0],
      email: profile.email,
      role: 'staff' as UserRole, // Default role since profiles table doesn't have role
      department: profile.department || '',
      status: profile.status === 'active' ? 'active' : profile.status === 'inactive' ? 'inactive' : 'pending',
      lastActive: undefined,
      permissions: [],
      createdAt: profile.created_at
    }));
  }

  // If both queries failed, log errors
  if (usersError) {
    console.error("❌ Error fetching users:", usersError);
  }
  if (profilesError) {
    console.error("❌ Error fetching profiles:", profilesError);
  }

  console.log('⚠️ No data found in users or profiles tables');
  return [];
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
  role?: UserRole | null
): Promise<FrontendUser[]> => {
  // If role is null or undefined, fetch all users instead of filtering by role
  let query = supabase
    .from("users")
    .select("*")
    .order("email", { ascending: true }); // Using email instead of name which doesn't exist
  
  // Only apply role filter if role is provided and not null
  if (role) {
    query = query.eq("role", role);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching users with role ${role || 'all'}:`, error);
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
  // Join with profiles table to filter by department since department is in profiles, not users
  const { data, error } = await supabase
    .from("users")
    .select("*, profiles!inner(department)")
    .eq("profiles.department", department)
    .order("email", { ascending: true });

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
  // Use is_active instead of status since status doesn't exist in users table
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("is_active", status === 'active' ? true : false)
    .order("email", { ascending: true });

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
  user: FrontendUser
): Promise<FrontendUser> => {
  // Convert frontend user to database format for public.users table
  const dbUser = {
    id: user.id, // Use the provided user ID (from auth)
    email: user.email,
    role: user.role || 'staff',
    is_active: user.status === 'active',
    last_login: user.lastActive || null,
    name: user.name || '',
    department: user.department || null
  };

  // Create the user record in public.users
  const { data, error } = await supabase
    .from("users")
    .insert(dbUser)
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message);
  }
  
  // Create the profile record in public.profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.id, // Use id as primary key that references auth.users(id)
      email: user.email,
      full_name: user.name || '',
      role_id: user.roleId || null,
      status: user.status || 'active'
    });
    
  if (profileError) {
    console.error("Error creating user profile:", profileError);
    // Don't throw here, as the user was created successfully
    // Just log the error and continue
  }

  // If user has a role, assign it in user_roles table
  if (user.roleId) {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: data.id,
        role_id: user.roleId,
        is_primary: true
      });
      
    if (roleError) {
      console.error("Error assigning user role:", roleError);
      // Don't throw here, just log the error
    }
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
  // Convert frontend user to database format - only use columns that exist in users table
  const dbUser: any = {};
  
  // Fields that go in the users table
  if (user.email !== undefined) dbUser.email = user.email;
  if (user.role !== undefined) dbUser.role = user.role;
  if (user.status !== undefined) dbUser.is_active = user.status === 'active';
  if (user.lastActive !== undefined) dbUser.last_login = user.lastActive;
  if (user.department !== undefined) dbUser.department = user.department;
  if (user.permissions !== undefined) dbUser.permissions = user.permissions;
  
  // Extract profile-related fields
  const profileUpdate: any = {};
  let hasProfileUpdates = false;

  if (user.name !== undefined) {
    profileUpdate.first_name = user.name.split(' ')[0] || '';
    profileUpdate.last_name = user.name.split(' ').slice(1).join(' ') || '';
    hasProfileUpdates = true;
  }
  if (user.bio !== undefined) {
    profileUpdate.bio = user.bio;
    hasProfileUpdates = true;
  }
  if (user.avatar !== undefined) {
    profileUpdate.avatar_url = user.avatar;
    hasProfileUpdates = true;
  }

  // Update profile table - only update fields that are provided
  const profileUpdates: any = {};
  if (user.name !== undefined) profileUpdates.full_name = user.name;
  if (user.department !== undefined) profileUpdates.department = user.department;
  if (user.status !== undefined) profileUpdates.status = user.status;
  profileUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(profileUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating user profile with ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  // Update profile if we have profile updates
  if (hasProfileUpdates) {
    // Check if profile exists
    const { data: profileData, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", id)
      .limit(1);
      
    if (profileCheckError) {
      console.error(`Error checking profile for user ${id}:`, profileCheckError);
      // Don't throw, just log the error
    } else {
      if (profileData && profileData.length > 0) {
        // Update existing profile
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", id);
          
        if (updateError) {
          console.error(`Error updating profile for user ${id}:`, updateError);
          // Don't throw, just log the error
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({ ...profileUpdate, id: id, user_id: id });
          
        if (insertError) {
          console.error(`Error creating profile for user ${id}:`, insertError);
          // Don't throw, just log the error
        }
      }
    }
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
  // Convert frontend profile to database format - only include fields that exist in the table
  const dbProfile: any = {
    user_id: userId
  };
  
  // Only add avatar_url if provided (bio doesn't exist in profiles table)
  if (profile.avatarUrl !== undefined) {
    dbProfile.avatar_url = profile.avatarUrl;
  }

  // Check if profile already exists
  const { data: existingData, error: checkError } = await supabaseAdmin
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
    // Update existing profile using admin client
    const { data, error } = await supabaseAdmin
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
    // Create new profile using admin client
    const { data, error } = await supabaseAdmin
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
  // Convert status to is_active boolean since status column doesn't exist
  const is_active = status === 'active';
  
  const { data, error } = await supabase
    .from("users")
    .update({ is_active })
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
