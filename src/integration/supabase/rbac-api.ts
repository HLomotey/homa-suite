import { supabase } from './client';
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
    const permissions = data.role_permissions?.map((rp: any) => rp.permission) || [];
    
    return {
      ...data,
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
    const { permission_ids, ...roleInfo } = roleData;
    
    // Create role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert([roleInfo])
      .select()
      .single();
    
    if (roleError) throw roleError;

    // Add permissions to role
    if (permission_ids.length > 0) {
      const rolePermissions = permission_ids.map(permissionId => ({
        role_id: role.id,
        permission_id: permissionId
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);
      
      if (permError) throw permError;
    }
    
    return role;
  },

  // Update role
  async update(id: string, roleData: UpdateRoleRequest): Promise<Role> {
    const { permission_ids, ...roleInfo } = roleData;
    
    // Update role info
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .update({ ...roleInfo, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (roleError) throw roleError;

    // Update permissions if provided
    if (permission_ids) {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id);

      // Add new permissions
      if (permission_ids.length > 0) {
        const rolePermissions = permission_ids.map(permissionId => ({
          role_id: id,
          permission_id: permissionId
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);
        
        if (permError) throw permError;
      }
    }
    
    return role;
  },

  // Delete role
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
        profiles:profiles!user_id(name, avatar)
      `)
      .eq('role_id', roleId);
    
    if (error) throw error;
    
    // Transform the data to match UserWithRoles structure
    return (data || []).map((item: any) => ({
      id: item.user.id,
      email: item.user.email,
      name: item.profiles?.name || '',
      avatar: item.profiles?.avatar || '',
      is_primary_role: item.is_primary
    }));
  },
  // Get user's roles
  async getUserRoles(userId: string): Promise<UserWithRoles | null> {
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select(`
        id,
        email,
        user_roles:user_roles(
          *,
          role:roles(*)
        )
      `)
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    if (!userData) return null;

    // Find primary role
    const primaryRole = userData.user_roles.find((ur: any) => ur.is_primary)?.role;
    
    return {
      ...userData,
      primary_role: primaryRole
    };
  },

  // Assign role to user
  async assignRole(data: AssignRoleRequest): Promise<void> {
    const { user_id, role_id, is_primary } = data;
    
    // If setting as primary, update all other roles to not primary
    if (is_primary) {
      await supabase
        .from('user_roles')
        .update({ is_primary: false })
        .eq('user_id', user_id);
    }

    // Insert or update the role assignment
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id,
        role_id,
        is_primary: is_primary || false,
        assigned_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);
    
    if (error) throw error;
  },

  // Update user's roles
  async updateUserRoles(data: UpdateUserRolesRequest): Promise<void> {
    const { user_id, role_ids, primary_role_id } = data;
    
    try {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id);
        
      if (deleteError) throw deleteError;

      // Add new roles
      if (role_ids.length > 0) {
        const userRoles = role_ids.map(roleId => ({
          user_id,
          role_id: roleId,
          is_primary: roleId === primary_role_id,
          assigned_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(userRoles);
        
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }
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
    const { user_id, permissions } = data;
    
    // Delete existing custom permissions for this user
    await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', user_id);

    // Insert new custom permissions
    if (permissions.length > 0) {
      const userPermissions = permissions.map(perm => ({
        user_id,
        permission_id: perm.permission_id,
        is_granted: perm.is_granted,
        expires_at: perm.expires_at,
        granted_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_permissions')
        .insert(userPermissions);
      
      if (error) throw error;
    }
  },

  // Grant permission to user
  async grantPermission(userId: string, permissionId: string, expiresAt?: string): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        permission_id: permissionId,
        is_granted: true,
        expires_at: expiresAt,
        granted_at: new Date().toISOString()
      });
    
    if (error) throw error;
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
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId);
    
    if (error) throw error;
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
