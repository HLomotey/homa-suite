/**
 * Enhanced User API with Role Integration
 * Provides user queries that join with roles table for richer data
 */

import { supabase } from './client';
import { ProfileWithRole, FrontendUser, mapProfileWithRoleToFrontendUser } from './types/user-profile';

export interface EnhancedUserQuery {
  users: FrontendUser[];
  total: number;
  error: Error | null;
}

/**
 * Helper function to get user emails - enhanced to fetch real emails
 */
const getUserEmails = async (userIds: string[]): Promise<Map<string, string>> => {
  const emailMap = new Map<string, string>();
  
  try {
    // First try to get emails directly from the users table
    const { data: usersData, error } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);
    
    if (error) {
      throw error;
    }
    
    // Add all found emails to the map
    if (usersData && usersData.length > 0) {
      usersData.forEach(user => {
        if (user.id && user.email) {
          emailMap.set(user.id, user.email);
          console.log(`Found email for user ${user.id}: ${user.email}`);
        }
      });
    }
    
    // Try to get current user's email if they're in the list and not already found
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser && currentUser.email && userIds.includes(currentUser.id) && !emailMap.has(currentUser.id)) {
      emailMap.set(currentUser.id, currentUser.email);
      console.log(`Added current user email for ${currentUser.id}: ${currentUser.email}`);
    }
    
    // For any remaining users without emails, use placeholder
    userIds.forEach(userId => {
      if (!emailMap.has(userId)) {
        emailMap.set(userId, `user-${userId.slice(0, 8)}@example.com`);
        console.log(`Using placeholder email for user ${userId}`);
      }
    });
    
  } catch (err) {
    console.error('Error in getUserEmails:', err);
    // Fallback: generate placeholder emails
    userIds.forEach(id => {
      emailMap.set(id, `user-${id.slice(0, 8)}@example.com`);
    });
  }
  
  return emailMap;
};

/**
 * Get all users with their role information
 */
export const getUsersWithRoles = async (): Promise<EnhancedUserQuery> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users with roles:', error);
      return { users: [], total: 0, error };
    }

    // Get user emails
    const userIds = profiles?.map(p => p.user_id) || [];
    const emailMap = await getUserEmails(userIds);

    // Map profiles to frontend users
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const email = emailMap.get(profile.user_id) || `user-${profile.user_id.slice(0, 8)}@example.com`;
      return mapProfileWithRoleToFrontendUser(profile as ProfileWithRole, email);
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
 * Get users filtered by role
 */
export const getUsersByRole = async (roleName: string): Promise<EnhancedUserQuery> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('roles.name', roleName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by role:', error);
      return { users: [], total: 0, error };
    }

    // Get user emails
    const userIds = profiles?.map(p => p.user_id) || [];
    const emailMap = await getUserEmails(userIds);

    // Map profiles to frontend users
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const email = emailMap.get(profile.user_id) || `user-${profile.user_id.slice(0, 8)}@example.com`;
      return mapProfileWithRoleToFrontendUser(profile as ProfileWithRole, email);
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
 * Get users filtered by department
 */
export const getUsersByDepartment = async (department: string): Promise<EnhancedUserQuery> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('department', department)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users by department:', error);
      return { users: [], total: 0, error };
    }

    // Get user emails
    const userIds = profiles?.map(p => p.user_id) || [];
    const emailMap = await getUserEmails(userIds);

    // Map profiles to frontend users
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const email = emailMap.get(profile.user_id) || `user-${profile.user_id.slice(0, 8)}@example.com`;
      return mapProfileWithRoleToFrontendUser(profile as ProfileWithRole, email);
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
 * Search users by name, email, or department
 */
export const searchUsers = async (searchTerm: string): Promise<EnhancedUserQuery> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles(*)
      `)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      return { users: [], total: 0, error };
    }

    // Get user emails
    const userIds = profiles?.map(p => p.user_id) || [];
    const emailMap = await getUserEmails(userIds);

    // Filter by email if search term looks like email
    const emailMatches = new Set<string>();
    emailMap.forEach((email, userId) => {
      if (email.toLowerCase().includes(searchTerm.toLowerCase())) {
        emailMatches.add(userId);
      }
    });

    // Combine profile matches and email matches
    const allMatchedProfiles = profiles || [];
    const emailMatchedProfiles = Array.from(emailMatches).map(userId => {
      return allMatchedProfiles.find(p => p.user_id === userId);
    }).filter(Boolean);

    // Remove duplicates
    const uniqueProfiles = [...allMatchedProfiles, ...emailMatchedProfiles].filter((profile, index, self) => 
      index === self.findIndex(p => p?.user_id === profile?.user_id)
    );

    // Map profiles to frontend users
    const users: FrontendUser[] = uniqueProfiles.map(profile => {
      const email = emailMap.get(profile!.user_id) || `user-${profile!.user_id.slice(0, 8)}@example.com`;
      return mapProfileWithRoleToFrontendUser(profile as ProfileWithRole, email);
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
 * Update user role
 */
export const updateUserRole = async (userId: string, roleId: string): Promise<{ success: boolean; error?: Error }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role_id: roleId })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return { success: false, error: error as Error };
  }
};
