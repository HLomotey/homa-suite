import { supabaseAdmin } from '@/integration/supabase/client';

// Get modules assigned to a role
export const getRoleModules = async (roleId: string | number): Promise<string[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('role_modules')
      .select('module_id')
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role modules:', error);
      throw error;
    }

    return data?.map(item => item.module_id) || [];
  } catch (error) {
    console.error('Error in getRoleModules:', error);
    throw error;
  }
};

// Update modules for a role
export const updateRoleModules = async (roleId: string | number, moduleIds: string[]): Promise<void> => {
  try {
    // First, delete existing role modules
    const { error: deleteError } = await supabaseAdmin
      .from('role_modules')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      console.error('Error deleting existing role modules:', deleteError);
      throw deleteError;
    }

    // Then, insert new role modules
    if (moduleIds.length > 0) {
      const roleModules = moduleIds.map(moduleId => ({
        role_id: roleId,
        module_id: moduleId
      }));

      const { error: insertError } = await supabaseAdmin
        .from('role_modules')
        .insert(roleModules);

      if (insertError) {
        console.error('Error inserting role modules:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error in updateRoleModules:', error);
    throw error;
  }
};

// Get all users with their assigned modules
export const getUsersWithModules = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        roles!inner (
          id,
          name,
          role_modules (
            module_id
          )
        )
      `);

    if (error) {
      console.error('Error fetching users with modules:', error);
      throw error;
    }

    return data?.map(user => ({
      ...user,
      modules: user.roles && 'role_modules' in user.roles ? 
        (user.roles as any).role_modules?.map((rm: any) => rm.module_id) || [] : []
    })) || [];
  } catch (error) {
    console.error('Error in getUsersWithModules:', error);
    throw error;
  }
};

// Check if a user has access to a specific module
export const userHasModuleAccess = async (userId: string, moduleId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        roles!inner (
          role_modules!inner (
            module_id
          )
        )
      `)
      .eq('id', userId)
      .eq('roles.role_modules.module_id', moduleId)
      .limit(1);

    if (error) {
      console.error('Error checking module access:', error);
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error in userHasModuleAccess:', error);
    return false;
  }
};

// Get user's accessible modules
export const getUserModules = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        roles!inner (
          role_modules (
            module_id
          )
        )
      `)
      .eq('id', userId);

    if (error) {
      console.error('Error fetching user modules:', error);
      throw error;
    }

    const modules = new Set<string>();
    data?.forEach(profile => {
      if (profile.roles && 'role_modules' in profile.roles) {
        const roleModules = (profile.roles as any).role_modules;
        if (Array.isArray(roleModules)) {
          roleModules.forEach((rm: any) => {
            if (rm.module_id) {
              modules.add(rm.module_id);
            }
          });
        }
      }
    });

    return Array.from(modules);
  } catch (error) {
    console.error('Error in getUserModules:', error);
    throw error;
  }
};
