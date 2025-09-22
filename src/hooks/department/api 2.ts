/**
 * Department API functions for Supabase integration
 * These functions handle direct communication with Supabase for department data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Department,
  FrontendDepartment,
  mapDatabaseDepartmentToFrontend
} from "../../integration/supabase/types";

/**
 * Fetch all departments from Supabase
 * @returns Promise with array of departments
 */
export const fetchDepartments = async (): Promise<FrontendDepartment[]> => {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments:", error);
    throw new Error(error.message);
  }

  return (data as Department[]).map(mapDatabaseDepartmentToFrontend);
};

/**
 * Fetch a single department by ID
 * @param id Department ID
 * @returns Promise with department data
 */
export const fetchDepartmentById = async (
  id: string
): Promise<FrontendDepartment> => {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching department with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseDepartmentToFrontend(data as Department);
};

/**
 * Create a new department
 * @param department Department data to create
 * @returns Promise with created department data
 */
export const createDepartment = async (
  department: Omit<FrontendDepartment, "id">
): Promise<FrontendDepartment> => {
  // Convert frontend department to database format
  const dbDepartment = {
    name: department.name,
    description: department.description || null
  };

  const { data, error } = await supabase
    .from("departments")
    .insert(dbDepartment)
    .select()
    .single();

  if (error) {
    console.error("Error creating department:", error);
    throw new Error(error.message);
  }

  return mapDatabaseDepartmentToFrontend(data as Department);
};

/**
 * Update an existing department
 * @param id Department ID
 * @param department Department data to update
 * @returns Promise with updated department data
 */
export const updateDepartment = async (
  id: string,
  department: Partial<Omit<FrontendDepartment, "id">>
): Promise<FrontendDepartment> => {
  // Convert frontend department to database format
  const dbDepartment: any = {};
  
  if (department.name !== undefined) dbDepartment.name = department.name;
  if (department.description !== undefined) dbDepartment.description = department.description || null;

  const { data, error } = await supabase
    .from("departments")
    .update(dbDepartment)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating department with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseDepartmentToFrontend(data as Department);
};

/**
 * Delete a department
 * @param id Department ID
 * @returns Promise with success status
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting department with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Search departments by name
 * @param searchTerm Search term to filter departments by name
 * @returns Promise with array of departments matching the search term
 */
export const searchDepartmentsByName = async (
  searchTerm: string
): Promise<FrontendDepartment[]> => {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error searching departments with term ${searchTerm}:`, error);
    throw new Error(error.message);
  }

  return (data as Department[]).map(mapDatabaseDepartmentToFrontend);
};
