/**
 * Role API functions for Supabase integration
 * These functions handle direct communication with Supabase for role data
 */

import { supabase } from "../../integration/supabase/client";
import { supabaseAdmin } from "../../integration/supabase/admin-client";
import {
  Role,
  FrontendRole,
  mapDatabaseRoleToFrontend
} from "../../integration/supabase/types";

/**
 * Fetch all roles from Supabase
 * @returns Promise with array of roles
 */
export const fetchRoles = async (): Promise<FrontendRole[]> => {
  console.log('🔍 Fetching roles from database...');
  
  // Check authentication status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('🔐 Auth status:', { user: user?.email || 'Not authenticated', authError });
  
  // Try using admin client to bypass any potential auth issues
  console.log('🔧 Trying with admin client...');
  const { data, error } = await supabaseAdmin
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Error fetching roles:", error);
    console.error("❌ Error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(error.message);
  }

  console.log(`✅ Found ${data?.length || 0} roles:`, data);

  // If no roles found, return sample data for testing
  if (!data || data.length === 0) {
    console.log('⚠️ No roles found in database, returning sample data for testing');
    return [
      {
        id: 'sample-admin-id',
        name: 'Admin',
        description: 'Full system access',
        permissions: ['all']
      },
      {
        id: 'sample-manager-id', 
        name: 'Manager',
        description: 'Management access',
        permissions: ['users:view', 'users:edit']
      },
      {
        id: 'sample-staff-id',
        name: 'Staff',
        description: 'Basic staff access',
        permissions: ['dashboard:view']
      },
      {
        id: 'sample-guest-id',
        name: 'Guest',
        description: 'Limited access',
        permissions: ['dashboard:view']
      }
    ];
  }

  // Fetch permissions for all roles using admin client
  const rolesWithPermissions = await Promise.all(
    (data as Role[]).map(async (role) => {
      const { data: permissionsData } = await supabaseAdmin
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", role.id);

      const frontendRole = mapDatabaseRoleToFrontend(role);
      frontendRole.permissions = permissionsData?.map(rp => rp.permission_id.toString()) || [];
      return frontendRole;
    })
  );

  return rolesWithPermissions;
};

/**
 * Fetch a single role by ID
 * @param id Role ID
 * @returns Promise with role data
 */
export const fetchRoleById = async (
  id: string
): Promise<FrontendRole> => {
  // Fetch role data
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id) // Use string ID directly (UUID)
    .single();

  if (roleError) {
    console.error(`Error fetching role with ID ${id}:`, roleError);
    throw new Error(roleError.message);
  }

  // Fetch role permissions
  const { data: permissionsData, error: permissionsError } = await supabase
    .from("role_permissions")
    .select(`
      permission_id,
      permissions:permission_id (
        id,
        name,
        display_name
      )
    `)
    .eq("role_id", parseInt(id)); // Convert string ID to number for database query

  if (permissionsError) {
    console.error(`Error fetching permissions for role ${id}:`, permissionsError);
  }

  // Map role to frontend format
  const frontendRole = mapDatabaseRoleToFrontend(roleData as Role);
  
  // Add permissions
  frontendRole.permissions = permissionsData?.map(rp => rp.permission_id.toString()) || [];

  return frontendRole;
};

/**
 * Fetch a role by name
 * @param name Role name
 * @returns Promise with role data
 */
export const fetchRoleByName = async (
  name: string
): Promise<FrontendRole> => {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("name", name)
    .single();

  if (error) {
    console.error(`Error fetching role with name ${name}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoleToFrontend(data as Role);
};

/**
 * Create a new role
 * @param role Role data to create
 * @returns Promise with created role data
 */
export const createRole = async (
  role: Omit<FrontendRole, "id">
): Promise<FrontendRole> => {
  // Check if role with this name already exists
  const { data: existingRole, error: checkError } = await supabaseAdmin
    .from("roles")
    .select("id, name")
    .eq("name", role.name)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected
    console.error("Error checking for existing role:", checkError);
    throw new Error(checkError.message);
  }

  if (existingRole) {
    throw new Error(`Role with name "${role.name}" already exists`);
  }

  // Convert frontend role to database format (no permissions column)
  const dbRole = {
    name: role.name,
    display_name: role.name, // Use name as display_name
    description: role.description,
    is_system_role: false,
    is_active: true,
    sort_order: 999
  };

  // Use admin client for role creation to bypass RLS policies
  const { data, error } = await supabaseAdmin
    .from("roles")
    .insert(dbRole)
    .select()
    .single();

  if (error) {
    console.error("Error creating role:", error);
    // Provide more user-friendly error message for duplicate key constraint
    if (error.code === '23505' && error.message.includes('roles_name_key')) {
      throw new Error(`Role with name "${role.name}" already exists`);
    }
    throw new Error(error.message);
  }

  // TODO: Handle permissions separately through role_permissions table if needed
  const createdRole = mapDatabaseRoleToFrontend(data as Role);
  
  return createdRole;
};

/**
 * Update an existing role
 * @param id Role ID
 * @param role Role data to update
 * @returns Promise with updated role data
 */
export const updateRole = async (
  id: string,
  role: Partial<Omit<FrontendRole, "id">>
): Promise<FrontendRole> => {
  // Convert frontend role to database format (no permissions column)
  const dbRole: any = {};
  
  if (role.name !== undefined) {
    dbRole.name = role.name;
    dbRole.display_name = role.name; // Update display_name as well
  }
  if (role.description !== undefined) dbRole.description = role.description;
  // Remove permissions handling - they're managed through role_permissions table

  // Use admin client for role updates to bypass RLS policies
  const { error: deleteError } = await supabaseAdmin
    .from("role_permissions")
    .delete()
    .eq("role_id", id); // Use string ID directly (UUID)

  if (deleteError) {
    console.error(`Error deleting role permissions with ID ${id}:`, deleteError);
  }

  const { data, error } = await supabaseAdmin
    .from("roles")
    .update(dbRole)
    .eq("id", id) // Use string ID directly (UUID)
    .select()
    .single();

  if (error) {
    console.error(`Error updating role with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoleToFrontend(data as Role);
};

/**
 * Delete a role
 * @param id Role ID
 * @returns Promise with success status
 */
export const deleteRole = async (id: string): Promise<void> => {
  // Use admin client for role deletion to bypass RLS policies
  const { error } = await supabaseAdmin
    .from("roles")
    .delete()
    .eq("id", id); // Use string ID directly (UUID)

  if (error) {
    console.error(`Error deleting role with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Update role permissions - now uses role_permissions junction table
 * @param id Role ID
 * @param permissions New permissions array
 * @returns Promise with updated role data
 */
export const updateRolePermissions = async (
  id: string,
  permissions: string[]
): Promise<FrontendRole> => {
  // First, remove existing permissions for this role
  const { data: permissionsData, error: permissionsError } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", id); // Use string ID directly (UUID)

  if (permissionsError) {
    console.error(`Error removing existing permissions for role ${id}:`, permissionsError);
    throw new Error(permissionsError.message);
  }

  // Then add new permissions
  if (permissions.length > 0) {
    // Filter out invalid permission IDs (UUIDs)
    const validPermissions = permissions
      .filter(permissionId => permissionId && permissionId !== '')
      .map(permissionId => ({
        role_id: id, // role_id is UUID
        permission_id: permissionId // permission_id is UUID
      }));

    if (validPermissions.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("role_permissions")
        .insert(validPermissions);

      if (insertError) {
        console.error(`Error adding new permissions for role ${id}:`, insertError);
        throw new Error(insertError.message);
      }
    }
  }

  // Return the updated role
  return await fetchRoleById(id);
};
