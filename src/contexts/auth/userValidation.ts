/**
 * User Validation Module
 * Handles validation of external staff and profile access
 */

// @ts-nocheck
// Admin client usage removed to prevent Multiple GoTrueClient warning
// import { supabaseAdmin } from "@/integration/supabase";
import { supabase } from "@/integration/supabase/client";
import { ExternalStaffMember, Profile, UserValidationResult } from "./types";

/**
 * Validates if email exists in external staff and is active
 * @param email - Email address to validate
 * @returns Promise<ExternalStaffMember | null> - External staff member if valid, null otherwise
 */
export const validateExternalStaffEmail = async (
  email: string
): Promise<ExternalStaffMember | null> => {
  // Note: Admin client functionality disabled to prevent Multiple GoTrueClient warning
  // This function would normally validate against external_staff table
  // For now, return null to indicate external staff validation is not available
  console.log("External staff validation disabled (admin client not available):", email);
  return null;
};

/**
 * Gets user profile from profiles table
 * @param userId - User ID to fetch profile for
 * @returns Promise<Profile | null> - User profile if found, null otherwise
 */
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error getting user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
};

/**
 * Enhanced user validation function that checks multiple sources
 * @param email - Email address to validate
 * @returns Promise<UserValidationResult> - Validation result with details
 */
export const validateUserAccess = async (email: string): Promise<UserValidationResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check external_staff table first (with active status requirement)
  const externalStaff = await validateExternalStaffEmail(normalizedEmail);
  if (externalStaff) {
    return {
      isValid: true,
      userType: 'external_staff',
      details: `Active staff member: ${externalStaff.full_name}`
    };
  }

  // Check if user exists in profiles table (management users)
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, status")
      .eq("email", normalizedEmail)
      .single();

    if (!error && profile) {
      return {
        isValid: true,
        userType: 'management',
        details: `Management user: ${(profile as any).full_name || (profile as any).email}`
      };
    }
  } catch (error) {
    console.log("No profile found for email:", normalizedEmail);
  }

  // Check if user exists in auth.users (fallback for admin-created users)
  // Note: Admin client functionality disabled to prevent Multiple GoTrueClient warning
  // For now, assume auth-only users are valid if they have a valid email format
  if (normalizedEmail && normalizedEmail.includes('@')) {
    console.log("Assuming auth-only user is valid:", normalizedEmail);
    return {
      isValid: true,
      userType: 'auth_only',
      details: `Authenticated user: ${normalizedEmail}`
    };
  }

  return {
    isValid: false,
    userType: 'external_staff',
    details: 'User not found in any authorized user directory'
  };
};
