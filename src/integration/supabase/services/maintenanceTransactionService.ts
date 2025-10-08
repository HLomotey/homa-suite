import { supabase } from '../index';
import { 
  MaintenanceTransaction, 
  FrontendMaintenanceTransaction, 
  mapDatabaseMaintenanceTransactionToFrontend,
  mapFrontendMaintenanceTransactionToDatabase
} from '../types/maintenance-transaction';
import { Vehicle } from '../types/vehicle';
import { MaintenanceType } from '../types/maintenance-type';

/**
 * Interface for maintenance transaction with joined vehicle and maintenance type data
 */
interface MaintenanceTransactionWithJoins extends MaintenanceTransaction {
  vehicles?: Vehicle;
  maintenance_types?: MaintenanceType;
}

/**
 * Service for managing maintenance transactions in the system
 */
export const MaintenanceTransactionService = {
  /**
   * Get all maintenance transactions
   * @returns Promise with array of maintenance transactions
   */
  getAllMaintenanceTransactions: async (): Promise<FrontendMaintenanceTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_transactions')
        .select('*, vehicles(*), maintenance_types(*)')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance transactions:', error);
        throw error;
      }

      if (!data) return [];

      return data.map((transaction: MaintenanceTransactionWithJoins) => {
        const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(transaction);
        
        // Add vehicle and maintenance type information
        if (transaction.vehicles) {
          const vehicle = transaction.vehicles;
          frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
        }
        
        if (transaction.maintenance_types) {
          frontendTransaction.maintenanceTypeName = transaction.maintenance_types.name;
        }
        
        return frontendTransaction;
      });
    } catch (err) {
      console.error('Error in getAllMaintenanceTransactions:', err);
      throw err;
    }
  },

  /**
   * Get a maintenance transaction by ID
   * @param id - Maintenance transaction ID
   * @returns Promise with maintenance transaction data
   */
  getMaintenanceTransactionById: async (id: string): Promise<FrontendMaintenanceTransaction | null> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_transactions')
        .select('*, vehicles(*), maintenance_types(*)')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching maintenance transaction with ID ${id}:`, error);
        throw error;
      }

      if (!data) return null;

      const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(data);
      
      // Add vehicle and maintenance type information
      if (data.vehicles) {
        const vehicle = data.vehicles;
        frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
      }
      
      if (data.maintenance_types) {
        frontendTransaction.maintenanceTypeName = data.maintenance_types.name;
      }
      
      return frontendTransaction;
    } catch (err) {
      console.error(`Error in getMaintenanceTransactionById for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new maintenance transaction
   * @param transaction - Maintenance transaction data to create
   * @returns Promise with created maintenance transaction data
   */
  createMaintenanceTransaction: async (
    transaction: Omit<FrontendMaintenanceTransaction, 'id' | 'vehicleInfo' | 'maintenanceTypeName'>
  ): Promise<FrontendMaintenanceTransaction> => {
    try {
      const dbTransaction = mapFrontendMaintenanceTransactionToDatabase(transaction);
      
      const { data, error } = await supabase
        .from('maintenance_transactions')
        .insert(dbTransaction)
        .select('*, vehicles(*), maintenance_types(*)')
        .single();

      if (error) {
        console.error('Error creating maintenance transaction:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating maintenance transaction');
      }

      const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(data);
      
      // Add vehicle and maintenance type information
      if (data.vehicles) {
        const vehicle = data.vehicles;
        frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
      }
      
      if (data.maintenance_types) {
        frontendTransaction.maintenanceTypeName = data.maintenance_types.name;
      }
      
      return frontendTransaction;
    } catch (err) {
      console.error('Error in createMaintenanceTransaction:', err);
      throw err;
    }
  },

  /**
   * Update an existing maintenance transaction
   * @param id - Maintenance transaction ID
   * @param transaction - Updated maintenance transaction data
   * @returns Promise with updated maintenance transaction data
   */
  updateMaintenanceTransaction: async (
    id: string,
    transaction: Omit<FrontendMaintenanceTransaction, 'id' | 'vehicleInfo' | 'maintenanceTypeName'>
  ): Promise<FrontendMaintenanceTransaction> => {
    try {
      const dbTransaction = {
        ...mapFrontendMaintenanceTransactionToDatabase(transaction),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance_transactions')
        .update(dbTransaction)
        .eq('id', id)
        .select('*, vehicles(*), maintenance_types(*)')
        .single();

      if (error) {
        console.error(`Error updating maintenance transaction with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating maintenance transaction with ID ${id}`);
      }

      const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(data);
      
      // Add vehicle and maintenance type information
      if (data.vehicles) {
        const vehicle = data.vehicles;
        frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
      }
      
      if (data.maintenance_types) {
        frontendTransaction.maintenanceTypeName = data.maintenance_types.name;
      }
      
      return frontendTransaction;
    } catch (err) {
      console.error(`Error in updateMaintenanceTransaction for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a maintenance transaction
   * @param id - Maintenance transaction ID
   * @returns Promise with success status
   */
  deleteMaintenanceTransaction: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('maintenance_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance transaction with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteMaintenanceTransaction for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Get maintenance transactions by vehicle ID
   * @param vehicleId - Vehicle ID
   * @returns Promise with array of maintenance transactions
   */
  getMaintenanceTransactionsByVehicle: async (vehicleId: string): Promise<FrontendMaintenanceTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_transactions')
        .select('*, vehicles(*), maintenance_types(*)')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      if (error) {
        console.error(`Error fetching maintenance transactions for vehicle ${vehicleId}:`, error);
        throw error;
      }

      if (!data) return [];

      return data.map((transaction: MaintenanceTransactionWithJoins) => {
        const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(transaction);
        
        // Add vehicle and maintenance type information
        if (transaction.vehicles) {
          const vehicle = transaction.vehicles;
          frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
        }
        
        if (transaction.maintenance_types) {
          frontendTransaction.maintenanceTypeName = transaction.maintenance_types.name;
        }
        
        return frontendTransaction;
      });
    } catch (err) {
      console.error(`Error in getMaintenanceTransactionsByVehicle for vehicle ${vehicleId}:`, err);
      throw err;
    }
  },

  /**
   * Get maintenance transactions by status
   * @param status - Transaction status
   * @returns Promise with array of maintenance transactions
   */
  getMaintenanceTransactionsByStatus: async (status: string): Promise<FrontendMaintenanceTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_transactions')
        .select('*, vehicles(*), maintenance_types(*)')
        .eq('status', status)
        .order('date', { ascending: false });

      if (error) {
        console.error(`Error fetching maintenance transactions with status ${status}:`, error);
        throw error;
      }

      if (!data) return [];

      return data.map((transaction: MaintenanceTransactionWithJoins) => {
        const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(transaction);
        
        // Add vehicle and maintenance type information
        if (transaction.vehicles) {
          const vehicle = transaction.vehicles;
          frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
        }
        
        if (transaction.maintenance_types) {
          frontendTransaction.maintenanceTypeName = transaction.maintenance_types.name;
        }
        
        return frontendTransaction;
      });
    } catch (err) {
      console.error(`Error in getMaintenanceTransactionsByStatus for status ${status}:`, err);
      throw err;
    }
  }
};

export default MaintenanceTransactionService;
