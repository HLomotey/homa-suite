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
    // Use RPC function to bypass RLS issues
    const { error } = await supabaseAdmin.rpc('update_role_modules', {
      input_role_id: roleId,
      input_module_ids: moduleIds
    });

    if (error) {
      console.error('Error updating role modules via RPC:', error);
      throw error;
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
    // Direct SQL query to bypass RLS issues
    const { data, error } = await supabaseAdmin.rpc('get_user_modules', {
      input_user_id: userId
    });

    if (error) {
      console.error('Error fetching user modules via RPC:', error);
      // Fallback to direct query
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role_id')
        .eq('id', userId)
        .single();

      if (profileError || !profileData?.role_id) {
        console.log('User has no role assigned or profile not found');
        return [];
      }

      // Get modules for the user's role
      const { data: moduleData, error: moduleError } = await supabaseAdmin
        .from('role_modules')
        .select('module_id')
        .eq('role_id', profileData.role_id);

      if (moduleError) {
        console.error('Error fetching role modules:', moduleError);
        return [];
      }

      const modules = moduleData?.map(rm => rm.module_id) || [];
      console.log(`User ${userId} has modules (fallback):`, modules);
      return modules;
    }

    console.log(`User ${userId} has modules (RPC):`, data || []);
    return data || [];
  } catch (error) {
    console.error('Error in getUserModules:', error);
    return [];
  }
};
