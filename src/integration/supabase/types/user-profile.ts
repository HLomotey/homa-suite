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
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  employee_id: string | null;
  hire_date: string | null;
  address: Json | null;
  contact_info: Json | null;
  preferences: Json | null;
  bio: string | null;
  skills: string[] | null;
  certifications: string[] | null;
  emergency_contact: Json | null;
  role_id: string | null; // New field for role relationship
  created_at: string;
  updated_at: string;
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
 * Maps a database user to the frontend user format
 */
export const mapDatabaseUserToFrontend = (dbUser: User): FrontendUser => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as UserRole,
    roleId: undefined, // User table doesn't have role_id, use profiles table instead
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
  return {
    bio: dbProfile.bio,
    preferences: dbProfile.preferences as Record<string, any> | null,
    avatarUrl: dbProfile.avatar_url
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
    id: profile.user_id,
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    email: email,
    role: userRole?.name || 'guest',
    roleId: userRole?.id || profile.role_id || undefined,
    department: profile.department || '',
    status: 'active' as UserStatus,
    lastActive: undefined,
    permissions: userRole?.permissions || [],
    createdAt: profile.created_at,
    avatar: profile.avatar_url || undefined,
    bio: profile.bio || undefined
  };
};
