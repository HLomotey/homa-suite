/**
 * User and Profile type definitions for Supabase integration
 * This file consolidates all user and profile related types
 */

import { Json } from './database';

/**
 * User interface representing the users table in Supabase
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  last_active: string | null;
  permissions: string[] | null;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
}

/**
 * Profile interface representing the profiles table in Supabase
 */
export interface Profile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  bio: string | null;
  preferences: Json | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * User status enum
 */
export type UserStatus = 'active' | 'inactive' | 'pending';

/**
 * User role enum
 */
export type UserRole = 'admin' | 'manager' | 'staff' | 'guest';

/**
 * Frontend user type that matches the structure in UserDetail.tsx
 */
export interface FrontendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastActive?: string;
  permissions?: string[];
  createdAt?: string;
  avatar?: string;
}

/**
 * Extended user type with profile information
 */
export interface UserWithProfile extends FrontendUser {
  profile?: {
    bio?: string | null;
    preferences?: Record<string, any> | null;
    avatarUrl?: string | null;
  };
}

/**
 * User preferences type
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

/**
 * User activity type for tracking user actions
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Maps a database user to the frontend user format
 */
export const mapDatabaseUserToFrontend = (dbUser: User): FrontendUser => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as UserRole,
    department: dbUser.department,
    status: dbUser.status as UserStatus,
    lastActive: dbUser.last_active || undefined,
    permissions: dbUser.permissions || undefined,
    createdAt: dbUser.created_at,
    avatar: dbUser.avatar_url || undefined
  };
};

/**
 * Function to convert database profile to frontend profile format
 */
export const mapDatabaseProfileToProfile = (dbProfile: Profile): UserWithProfile['profile'] => {
  if (!dbProfile) return undefined;
  
  return {
    bio: dbProfile.bio,
    preferences: dbProfile.preferences as Record<string, any> | null,
    avatarUrl: dbProfile.avatar_url
  };
};
