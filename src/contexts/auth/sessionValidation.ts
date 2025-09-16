/**
 * Session Validation Module
 * Handles session validation and expiration checks
 */

import { Session } from "@supabase/supabase-js";
import { UserValidationResult } from "./types";
import { validateUserAccess } from "./userValidation";

/**
 * Validates if a session is still valid
 * @param session - The Supabase session to validate
 * @returns Promise<boolean> - Whether the session is valid
 */
export const validateSession = async (session: Session): Promise<boolean> => {
  try {
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log("Session expired, logging out");
      return false;
    }

    // Validate user still exists and has access
    const validation = await validateUserAccess(session.user.email!);
    if (!validation.isValid) {
      console.log("User access validation failed:", validation.details);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
};

/**
 * Checks if a session has expired based on timestamp
 * @param session - The Supabase session to check
 * @returns boolean - Whether the session has expired
 */
export const isSessionExpired = (session: Session): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at ? session.expires_at < now : false;
};

/**
 * Gets the remaining time until session expires
 * @param session - The Supabase session
 * @returns number - Remaining time in seconds, or 0 if expired
 */
export const getSessionTimeRemaining = (session: Session): number => {
  if (!session.expires_at) return 0;

  const now = Math.floor(Date.now() / 1000);
  const remaining = session.expires_at - now;
  return Math.max(0, remaining);
};

/**
 * Formats session expiry time for display
 * @param session - The Supabase session
 * @returns string - Formatted expiry time
 */
export const formatSessionExpiry = (session: Session): string => {
  if (!session.expires_at) return "Never expires";

  const expiryDate = new Date(session.expires_at * 1000);
  return expiryDate.toLocaleString();
};
