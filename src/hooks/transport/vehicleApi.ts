/**
 * Vehicle API functions for Supabase integration
 * These functions handle direct communication with Supabase for vehicle data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Vehicle,
  FrontendVehicle,
  mapDatabaseVehicleToFrontend,
  mapFrontendVehicleToDatabase
} from "../../integration/supabase/types/vehicle";

/**
 * Fetch all vehicles from Supabase
 * @returns Promise with array of vehicles
 */
export const fetchVehicles = async (): Promise<FrontendVehicle[]> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vehicles:", error);
    throw new Error(error.message);
  }

  return (data as Vehicle[]).map(mapDatabaseVehicleToFrontend);
};

/**
 * Fetch a single vehicle by ID
 * @param id Vehicle ID
 * @returns Promise with vehicle data
 */
export const fetchVehicleById = async (
  id: string
): Promise<FrontendVehicle> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseVehicleToFrontend(data as Vehicle);
};

/**
 * Create a new vehicle
 * @param vehicle Vehicle data to create
 * @returns Promise with created vehicle data
 */
export const createVehicle = async (
  vehicle: Omit<FrontendVehicle, "id">
): Promise<FrontendVehicle> => {
  // Convert frontend vehicle to database format
  const dbVehicle = mapFrontendVehicleToDatabase(vehicle as FrontendVehicle);

  const { data, error } = await supabase
    .from("vehicles")
    .insert(dbVehicle)
    .select()
    .single();

  if (error) {
    console.error("Error creating vehicle:", error);
    throw new Error(error.message);
  }

  return mapDatabaseVehicleToFrontend(data as Vehicle);
};

/**
 * Update an existing vehicle
 * @param id Vehicle ID
 * @param vehicle Vehicle data to update
 * @returns Promise with updated vehicle data
 */
export const updateVehicle = async (
  id: string,
  vehicle: Partial<Omit<FrontendVehicle, "id">>
): Promise<FrontendVehicle> => {
  // Convert frontend vehicle to database format
  const fullVehicle = { ...vehicle, id } as FrontendVehicle;
  const dbVehicle = mapFrontendVehicleToDatabase(fullVehicle);

  // Remove id from the update payload
  delete dbVehicle.id;

  const { data, error } = await supabase
    .from("vehicles")
    .update(dbVehicle)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating vehicle with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseVehicleToFrontend(data as Vehicle);
};

/**
 * Delete a vehicle
 * @param id Vehicle ID
 * @returns Promise with success status
 */
export const deleteVehicle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch vehicles by status
 * @param status Vehicle status to filter by
 * @returns Promise with array of vehicles
 */
export const fetchVehiclesByStatus = async (
  status: string
): Promise<FrontendVehicle[]> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching vehicles with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Vehicle[]).map(mapDatabaseVehicleToFrontend);
};
