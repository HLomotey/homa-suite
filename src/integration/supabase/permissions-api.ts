import { supabase } from './client';
import {
  Module,
  Action,
  Permission,
  Role,
  RolePermission,
  UserPermission,
  PermissionWithDetails,
  RoleWithPermissions,
  UserPermissionSummary,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateModuleRequest,
  UpdateModuleRequest,
  UpdateUserPermissionsRequest
} from './permissions-types';

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
  },

  // Create new module
  async create(moduleData: CreateModuleRequest): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update module
  async update(id: string, moduleData: UpdateModuleRequest): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .update({ ...moduleData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete module
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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

// User Permissions API
export const userPermissionsApi = {
  // Get user's effective permissions (role + custom permissions)
  async getUserPermissions(userId: string): Promise<UserPermissionSummary | null> {
    // Get user's role and role permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        role
      `)
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    if (!userData) return null;

    // Get role details and permissions separately
    const { data: roleData, error: roleError } = await supabase
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
      .eq('name', userData.role)
      .eq('is_active', true)
      .single();
    
    if (roleError && roleError.code !== 'PGRST116') throw roleError;

    // Get user's custom permissions
    const { data: customPermissions, error: customError } = await supabase
      .from('user_permissions')
      .select(`
        *,
        permission:permissions(
          *,
          module:modules(*),
          action:actions(*)
        )
      `)
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()'); // Only non-expired permissions
    
    if (customError) throw customError;

    // Process role permissions
    const rolePermissions = roleData?.role_permissions?.map((rp: any) => rp.permission) || [];
    
    // Calculate effective permissions
    const effectivePermissions = new Set<string>();
    
    // Add role permissions
    rolePermissions.forEach((perm: any) => {
      effectivePermissions.add(perm.permission_key);
    });
    
    // Apply custom permissions (grants and denials)
    (customPermissions || []).forEach((userPerm: any) => {
      if (userPerm.is_granted) {
        effectivePermissions.add(userPerm.permission.permission_key);
      } else {
        effectivePermissions.delete(userPerm.permission.permission_key);
      }
    });

    return {
      user_id: userId,
      role: roleData || { name: 'guest', display_name: 'Guest', id: '', description: '', is_system_role: true, is_active: true, sort_order: 999, created_at: '', updated_at: '' },
      role_permissions: rolePermissions,
      custom_permissions: customPermissions || [],
      effective_permissions: Array.from(effectivePermissions)
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
        expires_at: perm.expires_at
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
        expires_at: expiresAt
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
        is_granted: false
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

// Main function to get effective permissions for a user (simplified for the hook)
export interface UserEffectivePermissions {
  userId: string;
  rolePermissions: string[];
  customPermissions: Array<{
    permission: string;
    granted: boolean;
    expiresAt?: string;
  }>;
  effectivePermissions: string[];
}

export interface PermissionsApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export const getUserEffectivePermissions = async (userId: string): Promise<PermissionsApiResponse<UserEffectivePermissions>> => {
  try {
    // Get user profile with role information
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle missing records
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { data: null, error: profileError };
    }

    if (!profileData) {
      console.warn(`No profile found for user ID: ${userId}`);
      return {
        data: {
          userId,
          rolePermissions: [],
          customPermissions: [],
          effectivePermissions: []
        },
        error: null
      };
    }

    // Handle admin role with "all" permissions
    let effectivePermissions: string[] = [];
    
    if (profileData.role?.permissions?.includes('all')) {
      // Admin has all permissions - generate comprehensive permission list
      effectivePermissions = [
        // Dashboard permissions
        'dashboard:view', 'dashboard:edit', 'dashboard:create', 'dashboard:delete',
        // Properties permissions
        'properties:view', 'properties:edit', 'properties:create', 'properties:delete',
        // Transport permissions
        'transport:view', 'transport:edit', 'transport:create', 'transport:delete',
        // HR permissions
        'hr:view', 'hr:edit', 'hr:create', 'hr:delete',
        // Finance permissions
        'finance:view', 'finance:edit', 'finance:create', 'finance:delete',
        // Operations permissions
        'operations:view', 'operations:edit', 'operations:create', 'operations:delete',
        // Staff permissions
        'staff:view', 'staff:edit', 'staff:create', 'staff:delete',
        // Billing permissions
        'billing:view', 'billing:edit', 'billing:create', 'billing:delete',
        // Users permissions
        'users:view', 'users:edit', 'users:create', 'users:delete',
        // Uploads permissions
        'uploads:view', 'uploads:edit', 'uploads:create', 'uploads:delete',
        // Attendance permissions
        'attendance:view', 'attendance:edit', 'attendance:create', 'attendance:delete',
        // Payroll permissions
        'payroll:view', 'payroll:edit', 'payroll:create', 'payroll:delete',
        // Settings permissions
        'settings:view', 'settings:edit', 'settings:create', 'settings:delete',
        // Global permissions
        '*:view', '*:edit', '*:create', '*:delete', '*:*'
      ];
    } else if (profileData.role?.permissions) {
      // Use role-specific permissions
      effectivePermissions = profileData.role.permissions;
    }

    return {
      data: {
        userId,
        rolePermissions: profileData.role?.permissions || [],
        customPermissions: [], // TODO: Implement custom permissions if needed
        effectivePermissions
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getUserEffectivePermissions:', error);
    return { data: null, error: error as Error };
  }
};
