import { supabase } from '../index';
import { 
  MaintenanceType, 
  FrontendMaintenanceType, 
  mapDatabaseMaintenanceTypeToFrontend 
} from '../types/maintenance-type';

/**
 * Service for managing maintenance types in the system
 */
export const MaintenanceTypeService = {
  /**
   * Get all maintenance types
   * @returns Promise with array of maintenance types
   */
  getAllMaintenanceTypes: async (): Promise<FrontendMaintenanceType[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching maintenance types:', error);
        throw error;
      }

      return data ? data.map((type: MaintenanceType) => mapDatabaseMaintenanceTypeToFrontend(type)) : [];
    } catch (err) {
      console.error('Error in getAllMaintenanceTypes:', err);
      throw err;
    }
  },

  /**
   * Get a maintenance type by ID
   * @param id - Maintenance type ID
   * @returns Promise with maintenance type data
   */
  getMaintenanceTypeById: async (id: string): Promise<FrontendMaintenanceType | null> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching maintenance type with ID ${id}:`, error);
        throw error;
      }

      return data ? mapDatabaseMaintenanceTypeToFrontend(data as MaintenanceType) : null;
    } catch (err) {
      console.error(`Error in getMaintenanceTypeById for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new maintenance type
   * @param maintenanceType - Maintenance type data to create
   * @returns Promise with created maintenance type data
   */
  createMaintenanceType: async (maintenanceType: Omit<FrontendMaintenanceType, 'id'>): Promise<FrontendMaintenanceType> => {
    try {
      const dbMaintenanceType = {
        name: maintenanceType.name,
        description: maintenanceType.description,
        category: maintenanceType.category,
        estimated_cost: maintenanceType.estimatedCost,
        estimated_duration: maintenanceType.estimatedDuration
      };
      
      const { data, error } = await supabase
        .from('maintenance_types')
        .insert(dbMaintenanceType)
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance type:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating maintenance type');
      }

      return mapDatabaseMaintenanceTypeToFrontend(data as MaintenanceType);
    } catch (err) {
      console.error('Error in createMaintenanceType:', err);
      throw err;
    }
  },

  /**
   * Update an existing maintenance type
   * @param id - Maintenance type ID
   * @param maintenanceType - Updated maintenance type data
   * @returns Promise with updated maintenance type data
   */
  updateMaintenanceType: async (id: string, maintenanceType: Omit<FrontendMaintenanceType, 'id'>): Promise<FrontendMaintenanceType> => {
    try {
      const dbMaintenanceType = {
        name: maintenanceType.name,
        description: maintenanceType.description,
        category: maintenanceType.category,
        estimated_cost: maintenanceType.estimatedCost,
        estimated_duration: maintenanceType.estimatedDuration,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance_types')
        .update(dbMaintenanceType)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating maintenance type with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating maintenance type with ID ${id}`);
      }

      return mapDatabaseMaintenanceTypeToFrontend(data as MaintenanceType);
    } catch (err) {
      console.error(`Error in updateMaintenanceType for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a maintenance type
   * @param id - Maintenance type ID
   * @returns Promise with success status
   */
  deleteMaintenanceType: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('maintenance_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance type with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteMaintenanceType for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Get maintenance types by category
   * @param category - Maintenance category
   * @returns Promise with array of maintenance types
   */
  getMaintenanceTypesByCategory: async (category: string): Promise<FrontendMaintenanceType[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_types')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        console.error(`Error fetching maintenance types for category ${category}:`, error);
        throw error;
      }

      return data ? data.map((type: MaintenanceType) => mapDatabaseMaintenanceTypeToFrontend(type)) : [];
    } catch (err) {
      console.error(`Error in getMaintenanceTypesByCategory for category ${category}:`, err);
      throw err;
    }
  }
};

export default MaintenanceTypeService;
