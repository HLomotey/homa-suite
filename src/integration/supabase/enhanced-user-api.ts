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
 * Get all users with their role information and profile data
 */
export const getUsersWithRoles = async (): Promise<EnhancedUserQuery> => {
  try {
    console.log('🔍 Fetching users with roles...');
    
    // Get all profiles first
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')

      .select('*')

      .select(`
        *,
        user_roles!inner(
          role:roles(*)
        )
      `)

      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return { users: [], total: 0, error: profilesError };
    }

    console.log(`✅ Found ${profiles?.length || 0} profiles`);

    // Get user emails from auth.users (if needed)
    const userIds = profiles?.map(p => p.id) || [];
    const emailMap = await getUserEmails(userIds);

    console.log('📋 Sample profile data:', profiles?.[0]);

    // Get role information separately if role_id exists
    const roleIds = profiles?.map(p => p.role_id).filter(Boolean) || [];
    let rolesMap = new Map();
    
    if (roleIds.length > 0) {
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .in('id', roleIds);
        
      if (!rolesError && roles) {
        roles.forEach(role => rolesMap.set(role.id, role));
      }
    }

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = (profiles || []).map(profile => {
      const email = emailMap.get(profile.id) || profile.email || `user-${profile.id.slice(0, 8)}@example.com`;
      const role = rolesMap.get(profile.role_id);
      
      return {
        id: profile.id,
        name: profile?.full_name || profile?.name || '',
        email: email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        department: profile?.department || '',
        role: role?.name || 'No Role',
        roleId: profile?.role_id || '',
        status: profile?.status || 'active',
        lastActive: profile?.last_active || new Date().toISOString(),
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        avatar: profile?.avatar_url || '',
        permissions: [] // Will be populated separately if needed
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
    // Get all users with roles first, then filter
    const { data: usersWithRoles, error: rolesError } = await supabase
      .rpc('get_users_with_roles');

    if (rolesError) {
      console.error('Error fetching users by role:', rolesError);
      return { users: [], total: 0, error: rolesError };
    }

    // Filter by role name
    const filteredUsers = (usersWithRoles || []).filter(userRole => 
      userRole.role_name === roleName
    );

    // Get user IDs to fetch their profiles
    const userIds = filteredUsers.map(user => user.id);
    
    // Fetch profiles for filtered users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')

      .select('*')
      .in('id', userIds);

      .select(`
        *,
        user_roles!inner(
          role:roles!inner(*)
        )
      `)
      .eq('user_roles.role.name', roleName)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without profiles rather than failing completely
    }

    // Create a map of profiles by user ID for easy lookup
    const profilesMap = new Map();
    (profiles || []).forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = filteredUsers.map(userRole => {
      const profile = profilesMap.get(userRole.id);
      
      return {
        id: userRole.id,
        name: profile?.full_name || profile?.name || '',
        email: userRole.email || profile?.email || `user-${userRole.id.slice(0, 8)}@example.com`,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        department: profile?.department || '',
        role: userRole.role_name || 'No Role',
        roleId: userRole.role_id?.toString() || '',
        status: profile?.status || 'active',
        lastActive: profile?.last_active || new Date().toISOString(),
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        avatar: profile?.avatar_url || '',
        permissions: []
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
    // First get all users with roles
    const { data: usersWithRoles, error: rolesError } = await supabase
      .rpc('get_users_with_roles');

    if (rolesError) {
      console.error('Error fetching users with roles:', rolesError);
      return { users: [], total: 0, error: rolesError };
    }

    // Get all user IDs to fetch their profiles
    const userIds = (usersWithRoles || []).map(user => user.id);
    
    // Fetch profiles for all users and filter by department
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')

      .select('*')
      .in('id', userIds)
      .eq('department', department);

      .select(`
        *,
        user_roles(
          role:roles(*)
        )
      `)
      .eq('department', department)
      .order('created_at', { ascending: false });


    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { users: [], total: 0, error: profilesError };
    }

    // Create a map of profiles by user ID for easy lookup
    const profilesMap = new Map();
    (profiles || []).forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    // Filter users with roles to only include those with matching department profiles
    const filteredUsers = (usersWithRoles || []).filter(userRole => 
      profilesMap.has(userRole.id)
    );

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = filteredUsers.map(userRole => {
      const profile = profilesMap.get(userRole.id);
      
      return {
        id: userRole.id,
        name: profile?.full_name || profile?.name || '',
        email: userRole.email || profile?.email || `user-${userRole.id.slice(0, 8)}@example.com`,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        department: profile?.department || '',
        role: userRole.role_name || 'No Role',
        roleId: userRole.role_id?.toString() || '',
        status: profile?.status || 'active',
        lastActive: profile?.last_active || new Date().toISOString(),
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        avatar: profile?.avatar_url || '',
        permissions: []
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

    // First get all users with roles
    const { data: usersWithRoles, error: rolesError } = await supabase
      .rpc('get_users_with_roles');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role:roles(*)
        )
      `)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });


    if (rolesError) {
      console.error('Error fetching users with roles:', rolesError);
      return { users: [], total: 0, error: rolesError };
    }

    // Get all user IDs to fetch their profiles
    const userIds = (usersWithRoles || []).map(user => user.id);
    
    // Search profiles by name, department, or full_name
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .or(`full_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

    if (profilesError) {
      console.error('Error searching profiles:', profilesError);
      // Continue without profiles rather than failing completely
    }

    // Create a map of profiles by user ID for easy lookup
    const profilesMap = new Map();
    (profiles || []).forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    // Also search by email in the users with roles data
    const emailMatches = (usersWithRoles || []).filter(userRole => 
      userRole.email && userRole.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Combine profile matches and email matches
    const profileMatchedUsers = (usersWithRoles || []).filter(userRole => 
      profilesMap.has(userRole.id)
    );

    // Remove duplicates by creating a Set of user IDs
    const matchedUserIds = new Set([
      ...profileMatchedUsers.map(u => u.id),
      ...emailMatches.map(u => u.id)
    ]);

    const filteredUsers = (usersWithRoles || []).filter(userRole => 
      matchedUserIds.has(userRole.id)
    );

    // Transform the data to match FrontendUser interface
    const users: FrontendUser[] = filteredUsers.map(userRole => {
      const profile = profilesMap.get(userRole.id);
      
      return {
        id: userRole.id,
        name: profile?.full_name || profile?.name || '',
        email: userRole.email || profile?.email || `user-${userRole.id.slice(0, 8)}@example.com`,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        department: profile?.department || '',
        role: userRole.role_name || 'No Role',
        roleId: userRole.role_id?.toString() || '',
        status: profile?.status || 'active',
        lastActive: profile?.last_active || new Date().toISOString(),
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        avatar: profile?.avatar_url || '',
        permissions: []
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
 * Update user role - now uses user_roles junction table
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
        role_id: parseInt(roleId),
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
