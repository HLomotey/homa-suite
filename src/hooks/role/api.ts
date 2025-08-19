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
  try {
    console.log("Attempting to fetch roles from database...");
    
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error fetching roles:", error);
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }

    console.log("Successfully fetched roles data:", data);
    
    if (!data || data.length === 0) {
      console.warn("No roles found in database");
      return [];
    }

    const mappedRoles = (data as Role[]).map(mapDatabaseRoleToFrontend);
    console.log("Mapped roles:", mappedRoles);
    
    return mappedRoles;
  } catch (error) {
    console.error("Error in fetchRoles:", error);
    throw error;
  }
};

/**
 * Fetch a single role by ID
 * @param id Role ID
 * @returns Promise with role data
 */
export const fetchRoleById = async (
  id: string
): Promise<FrontendRole> => {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching role with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoleToFrontend(data as Role);
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
  // Convert frontend role to database format
  const dbRole = {
    name: role.name,
    display_name: role.name, // Use name as display_name
    description: role.description,
    permissions: role.permissions || [],
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
    throw new Error(error.message);
  }

  return mapDatabaseRoleToFrontend(data as Role);
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
  // Convert frontend role to database format
  const dbRole: any = {};
  
  if (role.name !== undefined) {
    dbRole.name = role.name;
    dbRole.display_name = role.name; // Update display_name as well
  }
  if (role.description !== undefined) dbRole.description = role.description;
  if (role.permissions !== undefined) dbRole.permissions = role.permissions;

  // Use admin client for role updates to bypass RLS policies
  const { data, error } = await supabaseAdmin
    .from("roles")
    .update(dbRole)
    .eq("id", id)
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
    .eq("id", id);

  if (error) {
    console.error(`Error deleting role with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Update role permissions
 * @param id Role ID
 * @param permissions New permissions array
 * @returns Promise with updated role data
 */
export const updateRolePermissions = async (
  id: string,
  permissions: string[]
): Promise<FrontendRole> => {
  // Use admin client for role permission updates to bypass RLS policies
  const { data, error } = await supabaseAdmin
    .from("roles")
    .update({ permissions })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating permissions for role with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoleToFrontend(data as Role);
};
