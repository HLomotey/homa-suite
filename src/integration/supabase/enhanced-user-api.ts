/**
 * Enhanced User API with Role Integration
 * Provides user queries that join with roles table for richer data
 */

import { supabase } from './client';
import { Json } from './types/database';

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

/** Narrow a Json to a string[] safely */
const asStringArray = (val: Json | null | undefined): string[] => {
  return Array.isArray(val) ? (val as unknown as string[]) : [];
};

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
    permissions: asStringArray(dbUser.permissions),
    createdAt: dbUser.created_at,
  };
};

/**
 * Function to convert database profile to frontend profile format
 */
export const mapDatabaseProfileToProfile = (
  dbProfile: Profile
): UserWithProfile['profile'] => {
  return {
    bio: dbProfile.full_name || '',
    preferences: null,
    avatarUrl: null,
  };
};

/**
 * Function to map ProfileWithRole to FrontendUser
 * - Picks the primary role from user_roles, otherwise the first, otherwise the direct role field.
 */
export const mapProfileWithRoleToFrontendUser = (
  profile: ProfileWithRole,
  email: string
): FrontendUser => {
  const userRoleObj: Role | undefined | null =
    profile.user_roles?.find((ur) => ur.is_primary)?.role ??
    profile.user_roles?.[0]?.role ??
    profile.role ??
    null;

  const derivedName =
    profile.full_name ||
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
    email.split('@')[0];

  return {
    id: profile.user_id || profile.id,
    name: derivedName,
    email,
    role: (userRoleObj?.name as UserRole) || 'guest',
    roleId: userRoleObj?.id || undefined,
    department: profile.department || '',
    status: profile.status === 'active' ? 'active' : 'inactive',
    permissions: userRoleObj?.permissions || [],
    createdAt: profile.created_at,
    // avatar / bio left undefined since Profile doesn't define those fields
  };
};

export interface EnhancedUserQuery {
  users: FrontendUser[];
  total: number;
  error: Error | null;
}

/**
 * Get all users with their role information and profile data
 */
export const getUsersWithRoles = async (): Promise<EnhancedUserQuery> => {
  try {
    console.log('🔍 Fetching users with roles...');
    
    // Get all profiles with role information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role:roles(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return { users: [], total: 0, error: profilesError };
    }

    console.log(`✅ Found ${profiles?.length || 0} profiles`);

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const userRole = profile.user_roles?.[0]?.role;
      
      return {
        id: profile.id,
        name: profile?.full_name || profile?.name || '',
        email: profile?.email || `user-${profile.id.slice(0, 8)}@example.com`,
        role: userRole?.name || 'No Role',
        roleId: userRole?.id?.toString() || '',
        department: profile?.department || '',
        status: profile?.status === 'active' ? 'active' : 'inactive',
        lastActive: profile?.last_active || new Date().toISOString(),
        permissions: userRole?.permissions || [],
        createdAt: profile?.created_at || new Date().toISOString(),
        avatar: profile?.avatar_url || ''
      };
    });

    return {
      users,
      total: users.length,
      error: null
    };
  } catch (error) {
    console.error('Error in getUsersWithRoles:', error);
    return { users: [], total: 0, error: error as Error };
  }
};

/**
 * Get users filtered by role with profile data
 */
export const getUsersByRole = async (roleName: string): Promise<EnhancedUserQuery> => {
  try {
    // Fetch profiles with specific role
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles!inner(
          role:roles!inner(*)
        )
      `)
      .eq('user_roles.role.name', roleName)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching users by role:', profilesError);
      return { users: [], total: 0, error: profilesError };
    }

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const userRole = profile.user_roles?.[0]?.role;
      
      return {
        id: profile.id,
        name: profile?.full_name || profile?.name || '',
        email: profile?.email || `user-${profile.id.slice(0, 8)}@example.com`,
        role: userRole?.name || 'No Role',
        roleId: userRole?.id?.toString() || '',
        department: profile?.department || '',
        status: profile?.status === 'active' ? 'active' : 'inactive',
        lastActive: profile?.last_active || new Date().toISOString(),
        permissions: userRole?.permissions || [],
        createdAt: profile?.created_at || new Date().toISOString(),
        avatar: profile?.avatar_url || ''
      };
    });

    return {
      users,
      total: users.length,
      error: null
    };
  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    return { users: [], total: 0, error: error as Error };
  }
};

/**
 * Get users filtered by department with profile data
 */
export const getUsersByDepartment = async (department: string): Promise<EnhancedUserQuery> => {
  try {
    // Fetch profiles filtered by department
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role:roles(*)
        )
      `)
      .eq('department', department)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching users by department:', profilesError);
      return { users: [], total: 0, error: profilesError };
    }

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const userRole = profile.user_roles?.[0]?.role;
      
      return {
        id: profile.id,
        name: profile?.full_name || profile?.name || '',
        email: profile?.email || `user-${profile.id.slice(0, 8)}@example.com`,
        role: userRole?.name || 'No Role',
        roleId: userRole?.id?.toString() || '',
        department: profile?.department || '',
        status: profile?.status === 'active' ? 'active' : 'inactive',
        lastActive: profile?.last_active || new Date().toISOString(),
        permissions: userRole?.permissions || [],
        createdAt: profile?.created_at || new Date().toISOString(),
        avatar: profile?.avatar_url || ''
      };
    });

    return {
      users,
      total: users.length,
      error: null
    };
  } catch (error) {
    console.error('Error in getUsersByDepartment:', error);
    return { users: [], total: 0, error: error as Error };
  }
};

/**
 * Search users by name, email, or department with profile data
 */
export const searchUsers = async (searchTerm: string): Promise<EnhancedUserQuery> => {
  try {
    // Search profiles by name, department, or full_name
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role:roles(*)
        )
      `)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error searching users:', profilesError);
      return { users: [], total: 0, error: profilesError };
    }

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const userRole = profile.user_roles?.[0]?.role;
      
      return {
        id: profile.id,
        name: profile?.full_name || profile?.name || '',
        email: profile?.email || `user-${profile.id.slice(0, 8)}@example.com`,
        role: userRole?.name || 'No Role',
        roleId: userRole?.id?.toString() || '',
        department: profile?.department || '',
        status: profile?.status === 'active' ? 'active' : 'inactive',
        lastActive: profile?.last_active || new Date().toISOString(),
        permissions: userRole?.permissions || [],
        createdAt: profile?.created_at || new Date().toISOString(),
        avatar: profile?.avatar_url || ''
      };
    });

    return {
      users,
      total: users.length,
      error: null
    };
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return { users: [], total: 0, error: error as Error };
  }
};

/**
 * Update user role - uses user_roles junction table
 */
export const updateUserRole = async (userId: string, roleId: string): Promise<{ success: boolean; error?: Error }> => {
  try {
    // First, remove any existing primary role for this user
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('is_primary', true);

    if (deleteError) {
      console.error('Error removing existing role:', deleteError);
      return { success: false, error: deleteError };
    }

    // Then add the new primary role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        is_primary: true,
        assigned_by: userId // For now, user assigns their own role
      });

    if (insertError) {
      console.error('Error assigning new role:', insertError);
      return { success: false, error: insertError };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return { success: false, error: error as Error };
  }
};
