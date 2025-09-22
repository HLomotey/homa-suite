/**
 * User Validation Module
 * Handles validation of external staff and profile access
 */

import { supabaseAdmin } from "@/integration/supabase/client";
import { ExternalStaffMember, Profile, UserValidationResult } from "./types";

/**
 * Validates if email exists in external staff and is active
 * @param email - Email address to validate
 * @returns Promise<ExternalStaffMember | null> - External staff member if valid, null otherwise
 */
export const validateExternalStaffEmail = async (
  email: string
): Promise<ExternalStaffMember | null> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Use type assertion to avoid complex type inference
    const { data, error } = await (supabaseAdmin as any)
      .from("external_staff")
      .select("*")
      .eq('"PERSONAL E-MAIL"', normalizedEmail)
      .eq('"POSITION STATUS"', "A - Active")
      .maybeSingle();

    if (error) {
      console.error("Error validating external staff email:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: (data as any)["EMPLOYEE ID"] || "",
      email: (data as any)["PERSONAL E-MAIL"] || "",
      full_name: (data as any)["FULL NAME"] || "",
      position_status: (data as any)["POSITION STATUS"] || "",
      is_active: (data as any)["POSITION STATUS"] === "A - Active"
    };
  } catch (error) {
    console.error("Error in validateExternalStaffEmail:", error);
    return null;
  }
};

/**
 * Gets user profile from profiles table
 * @param userId - User ID to fetch profile for
 * @returns Promise<Profile | null> - User profile if found, null otherwise
 */
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabaseAdmin
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
    const { data: profile, error } = await supabaseAdmin
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
  try {
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    if (!error && authUsers.users) {
      const authUser = authUsers.users.find((u: any) => u.email === normalizedEmail);
      if (authUser) {
        return {
          isValid: true,
          userType: 'auth_only',
          details: `Authenticated user: ${authUser.user_metadata?.name || authUser.email}`
        };
      }
    }
  } catch (error) {
    console.log("Error checking auth users:", error);
  }

  return {
    isValid: false,
    userType: 'external_staff',
    details: 'User not found in any authorized user directory'
  };
};
