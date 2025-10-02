// @ts-nocheck
import { supabase } from './client';
// Note: Admin operations should be moved to server-side endpoints
// import { supabaseAdmin } from './admin-client';
import {
  Module,
  Action,
  Permission,
  Role,
  RoleWithPermissions,
  UserRole,
  UserPermission,
  PermissionWithDetails,
  UserPermissionSummary,
  UserWithRoles,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  UpdateUserRolesRequest,
  UpdateUserPermissionsRequest
} from './types/rbac-types';

// Modules API
export const modulesApi = {
  // Get all modules
  async getAll(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get active modules only
  async getActive(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

// Actions API
export const actionsApi = {
  // Get all actions
  async getAll(): Promise<Action[]> {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get active actions only
  async getActive(): Promise<Action[]> {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

// Permissions API
export const permissionsApi = {
  // Get all permissions with module and action details
  async getAll(): Promise<PermissionWithDetails[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select(`
        *,
        module:modules(*),
        action:actions(*)
      `)
      .eq('is_active', true)
      .order('permission_key', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get permissions by module
  async getByModule(moduleName: string): Promise<PermissionWithDetails[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select(`
        *,
        module:modules(*),
        action:actions(*)
      `)
      .eq('is_active', true)
      .eq('modules.name', moduleName)
      .eq('modules.is_active', true);
    
    if (error) throw error;
    return data || [];
  },

  // Get permission by key
  async getByKey(permissionKey: string): Promise<PermissionWithDetails | null> {
    const { data, error } = await supabase
      .from('permissions')
      .select(`
        *,
        module:modules(*),
        action:actions(*)
      `)
      .eq('permission_key', permissionKey)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
};

// Roles API
export const rolesApi = {
  // Get all roles
  async getAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get active roles only
  async getActive(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get role with permissions
  async getWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission:permissions(
            *,
            module:modules(*),
            action:actions(*)
          )
        )
      `)
      .eq('id', roleId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;

    // Transform the data structure
    const permissions = (data as any).role_permissions?.map((rp: any) => rp.permission) || [];
    
    return {
      ...(data as any),
      permissions
    };
  },

  // Get role by name
  async getByName(name: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Create new role
  async create(roleData: CreateRoleRequest): Promise<Role> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Role creation should be implemented as a server-side endpoint');
  },

  // Update role
  async update(id: string, roleData: UpdateRoleRequest): Promise<Role> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Role updates should be implemented as a server-side endpoint');
  },

  // Delete role
  async delete(id: string): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Role deletion should be implemented as a server-side endpoint');
  }
};

// User Roles API
export const userRolesApi = {
  // Get users with a specific role
  async getUsersWithRole(roleId: string): Promise<UserWithRoles[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        is_primary,
        user:auth.users!user_id(id, email),
        profiles:profiles!id(full_name)
      `)
      .eq('role_id', roleId);
    
    if (error) throw error;
    
    // Transform the data to match UserWithRoles structure
    return (data || []).map((item: any) => ({
      id: item.user.id,
      email: item.user.email,
      name: item.profiles?.full_name || '',
      avatar: '', // No avatar column in simplified profiles table
      is_primary_role: item.is_primary
    }));
  },
  // Get user's role (simplified - single role from profiles table)
  async getUserRoles(userId: string): Promise<UserWithRoles | null> {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        role_id,
        role:roles(*)
      `)
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    if (!userData) return null;

    return {
      ...userData,
      primary_role: Array.isArray(userData.role) ? userData.role[0] : userData.role
    };
  },

  // Assign role to user (simplified - direct role_id in profiles table)
  async assignRole(data: AssignRoleRequest): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Role assignment should be implemented as a server-side endpoint');
  },

  // Remove role from user (set role_id to null)
  async removeRole(userId: string, roleId: string): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Role removal should be implemented as a server-side endpoint');
  },

  // Update user's role (simplified - single role only)
  async updateUserRoles(data: UpdateUserRolesRequest): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('User role updates should be implemented as a server-side endpoint');
  },
};

// User Permissions API
export const userPermissionsApi = {
  // Get user's effective permissions
  async getUserEffectivePermissions(userId: string): Promise<UserPermissionSummary | null> {
    const { data, error } = await supabase.rpc('get_user_effective_permissions', {
      p_user_id: userId
    });
    
    if (error) throw error;
    
    // Get user's roles
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('user_id', userId);
    
    // Get user's custom permissions
    const { data: customPermissionsData } = await supabase
      .from('user_permissions')
      .select(`
        *,
        permission:permissions(
          *,
          module:modules(*),
          action:actions(*)
        )
      `)
      .eq('user_id', userId);
    
    // Find primary role
    const roles = userRolesData?.map((ur: any) => ur.role) || [];
    const primaryRole = userRolesData?.find((ur: any) => ur.is_primary)?.role;
    
    // Get role permissions
    const rolePermissions: PermissionWithDetails[] = [];
    for (const userRole of userRolesData || []) {
      const { data: rolePermData } = await supabase
        .from('role_permissions')
        .select(`
          permission:permissions(
            *,
            module:modules(*),
            action:actions(*)
          )
        `)
        .eq('role_id', userRole.role_id);
      
      rolePermissions.push(...(rolePermData?.map((rp: any) => rp.permission) || []));
    }
    
    return {
      user_id: userId,
      roles,
      primary_role: primaryRole,
      role_permissions: rolePermissions,
      custom_permissions: customPermissionsData || [],
      effective_permissions: data?.map((item: any) => item.permission_key) || []
    };
  },

  // Update user's custom permissions
  async updateUserPermissions(data: UpdateUserPermissionsRequest): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('User permission updates should be implemented as a server-side endpoint');
  },

  // Grant permission to user
  async grantPermission(userId: string, permissionId: string, expiresAt?: string): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Permission granting should be implemented as a server-side endpoint');
  },

  // Revoke permission from user
  async revokePermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        permission_id: permissionId,
        is_granted: false,
        granted_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  // Remove custom permission (fall back to role permission)
  async removeCustomPermission(userId: string, permissionId: string): Promise<void> {
    // TODO: Move to server-side endpoint to avoid admin client in browser
    throw new Error('Permission removal should be implemented as a server-side endpoint');
  }
};

// Helper function to check if a user has a specific permission
export async function checkUserPermission(userId: string, permissionKey: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_permission_key: permissionKey
  });
  
  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }
  
  return data || false;
}
