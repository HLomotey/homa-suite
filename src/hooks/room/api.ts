/**
 * Room API functions for Supabase integration
 * These functions handle direct communication with Supabase for room data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Room,
  FrontendRoom,
  RoomStatus,
  RoomType,
  mapDatabaseRoomToFrontend
} from "../../integration/supabase/types";

/**
 * Fetch all rooms from Supabase
 * @returns Promise with array of rooms
 */
export const fetchRooms = async (): Promise<FrontendRoom[]> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching rooms:", error);
    throw new Error(error.message);
  }

  return (data as Room[]).map(mapDatabaseRoomToFrontend);
};

/**
 * Fetch a single room by ID
 * @param id Room ID
 * @returns Promise with room data
 */
export const fetchRoomById = async (
  id: string
): Promise<FrontendRoom> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching room with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoomToFrontend(data as Room);
};

/**
 * Fetch rooms by property ID
 * @param propertyId Property ID to filter by
 * @returns Promise with array of rooms
 */
export const fetchRoomsByPropertyId = async (
  propertyId: string
): Promise<FrontendRoom[]> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("property_id", propertyId)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching rooms for property ${propertyId}:`, error);
    throw new Error(error.message);
  }

  return (data as Room[]).map(mapDatabaseRoomToFrontend);
};

/**
 * Fetch rooms by status
 * @param status Room status to filter by
 * @returns Promise with array of rooms
 */
export const fetchRoomsByStatus = async (
  status: RoomStatus
): Promise<FrontendRoom[]> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("status", status)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching rooms with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Room[]).map(mapDatabaseRoomToFrontend);
};

/**
 * Fetch rooms by type
 * @param type Room type to filter by
 * @returns Promise with array of rooms
 */
export const fetchRoomsByType = async (
  type: RoomType
): Promise<FrontendRoom[]> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("type", type)
    .order("name", { ascending: true });

  if (error) {
    console.error(`Error fetching rooms with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as Room[]).map(mapDatabaseRoomToFrontend);
};

/**
 * Create a new room
 * @param room Room data to create
 * @returns Promise with created room data
 */
export const createRoom = async (
  room: Omit<FrontendRoom, "id">
): Promise<FrontendRoom> => {
  // Convert frontend room to database format
  const dbRoom = {
    name: room.name,
    property_id: room.propertyId,
    property_name: room.propertyName,
    type: room.type,
    status: room.status,
    area: room.area,
    occupants: room.occupants,
    max_occupants: room.maxOccupants,
    price: room.price,
    date_available: room.dateAvailable,
  };

  const { data, error } = await supabase
    .from("rooms")
    .insert(dbRoom)
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    throw new Error(error.message);
  }

  return mapDatabaseRoomToFrontend(data as Room);
};

/**
 * Update an existing room
 * @param id Room ID
 * @param room Room data to update
 * @returns Promise with updated room data
 */
export const updateRoom = async (
  id: string,
  room: Partial<Omit<FrontendRoom, "id">>
): Promise<FrontendRoom> => {
  // Convert frontend room to database format
  const dbRoom: any = {};
  
  if (room.name !== undefined) dbRoom.name = room.name;
  if (room.propertyId !== undefined) dbRoom.property_id = room.propertyId;
  if (room.propertyName !== undefined) dbRoom.property_name = room.propertyName;
  if (room.type !== undefined) dbRoom.type = room.type;
  if (room.status !== undefined) dbRoom.status = room.status;
  if (room.area !== undefined) dbRoom.area = room.area;
  if (room.occupants !== undefined) dbRoom.occupants = room.occupants;
  if (room.maxOccupants !== undefined) dbRoom.max_occupants = room.maxOccupants;
  if (room.price !== undefined) dbRoom.price = room.price;
  if (room.dateAvailable !== undefined) dbRoom.date_available = room.dateAvailable;

  const { data, error } = await supabase
    .from("rooms")
    .update(dbRoom)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating room with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoomToFrontend(data as Room);
};

/**
 * Delete a room
 * @param id Room ID
 * @returns Promise with success status
 */
export const deleteRoom = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting room with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Update room status
 * @param id Room ID
 * @param status New room status
 * @returns Promise with updated room data
 */
export const updateRoomStatus = async (
  id: string,
  status: RoomStatus
): Promise<FrontendRoom> => {
  const { data, error } = await supabase
    .from("rooms")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating status for room with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoomToFrontend(data as Room);
};

/**
 * Update room occupants
 * @param id Room ID
 * @param occupants New occupant count
 * @returns Promise with updated room data
 */
export const updateRoomOccupants = async (
  id: string,
  occupants: number
): Promise<FrontendRoom> => {
  const { data, error } = await supabase
    .from("rooms")
    .update({ occupants })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating occupants for room with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseRoomToFrontend(data as Room);
};
