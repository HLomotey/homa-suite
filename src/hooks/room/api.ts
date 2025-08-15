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
import { toast } from "sonner";

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

/**
 * Bulk import rooms from Excel data
 * @param roomsData Array of room data from Excel import
 * @returns Promise with array of created rooms and any errors
 */
export const bulkImportRooms = async (
  roomsData: any[]
): Promise<{ success: FrontendRoom[]; errors: string[] }> => {
  // EXTREMELY PROMINENT LOGGING
  console.log("%c 🔴 BULK IMPORT ROOMS API FUNCTION CALLED 🔴 ", "background: #ff0000; color: white; font-size: 24px; font-weight: bold; padding: 10px;");
  console.log("%c This log is from the API function in src/hooks/room/api.ts ", "background: #333; color: yellow; font-size: 16px;");
  
  // Using the existing supabase client from the imported module
  const results: { success: FrontendRoom[]; errors: string[] } = {
    success: [],
    errors: []
  };

  console.log("=== BULK IMPORT ROOMS START ===");
  console.log(`Attempting to process ${roomsData.length} room records`);
  console.log("First room data sample:", roomsData[0]);
  console.log("Available fields:", roomsData[0] ? Object.keys(roomsData[0]) : "No data");
  
  // Check if we have any data
  if (!roomsData || roomsData.length === 0) {
    console.error("No room data provided for import");
    results.errors.push("No room data provided for import");
    return results;
  }

  // First, create a map to track properties that need to be created
  const propertiesToCreate = new Map<string, { id: string, name: string }>(); 

  // Process each room entry to identify unique properties
  for (const roomData of roomsData) {
    try {
      // Validate required fields - Room Name is mandatory, but Property ID can be generated if missing
      if (!roomData['Room Name']) {
        console.error("Missing Room Name:", roomData);
        results.errors.push(`Missing required field: Room Name for record ${JSON.stringify(roomData)}`);
        continue;
      }
      
      // Generate a property ID if it's missing but Property Name is provided
      if (!roomData['Property ID'] && roomData['Property Name']) {
        // Create a valid UUID for the property ID
        const uuid = crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        
        roomData['Property ID'] = uuid;
        console.log(`Generated UUID Property ID ${roomData['Property ID']} for ${roomData['Property Name']}`);
      } else if (!roomData['Property ID']) {
        // If neither Property ID nor Property Name is provided
        console.error("Missing Property ID and no Property Name to generate one:", roomData);
        results.errors.push(`Missing Property ID and no Property Name to generate one for room ${roomData['Room Name']}`);
        continue;
      } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomData['Property ID'])) {
        // If Property ID is provided but not in UUID format, convert it to UUID
        console.warn(`Property ID ${roomData['Property ID']} is not in UUID format, generating a new UUID`);
        roomData['Property ID'] = crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        console.log(`Converted to UUID Property ID: ${roomData['Property ID']}`);
      }
      
      // Add property to the map if it has a name
      if (roomData['Property Name'] && roomData['Property ID']) {
        propertiesToCreate.set(roomData['Property ID'], {
          id: roomData['Property ID'],
          name: roomData['Property Name']
        });
      }
    } catch (error) {
      console.error('Error processing property data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(errorMessage);
    }
  }

  // Create or verify properties first
  console.log(`Found ${propertiesToCreate.size} unique properties to verify/create`);
  for (const [propertyId, propertyData] of propertiesToCreate.entries()) {
    try {
      // Check if property already exists
      const { data: existingProperty, error: queryError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .maybeSingle();

      if (queryError) {
        console.error(`Error checking if property ${propertyId} exists:`, queryError);
        results.errors.push(`Error checking property ${propertyData.name}: ${queryError.message}`);
        continue;
      }

      if (!existingProperty) {
        // Property doesn't exist, create it
        console.log(`Creating new property: ${propertyData.name} with ID: ${propertyId}`);
        
        const dbProperty = {
          id: propertyId,
          title: propertyData.name,
          address: propertyData.name, // Using name as address as a fallback
          price: 0,
          bedrooms: 0,
          bathrooms: 0,
          area: 0,
          type: 'Apartment', // Default type
          status: 'Available', // Default status
          image: '', // Empty image
          description: `Auto-generated property for ${propertyData.name}`,
          date_added: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('properties')
          .insert(dbProperty);

        if (insertError) {
          console.error(`Error creating property ${propertyData.name}:`, insertError);
          results.errors.push(`Error creating property ${propertyData.name}: ${insertError.message}`);
          continue;
        }
        
        console.log(`Successfully created property: ${propertyData.name}`);
      } else {
        console.log(`Property ${propertyData.name} already exists with ID: ${propertyId}`);
      }
    } catch (error) {
      console.error(`Error processing property ${propertyData.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Error with property ${propertyData.name}: ${errorMessage}`);
    }
  }

  // Now process each room entry after properties have been created
  for (const roomData of roomsData) {
    try {
      // Skip rooms that don't have the required fields (already validated above)
      if (!roomData['Room Name'] || !roomData['Property ID']) {
        continue;
      }
      
      // Convert Excel data format to database format
      const dbRoom = {
        name: roomData['Room Name'],
        property_id: roomData['Property ID'],
        property_name: roomData['Property Name'] || '',
        type: roomData['Room Type'] || 'Single',  // Using 'type' to match the database schema
        status: roomData['Status'] || 'Available',
        area: parseFloat(roomData['Area (sq ft)']) || 0,
        occupants: parseInt(roomData['Current Occupants']) || 0,  // Using 'occupants' to match the database schema
        max_occupants: parseInt(roomData['Max Occupants']) || 0,
        price: parseFloat(roomData['Price']) || 0,
        date_available: roomData['Date Available'] || new Date().toISOString().split('T')[0]
      };
      
      console.log("Processed room data for database insertion:", dbRoom);
      console.log(`Processing room: ${dbRoom.name}, Property ID: ${dbRoom.property_id}`);

      // Check if room already exists (by name and property ID)
      const { data: existingRoom, error: queryError } = await supabase
        .from('rooms')
        .select('id')
        .eq('name', dbRoom.name)
        .eq('property_id', dbRoom.property_id)
        .maybeSingle();

      if (queryError) {
        console.error("Error querying existing rooms:", queryError);
        throw queryError;
      }

      console.log(`Found ${existingRoom?.id ? 1 : 0} existing room matching name and property ID`);

      let result;

      if (existingRoom?.id) {
        // Update existing room
        console.log(`Updating existing room with ID: ${existingRoom.id}`);
        const { data, error } = await supabase
          .from('rooms')
          .update(dbRoom)
          .eq('id', existingRoom.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating room:", error);
          throw new Error(`Error updating room ${dbRoom.name}: ${error.message}`);
        }
        result = data;
        console.log("Update result:", result);
      } else {
        // Insert new room
        console.log("Inserting new room");
        const { data, error } = await supabase
          .from('rooms')
          .insert(dbRoom)
          .select()
          .single();

        if (error) {
          console.error("Error inserting room:", error);
          throw new Error(`Error creating room ${dbRoom.name}: ${error.message}`);
        }
        result = data;
        console.log("Insert result:", result);
      }

      results.success.push(mapDatabaseRoomToFrontend(result as Room));
    } catch (error) {
      console.error('Error processing room import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(errorMessage);
    }
  }

  return results;
};
