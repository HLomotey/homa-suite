/**
 * Clean User Profile API functions for Supabase integration
 * Simplified version that works with current database schema (profiles table only)
 */

import { supabase } from "../../integration/supabase/client";
import { supabaseAdmin } from "../../integration/supabase/admin-client";
import {
  FrontendUser,
  Profile,
  UserRole,
  UserWithProfile,
  UserStatus,
  mapDatabaseProfileToProfile
} from "../../integration/supabase/types";

/**
 * Convert Profile data to FrontendUser format
 */
const profileToFrontendUser = (profile: Profile): FrontendUser => ({
  id: profile.id,
  name: profile.full_name || profile.email.split('@')[0],
  email: profile.email,
  role: (profile.role_id ? 'admin' : 'staff') as UserRole,
  department: '', // Not available in current schema
  status: (profile.status === 'active' ? 'active' : profile.status === 'inactive' ? 'inactive' : 'pending') as UserStatus,
  lastActive: undefined,
  permissions: [],
  createdAt: profile.created_at
});

/**
 * Fetch all users from profiles table
 */
export const fetchUsers = async (): Promise<FrontendUser[]> => {
  console.log('🔍 Fetching users from profiles table...', new Date().toISOString());
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('🔐 Auth status:', { user: user?.email || 'Not authenticated', authError });
  
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("email", { ascending: true });

  console.log('📋 Profiles query result:', { 
    count: profilesData?.length || 0, 
    error: profilesError 
  });

  if (profilesError) {
    console.error("❌ Error fetching profiles:", profilesError);
    return [];
  }

  if (profilesData && profilesData.length > 0) {
    console.log(`✅ Found ${profilesData.length} profiles`);
    return profilesData.map(profileToFrontendUser);
  }

  console.log('⚠️ No profiles found');
  return [];
};

/**
 * Fetch a single user by ID from profiles table
 */
export const fetchUserById = async (id: string): Promise<FrontendUser> => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return profileToFrontendUser(data as Profile);
};

/**
 * Fetch a user with their profile information
 */
export const fetchUserWithProfile = async (id: string): Promise<UserWithProfile> => {
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError) {
    console.error(`Error fetching profile with ID ${id}:`, profileError);
    throw new Error(profileError.message);
  }

  const user = profileToFrontendUser(profileData as Profile);
  const profile = mapDatabaseProfileToProfile(profileData as Profile);

  return {
    ...user,
    profile
  };
};

/**
 * Create or update user profile
 */
export const upsertProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile> => {
  console.log('🔄 Upserting profile for user:', userId);

  // Check if profile exists
  const { data: existingData, error: checkError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error("Error checking existing profile:", checkError);
    throw new Error(checkError.message);
  }

  const profilePayload = {
    id: userId,
    user_id: userId,
    email: profileData.email || '',
    full_name: profileData.full_name || '',
    phone: profileData.phone || '',
    avatar_url: profileData.avatar_url || '',
    status: profileData.status || 'active',
    role_id: profileData.role_id || null,
    updated_at: new Date().toISOString()
  };

  if (existingData) {
    // Update existing profile
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(profilePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error(error.message);
    }

    console.log('✅ Profile updated successfully');
    return data as Profile;
  } else {
    // Create new profile
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        ...profilePayload,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw new Error(error.message);
    }

    console.log('✅ Profile created successfully');
    return data as Profile;
  }
};

/**
 * Fetch users by role
 */
export const fetchUsersByRole = async (role: UserRole): Promise<FrontendUser[]> => {
  console.log('🔍 Fetching users by role:', role);
  
  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role_id", role === 'admin' ? "1" : null)
    .order("email", { ascending: true });

  if (error) {
    console.error("❌ Error fetching users by role:", error);
    return [];
  }

  return profilesData?.map(profileToFrontendUser) || [];
};

/**
 * Fetch users by department (placeholder - department not in current schema)
 */
export const fetchUsersByDepartment = async (department: string): Promise<FrontendUser[]> => {
  console.log('🔍 Fetching users by department:', department);
  // Department filtering not available in current schema
  return fetchUsers();
};

/**
 * Fetch users by status
 */
export const fetchUsersByStatus = async (status: UserStatus): Promise<FrontendUser[]> => {
  console.log('🔍 Fetching users by status:', status);
  
  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", status)
    .order("email", { ascending: true });

  if (error) {
    console.error("❌ Error fetching users by status:", error);
    return [];
  }

  return profilesData?.map(profileToFrontendUser) || [];
};

/**
 * Create user (placeholder)
 */
export const createUser = async (userData: Partial<FrontendUser>): Promise<FrontendUser> => {
  throw new Error("createUser not implemented - use Supabase Auth signup");
};

/**
 * Delete user (placeholder)
 */
export const deleteUser = async (id: string): Promise<void> => {
  throw new Error("deleteUser not implemented - use Supabase Auth admin");
};

/**
 * Update user status
 */
export const updateUserStatus = async (id: string, status: UserStatus): Promise<FrontendUser> => {
  return updateUser(id, { status });
};

/**
 * Update user role
 */
export const updateUserRole = async (id: string, role: UserRole): Promise<FrontendUser> => {
  return updateUser(id, { role });
};

/**
 * Update user preferences (placeholder)
 */
export const updateUserPreferences = async (id: string, preferences: any): Promise<void> => {
  console.log('updateUserPreferences not implemented');
};

/**
 * Log user activity (placeholder)
 */
export const logUserActivity = async (userId: string, activity: any): Promise<void> => {
  console.log('logUserActivity not implemented');
};

/**
 * Fetch user activities (placeholder)
 */
export const fetchUserActivities = async (userId: string): Promise<any[]> => {
  console.log('fetchUserActivities not implemented');
  return [];
};

/**
 * Update user profile
 */
export const updateUser = async (
  id: string,
  updates: Partial<FrontendUser>
): Promise<FrontendUser> => {
  const profileUpdates: Partial<Profile> = {
    full_name: updates.name,
    email: updates.email,
    status: updates.status,
    updated_at: new Date().toISOString()
  };

  const updatedProfile = await upsertProfile(id, profileUpdates);
  return profileToFrontendUser(updatedProfile);
};
