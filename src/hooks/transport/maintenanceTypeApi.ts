/**
 * Maintenance Type API functions for Supabase integration
 * These functions handle direct communication with Supabase for maintenance type data
 */

import { supabase } from "../../integration/supabase/client";
import {
  MaintenanceType,
  FrontendMaintenanceType,
  mapDatabaseMaintenanceTypeToFrontend,
  mapFrontendMaintenanceTypeToDatabase
} from "../../integration/supabase/types/maintenance-type";

/**
 * Fetch all maintenance types from Supabase
 * @returns Promise with array of maintenance types
 */
export const fetchMaintenanceTypes = async (): Promise<FrontendMaintenanceType[]> => {
  const { data, error } = await supabase
    .from("maintenance_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching maintenance types:", error);
    throw new Error(error.message);
  }

  return (data as MaintenanceType[]).map(mapDatabaseMaintenanceTypeToFrontend);
};

/**
 * Fetch a single maintenance type by ID
 * @param id Maintenance Type ID
 * @returns Promise with maintenance type data
 */
export const fetchMaintenanceTypeById = async (
  id: string
): Promise<FrontendMaintenanceType> => {
  const { data, error } = await supabase
    .from("maintenance_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching maintenance type with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseMaintenanceTypeToFrontend(data as MaintenanceType);
};

/**
 * Create a new maintenance type
 * @param maintenanceType Maintenance type data to create
 * @returns Promise with created maintenance type data
 */
export const createMaintenanceType = async (
  maintenanceType: Omit<FrontendMaintenanceType, "id">
): Promise<FrontendMaintenanceType> => {
  // Convert frontend maintenance type to database format
  const dbMaintenanceType = mapFrontendMaintenanceTypeToDatabase(maintenanceType as FrontendMaintenanceType);

  const { data, error } = await supabase
    .from("maintenance_types")
    .insert(dbMaintenanceType)
    .select()
    .single();

  if (error) {
    console.error("Error creating maintenance type:", error);
    throw new Error(error.message);
  }

  return mapDatabaseMaintenanceTypeToFrontend(data as MaintenanceType);
};

/**
 * Update an existing maintenance type
 * @param id Maintenance Type ID
 * @param maintenanceType Maintenance type data to update
 * @returns Promise with updated maintenance type data
 */
export const updateMaintenanceType = async (
  id: string,
  maintenanceType: Partial<Omit<FrontendMaintenanceType, "id">>
): Promise<FrontendMaintenanceType> => {
  // Convert frontend maintenance type to database format
  const fullMaintenanceType = { ...maintenanceType, id } as FrontendMaintenanceType;
  const dbMaintenanceType = mapFrontendMaintenanceTypeToDatabase(fullMaintenanceType);

  // Remove id from the update payload
  const { id: _, ...updatePayload } = dbMaintenanceType;

  const { data, error } = await supabase
    .from("maintenance_types")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating maintenance type with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseMaintenanceTypeToFrontend(data as MaintenanceType);
};

/**
 * Delete a maintenance type
 * @param id Maintenance Type ID
 * @returns Promise with success status
 */
export const deleteMaintenanceType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("maintenance_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting maintenance type with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch maintenance types by category
 * @param category Category to filter by
 * @returns Promise with array of maintenance types
 */
export const fetchMaintenanceTypesByCategory = async (
  category: string
): Promise<FrontendMaintenanceType[]> => {
  const { data, error } = await supabase
    .from("maintenance_types")
    .select("*")
    .eq("category", category)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching maintenance types with category ${category}:`, error);
    throw new Error(error.message);
  }

  return (data as MaintenanceType[]).map(mapDatabaseMaintenanceTypeToFrontend);
};
