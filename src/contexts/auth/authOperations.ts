/**
 * Authentication Operations Module
 * Handles sign in, sign up, and sign out operations
 */

import { supabase, supabaseAdmin } from "@/integration/supabase";
import { validateUserAccess, validateExternalStaffEmail } from "./userValidation";
import { buildAuthUser } from "./authUtils";
import { AuthUser } from "./types";

/**
 * Sign in function
 * @param email - User email
 * @param password - User password
 * @param setCurrentUser - Function to set current user state
 * @param setLoading - Function to set loading state
 * @returns Promise with success/error result
 */
export const signIn = async (
  email: string,
  password: string,
  setCurrentUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    // Validate user access using enhanced logic
    const validation = await validateUserAccess(normalizedEmail);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Access denied: ${validation.details}. Please contact HR to verify your account status.`,
      };
    }

    console.log(`Login validation passed: ${validation.details}`);

    // Attempt to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Provide specific error messages based on error type
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('Too many requests')) {
        errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
      } else if (error.message.includes('User not found')) {
        errorMessage = "Account not found. Please contact HR if you believe this is an error.";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    if (data.user && data.session) {
      console.log(`Login successful for ${validation.userType}: ${validation.details}`);
      
      // Extract staff name from validation details
      const staffName = validation.details.includes(':') 
        ? validation.details.split(':')[1].trim() 
        : data.user.user_metadata?.name || data.user.email;
      
      // Build full auth user before setting state to prevent empty dashboard
      console.log('Building full auth user data...');
      const authUser = await buildAuthUser(data.user, data.session);
      setCurrentUser(authUser);
      setLoading(false);
      
      console.log('Auth user fully loaded with modules:', authUser.modules);
      
      return { 
        success: true,
        error: `Welcome back, ${staffName}!`
      };
    }

    return {
      success: false,
      error: "Authentication failed. Please try again or contact support if the problem persists.",
    };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login. Please try again or contact support.",
    };
  } finally {
    setLoading(false);
  }
};

/**
 * Sign up function
 * @param email - User email
 * @param password - User password
 * @param setLoading - Function to set loading state
 * @returns Promise with success/error result
 */
export const signUp = async (
  email: string,
  password: string,
  setLoading: (loading: boolean) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    // Validate that email exists in external staff and is active
    const externalStaff = await validateExternalStaffEmail(normalizedEmail);
    if (!externalStaff) {
      return {
        success: false,
        error:
          "Email address not found in our staff directory. Please contact HR to verify your email address.",
      };
    }

    // Create user account using admin client to bypass email confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: externalStaff.full_name,
        external_staff_id: externalStaff.id,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Profile creation is handled by database trigger automatically
    // No manual profile creation needed for regular users

    return { success: true };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  } finally {
    setLoading(false);
  }
};

/**
 * Sign out function
 * @param setCurrentUser - Function to set current user state
 * @returns Promise<void>
 */
export const signOut = async (
  setCurrentUser: (user: AuthUser | null) => void
): Promise<void> => {
  try {
    await supabase.auth.signOut();
    setCurrentUser(null);
  } catch (error) {
    console.error("Sign out error:", error);
  }
};
