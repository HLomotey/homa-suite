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
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  email_verified: boolean;
  password_changed_at: string | null;
  two_factor_enabled: boolean;
  login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  department: string | null;
  name: string | null;
  permissions: Json | null;
}

/**
 * Profile interface representing the profiles table in Supabase
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  create_user: string | null;
}

/**
 * User status enum
 */
export type UserStatus = 'active' | 'inactive' | 'pending';

/**
 * User role type - now dynamic from roles table
 */
export type UserRole = string;

/**
 * Role interface representing the roles table in Supabase
 */
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[] | null;
  is_system_role: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Profile with role information
 */
export interface ProfileWithRole extends Profile {
  role?: Role | null;
  role_id?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  user_roles?: Array<{
    role: Role;
    is_primary: boolean;
  }>;
}

/**
 * Frontend user type that matches the structure in UserDetail.tsx
 */
export interface FrontendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: string; // Role ID for database relationship
  department: string;
  status: UserStatus;
  lastActive?: string;
  permissions?: string[];
  createdAt?: string;
  avatar?: string;
  bio?: string;
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
 * Function to convert database user to frontend user format
 */
export const mapDatabaseUserToFrontend = (dbUser: User): FrontendUser => {
  return {
    id: dbUser.id,
    name: dbUser.name || dbUser.email.split('@')[0],
    email: dbUser.email,
    role: dbUser.role,
    roleId: undefined,
    department: dbUser.department || '',
    status: dbUser.is_active ? 'active' : 'inactive',
    lastActive: dbUser.last_login || undefined,
    permissions: Array.isArray(dbUser.permissions) ? dbUser.permissions as string[] : [],
    createdAt: dbUser.created_at
  };
};

/**
 * Function to convert database profile to frontend profile format
 */
export const mapDatabaseProfileToProfile = (dbProfile: Profile): UserWithProfile['profile'] => {
  return {
    bio: dbProfile.full_name || '',
    preferences: null,
    avatarUrl: null
  };
};

/**
 * Function to map ProfileWithRole to FrontendUser
 */
export const mapProfileWithRoleToFrontendUser = (profile: ProfileWithRole, email: string): FrontendUser => {
  // Extract role from user_roles array (get primary role or first role) or fallback to direct role
  const userRole = profile.user_roles?.find(ur => ur.is_primary)?.role || 
                   profile.user_roles?.[0]?.role || 
                   profile.role;
  
  return {
    id: profile.user_id || profile.id,
    name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || email.split('@')[0],
    email: email,
    role: userRole?.name || 'guest',
    roleId: userRole?.id || profile.role_id || undefined,
    department: profile.department || '',
    status: profile.status === 'active' ? 'active' : 'inactive',
    lastActive: undefined,
    permissions: userRole?.permissions || [],
    createdAt: profile.created_at,
    avatar: profile.avatar_url || undefined,
    bio: profile.bio || undefined
  };
};
