/**
 * Session Validation Module
 * Handles session validation and expiration checks
 */

import { Session } from "@supabase/supabase-js";
import { UserValidationResult } from "./types";
import { validateUserAccess } from "./userValidation";

// Constants for session management
const LAST_ACTIVITY_KEY = "auth_last_activity";
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Updates the last activity timestamp in localStorage
 */
export const updateLastActivity = (): void => {
  const now = Date.now();
  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
};

/**
 * Gets the last activity timestamp from localStorage
 * @returns number - Last activity timestamp or 0 if not found
 */
export const getLastActivity = (): number => {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  return lastActivity ? parseInt(lastActivity, 10) : 0;
};

/**
 * Clears the last activity timestamp from localStorage
 */
export const clearLastActivity = (): void => {
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

/**
 * Checks if the session has expired based on last activity
 * @returns boolean - Whether the session has expired due to inactivity
 */
export const isSessionExpiredByInactivity = (): boolean => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return false;

  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;

  console.log(
    `Time since last activity: ${Math.floor(
      timeSinceLastActivity / 1000
    )} seconds`
  );

  return timeSinceLastActivity > SESSION_TIMEOUT;
};

/**
 * Validates if a session is still valid
 * @param session - The Supabase session to validate
 * @returns Promise<boolean> - Whether the session is valid
 */
export const validateSession = async (session: Session): Promise<boolean> => {
  try {
    // Check if session is expired by Supabase timestamp
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log("Supabase session expired, logging out");
      clearLastActivity();
      return false;
    }

    // Check if session is expired due to inactivity
    if (isSessionExpiredByInactivity()) {
      console.log("Session expired due to inactivity, logging out");
      clearLastActivity();
      return false;
    }

    // Validate user still exists and has access
    const validation = await validateUserAccess(session.user.email!);
    if (!validation.isValid) {
      console.log("User access validation failed:", validation.details);
      clearLastActivity();
      return false;
    }

    // Update last activity since session is valid
    updateLastActivity();
    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    clearLastActivity();
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
