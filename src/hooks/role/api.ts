/**
 * Role API functions for Supabase integration
 * These functions handle direct communication with Supabase for role data
 */

import { supabase } from "../../integration/supabase/client";
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
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    throw new Error(error.message);
  }

  return (data as Role[]).map(mapDatabaseRoleToFrontend);
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
    description: role.description,
    permissions: role.permissions || null
  };

  const { data, error } = await supabase
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
  
  if (role.name !== undefined) dbRole.name = role.name;
  if (role.description !== undefined) dbRole.description = role.description;
  if (role.permissions !== undefined) dbRole.permissions = role.permissions;

  const { data, error } = await supabase
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
  const { error } = await supabase
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
  const { data, error } = await supabase
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
