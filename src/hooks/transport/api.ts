/**
 * Transport API functions for Supabase integration
 * These functions handle direct communication with Supabase for transport data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Vehicle,
  TransportStaff,
  TransportStats,
  FrontendVehicle,
  FrontendTransportStaff,
  FrontendTransportStats,
  mapDatabaseVehicleToFrontend,
  mapDatabaseTransportStaffToFrontend,
  mapDatabaseTransportStatsToFrontend,
  VehicleStatus,
  VehicleType
} from "../../integration/supabase/types";

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
  const dbVehicle = {
    staff_id: vehicle.staffId,
    model: vehicle.model,
    plate_number: vehicle.plateNumber,
    status: vehicle.status,
    last_service: vehicle.lastService,
    type: vehicle.type
  };

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
  const dbVehicle: any = {};
  
  if (vehicle.staffId !== undefined) dbVehicle.staff_id = vehicle.staffId;
  if (vehicle.model !== undefined) dbVehicle.model = vehicle.model;
  if (vehicle.plateNumber !== undefined) dbVehicle.plate_number = vehicle.plateNumber;
  if (vehicle.status !== undefined) dbVehicle.status = vehicle.status;
  if (vehicle.lastService !== undefined) dbVehicle.last_service = vehicle.lastService;
  if (vehicle.type !== undefined) dbVehicle.type = vehicle.type;

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
  status: VehicleStatus
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

/**
 * Fetch vehicles by type
 * @param type Vehicle type to filter by
 * @returns Promise with array of vehicles
 */
export const fetchVehiclesByType = async (
  type: VehicleType
): Promise<FrontendVehicle[]> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching vehicles with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as Vehicle[]).map(mapDatabaseVehicleToFrontend);
};

/**
 * Fetch all transport staff
 * @returns Promise with array of transport staff
 */
export const fetchTransportStaff = async (): Promise<FrontendTransportStaff[]> => {
  const { data, error } = await supabase
    .from("transport_staff")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transport staff:", error);
    throw new Error(error.message);
  }

  return (data as TransportStaff[]).map(mapDatabaseTransportStaffToFrontend);
};

/**
 * Fetch transport stats
 * @returns Promise with transport stats
 */
export const fetchTransportStats = async (): Promise<FrontendTransportStats> => {
  const { data, error } = await supabase
    .from("transport_stats")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching transport stats:", error);
    throw new Error(error.message);
  }

  return mapDatabaseTransportStatsToFrontend(data as TransportStats);
};
