/**
 * Maintenance Transaction API functions for Supabase integration
 * These functions handle direct communication with Supabase for maintenance transaction data
 */

import { supabase } from "../../integration/supabase/client";
import {
  MaintenanceTransaction,
  FrontendMaintenanceTransaction,
  mapDatabaseMaintenanceTransactionToFrontend,
  mapFrontendMaintenanceTransactionToDatabase
} from "../../integration/supabase/types/maintenance-transaction";
import { fetchVehicleById } from "./vehicleApi";
import { fetchMaintenanceTypeById } from "./maintenanceTypeApi";

/**
 * Fetch all maintenance transactions from Supabase
 * @returns Promise with array of maintenance transactions
 */
export const fetchMaintenanceTransactions = async (): Promise<FrontendMaintenanceTransaction[]> => {
  const { data, error } = await supabase
    .from("maintenance_transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching maintenance transactions:", error);
    throw new Error(error.message);
  }

  // Map database transactions to frontend format
  const transactions = await Promise.all(
    (data as MaintenanceTransaction[]).map(async (transaction) => {
      const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(transaction);
      
      try {
        // Fetch related vehicle info
        const vehicle = await fetchVehicleById(frontendTransaction.vehicleId);
        frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
        
        // Fetch related maintenance type info
        const maintenanceType = await fetchMaintenanceTypeById(frontendTransaction.maintenanceTypeId);
        frontendTransaction.maintenanceTypeName = maintenanceType.name;
      } catch (error) {
        console.error("Error fetching related data for transaction:", error);
        frontendTransaction.vehicleInfo = "Unknown Vehicle";
        frontendTransaction.maintenanceTypeName = "Unknown Type";
      }
      
      return frontendTransaction;
    })
  );

  return transactions;
};

/**
 * Fetch a single maintenance transaction by ID
 * @param id Maintenance Transaction ID
 * @returns Promise with maintenance transaction data
 */
export const fetchMaintenanceTransactionById = async (
  id: string
): Promise<FrontendMaintenanceTransaction> => {
  const { data, error } = await supabase
    .from("maintenance_transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching maintenance transaction with ID ${id}:`, error);
    throw new Error(error.message);
  }

  const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(data as MaintenanceTransaction);
  
  try {
    // Fetch related vehicle info
    const vehicle = await fetchVehicleById(frontendTransaction.vehicleId);
    frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
    
    // Fetch related maintenance type info
    const maintenanceType = await fetchMaintenanceTypeById(frontendTransaction.maintenanceTypeId);
    frontendTransaction.maintenanceTypeName = maintenanceType.name;
  } catch (error) {
    console.error("Error fetching related data for transaction:", error);
    frontendTransaction.vehicleInfo = "Unknown Vehicle";
    frontendTransaction.maintenanceTypeName = "Unknown Type";
  }

  return frontendTransaction;
};

/**
 * Create a new maintenance transaction
 * @param transaction Maintenance transaction data to create
 * @returns Promise with created maintenance transaction data
 */
export const createMaintenanceTransaction = async (
  transaction: Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">
): Promise<FrontendMaintenanceTransaction> => {
  // Convert frontend transaction to database format
  const dbTransaction = mapFrontendMaintenanceTransactionToDatabase(transaction as FrontendMaintenanceTransaction);

  const { data, error } = await supabase
    .from("maintenance_transactions")
    .insert(dbTransaction)
    .select()
    .single();

  if (error) {
    console.error("Error creating maintenance transaction:", error);
    throw new Error(error.message);
  }

  const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(data as MaintenanceTransaction);
  
  try {
    // Fetch related vehicle info
    const vehicle = await fetchVehicleById(frontendTransaction.vehicleId);
    frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
    
    // Fetch related maintenance type info
    const maintenanceType = await fetchMaintenanceTypeById(frontendTransaction.maintenanceTypeId);
    frontendTransaction.maintenanceTypeName = maintenanceType.name;
  } catch (error) {
    console.error("Error fetching related data for transaction:", error);
    frontendTransaction.vehicleInfo = "Unknown Vehicle";
    frontendTransaction.maintenanceTypeName = "Unknown Type";
  }

  return frontendTransaction;
};

/**
 * Update an existing maintenance transaction
 * @param id Maintenance Transaction ID
 * @param transaction Maintenance transaction data to update
 * @returns Promise with updated maintenance transaction data
 */
export const updateMaintenanceTransaction = async (
  id: string,
  transaction: Partial<Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">>
): Promise<FrontendMaintenanceTransaction> => {
  // Convert frontend transaction to database format
  const fullTransaction = { ...transaction, id } as FrontendMaintenanceTransaction;
  const dbTransaction = mapFrontendMaintenanceTransactionToDatabase(fullTransaction);

  // Remove id from the update payload
  delete dbTransaction.id;

  const { data, error } = await supabase
    .from("maintenance_transactions")
    .update(dbTransaction)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating maintenance transaction with ID ${id}:`, error);
    throw new Error(error.message);
  }

  const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(data as MaintenanceTransaction);
  
  try {
    // Fetch related vehicle info
    const vehicle = await fetchVehicleById(frontendTransaction.vehicleId);
    frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
    
    // Fetch related maintenance type info
    const maintenanceType = await fetchMaintenanceTypeById(frontendTransaction.maintenanceTypeId);
    frontendTransaction.maintenanceTypeName = maintenanceType.name;
  } catch (error) {
    console.error("Error fetching related data for transaction:", error);
    frontendTransaction.vehicleInfo = "Unknown Vehicle";
    frontendTransaction.maintenanceTypeName = "Unknown Type";
  }

  return frontendTransaction;
};

/**
 * Delete a maintenance transaction
 * @param id Maintenance Transaction ID
 * @returns Promise with success status
 */
export const deleteMaintenanceTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("maintenance_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting maintenance transaction with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch maintenance transactions by vehicle ID
 * @param vehicleId Vehicle ID to filter by
 * @returns Promise with array of maintenance transactions
 */
export const fetchMaintenanceTransactionsByVehicle = async (
  vehicleId: string
): Promise<FrontendMaintenanceTransaction[]> => {
  const { data, error } = await supabase
    .from("maintenance_transactions")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("date", { ascending: false });

  if (error) {
    console.error(`Error fetching maintenance transactions for vehicle ${vehicleId}:`, error);
    throw new Error(error.message);
  }

  // Map database transactions to frontend format
  const transactions = await Promise.all(
    (data as MaintenanceTransaction[]).map(async (transaction) => {
      const frontendTransaction = mapDatabaseMaintenanceTransactionToFrontend(transaction);
      
      try {
        // Fetch related vehicle info
        const vehicle = await fetchVehicleById(frontendTransaction.vehicleId);
        frontendTransaction.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
        
        // Fetch related maintenance type info
        const maintenanceType = await fetchMaintenanceTypeById(frontendTransaction.maintenanceTypeId);
        frontendTransaction.maintenanceTypeName = maintenanceType.name;
      } catch (error) {
        console.error("Error fetching related data for transaction:", error);
        frontendTransaction.vehicleInfo = "Unknown Vehicle";
        frontendTransaction.maintenanceTypeName = "Unknown Type";
      }
      
      return frontendTransaction;
    })
  );

  return transactions;
};
