/**
 * User Profile API Utilities
 * Contains shared utility functions and type definitions
 */

import {
  FrontendUser,
  Profile,
  User,
  UserRole,
  UserStatus,
} from "../../integration/supabase/types";

/**
 * Convert Profile data to FrontendUser format
 */
export const profileToFrontendUser = (profile: Profile): FrontendUser => ({
  id: profile.id,
  name: profile.full_name || profile.email.split("@")[0],
  email: profile.email,
  role: (profile.role_id ? "admin" : "staff") as UserRole,
  department: "", // Not available in current schema
  status: (profile.status === "active"
    ? "active"
    : profile.status === "inactive"
    ? "inactive"
    : "pending") as UserStatus,
  lastActive: undefined,
  permissions: [],
  createdAt: profile.created_at,
});

/**
 * Interface for User Activity
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details?: any;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Interface for User Preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  language?: string;
  timezone?: string;
  dateFormat?: string;
  [key: string]: any;
}
