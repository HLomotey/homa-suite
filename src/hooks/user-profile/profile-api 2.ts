/**
 * Profile Management API
 * Handles user profile operations
 */

import { supabase } from "../../integration/supabase/client";
import { supabaseAdmin } from "../../integration/supabase/admin-client";
import {
  FrontendUser,
  Profile,
  User,
  UserPreferences,
  mapDatabaseProfileToProfile,
} from "../../integration/supabase/types";
import { typedSupabaseQuery, safeTypeCast } from "./supabase-helpers";
import { profileToFrontendUser } from "./utils";

// Import UserWithProfile from types file instead of redefining
import { UserWithProfile } from "../../integration/supabase/types";


/**
 * Fetch a user with their profile information
 */
export const fetchUserWithProfile = async (
  id: string
): Promise<UserWithProfile> => {
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single() as { data: any, error: any };

  if (profileError) {
    console.error(`Error fetching profile with ID ${id}:`, profileError);
    throw new Error(profileError.message);
  }

  const user = profileToFrontendUser(profileData as Profile);
  const profile = mapDatabaseProfileToProfile(profileData as Profile);

  // Create a UserWithProfile object with the correct structure
  return {
    ...user,
    profile: {
      bio: profile.bio,
      preferences: null,
      avatarUrl: profile.avatarUrl
    }
  };
};

/**
 * Create or update a user profile
 * @param userId User ID
 * @param profile Profile data to create or update
 * @returns Promise with created/updated profile data
 */
export const upsertProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile> => {
  // First, get user email from auth.users if not provided
  let userEmail = profileData.email;
  if (!userEmail) {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) {
      console.error(`Error getting auth user:`, authError);
      throw new Error(
        `Cannot create profile without email: ${authError.message}`
      );
    }
    userEmail = authUser.user?.email;
    if (!userEmail) {
      throw new Error("Cannot create profile: user email not found");
    }
  }

  // Convert frontend profile to database format - include required fields
  const dbProfile: {
    id: string;
    user_id: string;
    email: string;
    status: string;
    full_name: string;
    role_id: number | null;
    avatar_url?: string;
  } = {
    id: userId, // Use id as primary key
    user_id: userId,
    email: userEmail, // Required field
    status: profileData.status || "active", // Required field with valid constraint value
    full_name: profileData.full_name || userEmail.split("@")[0], // Fallback to email username
    role_id: profileData.role_id ? parseInt(profileData.role_id.toString()) : null, // Add role to profile
  };

  // Only add avatar_url if provided (bio doesn't exist in profiles table)
  if (profileData.avatar_url !== undefined) {
    dbProfile.avatar_url = profileData.avatar_url;
  }

  // Check if profile already exists - check by both id and user_id since they should be the same
  const { data: existingData, error: checkError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single() as { data: any, error: any };

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking existing profile:", checkError);
    throw new Error(checkError.message);
  }

  const profilePayload: {
    id: string;
    user_id: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string;
    status: string;
    role_id: string | number | null;
    updated_at: string;
  } = {
    id: userId,
    user_id: userId,
    email: profileData.email || "",
    full_name: profileData.full_name || "",
    phone: profileData.phone || "",
    avatar_url: profileData.avatar_url || "",
    status: profileData.status || "active",
    role_id: profileData.role_id || null,
    updated_at: new Date().toISOString(),
  };

  let result;

  if (existingData) {
    // Update existing profile using admin client - remove required fields for updates
    const updateData = { ...dbProfile };
    delete updateData.id; // Don't update primary key
    delete updateData.email; // Don't update email in existing profile

    // Use helper function to safely type the Supabase query
    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        // @ts-ignore - Bypass strict type checking for Supabase update
        .update(updateData)
        .eq("id", userId)
        .select()
        .single()
    );

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error(error.message);
    }

    console.log("✅ Profile updated successfully");
    result = data;
  } else {
    // Create new profile using admin client
    // Use helper function to safely type the Supabase query
    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        .insert(dbProfile as any)
        .select()
        .single()
    );

    if (error) {
      console.error(`Error creating profile:`, error);
      throw new Error(error.message);
    }

    result = data;
  }

  if (!result) {
    throw new Error('No data returned from preferences update');
  }
  
  return result as Profile;
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
  const { data: existingData, error: checkError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1) as { data: any[], error: any };

  if (checkError) {
    console.error(`Error checking existing profile:`, checkError);
    throw new Error(checkError.message);
  }

  let result;

  if (existingData && existingData.length > 0) {
    // Update existing profile preferences
    const existingProfile = existingData[0];
    const currentPreferences = existingProfile?.preferences || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };

    // Use helper function to safely type the Supabase query
    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        // @ts-ignore - Bypass strict type checking for Supabase update
        .update({ preferences: updatedPreferences })
        .eq("id", existingData[0].id)
        .select()
        .single()
    );

    if (error) {
      console.error(`Error updating preferences:`, error);
      throw new Error(error.message);
    }

    result = data;
  } else {
    // Create new profile with preferences
    const profilePayload: {
      id: string;
      user_id: string;
      preferences: UserPreferences;
      status: string;
      email?: string;
    } = {
      id: userId,
      user_id: userId,
      preferences: preferences,
      status: "active", // Required field
    };

    // Use helper function to safely type the Supabase query
    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        .insert({
          ...profilePayload,
          created_at: new Date().toISOString(),
        } as any)
        .select()
        .single()
    );

    if (error) {
      console.error("Error creating profile:", error);
      throw new Error(error.message);
    }

    console.log("✅ Profile created successfully");
    result = data;
  }

  if (!result) {
    throw new Error('No data returned from preferences update');
  }
  
  return result as Profile;
};
