import { supabase } from '../index';
import { Vehicle, FrontendVehicle, mapDatabaseVehicleToFrontend, mapFrontendVehicleToDatabase } from '../types/vehicle';

/**
 * Service for managing vehicles in the system
 */
export const VehicleService = {
  /**
   * Get all vehicles
   * @returns Promise with array of vehicles
   */
  getAllVehicles: async (): Promise<FrontendVehicle[]> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
      }

      return data ? data.map((vehicle: Vehicle) => mapDatabaseVehicleToFrontend(vehicle)) : [];
    } catch (err) {
      console.error('Error in getAllVehicles:', err);
      throw err;
    }
  },

  /**
   * Get a vehicle by ID
   * @param id - Vehicle ID
   * @returns Promise with vehicle data
   */
  getVehicleById: async (id: string): Promise<FrontendVehicle | null> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching vehicle with ID ${id}:`, error);
        throw error;
      }

      return data ? mapDatabaseVehicleToFrontend(data as Vehicle) : null;
    } catch (err) {
      console.error(`Error in getVehicleById for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new vehicle
   * @param vehicle - Vehicle data to create
   * @returns Promise with created vehicle data
   */
  createVehicle: async (vehicle: Omit<FrontendVehicle, 'id'>): Promise<FrontendVehicle> => {
    try {
      const dbVehicle = mapFrontendVehicleToDatabase(vehicle);
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert(dbVehicle)
        .select()
        .single();

      if (error) {
        console.error('Error creating vehicle:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating vehicle');
      }

      return mapDatabaseVehicleToFrontend(data as Vehicle);
    } catch (err) {
      console.error('Error in createVehicle:', err);
      throw err;
    }
  },

  /**
   * Update an existing vehicle
   * @param id - Vehicle ID
   * @param vehicle - Updated vehicle data
   * @returns Promise with updated vehicle data
   */
  updateVehicle: async (id: string, vehicle: Omit<FrontendVehicle, 'id'>): Promise<FrontendVehicle> => {
    try {
      const dbVehicle = mapFrontendVehicleToDatabase(vehicle);
      
      const { data, error } = await supabase
        .from('vehicles')
        .update(dbVehicle)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating vehicle with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating vehicle with ID ${id}`);
      }

      return mapDatabaseVehicleToFrontend(data as Vehicle);
    } catch (err) {
      console.error(`Error in updateVehicle for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a vehicle
   * @param id - Vehicle ID
   * @returns Promise with success status
   */
  deleteVehicle: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting vehicle with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteVehicle for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Get vehicles by location ID
   * @param locationId - Location ID
   * @returns Promise with array of vehicles
   */
  getVehiclesByLocation: async (locationId: string): Promise<FrontendVehicle[]> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching vehicles for location ${locationId}:`, error);
        throw error;
      }

      return data ? data.map((vehicle: Vehicle) => mapDatabaseVehicleToFrontend(vehicle)) : [];
    } catch (err) {
      console.error(`Error in getVehiclesByLocation for location ${locationId}:`, err);
      throw err;
    }
  },

  /**
   * Update vehicle status
   * @param id - Vehicle ID
   * @param status - New status
   * @returns Promise with updated vehicle data
   */
  updateVehicleStatus: async (id: string, status: string): Promise<FrontendVehicle> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating status for vehicle with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating status for vehicle with ID ${id}`);
      }

      return mapDatabaseVehicleToFrontend(data as Vehicle);
    } catch (err) {
      console.error(`Error in updateVehicleStatus for ID ${id}:`, err);
      throw err;
    }
  }
};

export default VehicleService;
