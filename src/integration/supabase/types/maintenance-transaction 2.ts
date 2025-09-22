/**
 * Maintenance Transaction types for Supabase integration
 * These types define the maintenance transaction structure and related interfaces
 */

import { Json } from './database';

/**
 * MaintenanceTransaction interface representing the maintenance_transactions table in Supabase
 */
export interface MaintenanceTransaction {
  id: string;
  vehicle_id: string;
  maintenance_type_id: string;
  date: string;
  issue: string;
  amount: number;
  notes: string;
  performed_by: string;
  status: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * TransactionStatus enum
 */
export type TransactionStatus = 'Completed' | 'Scheduled' | 'In Progress' | 'Cancelled';

/**
 * Frontend maintenance transaction that matches the structure in MaintenanceTransactionForm.tsx
 */
export interface FrontendMaintenanceTransaction {
  id: string;
  vehicleId: string;
  maintenanceTypeId: string;
  date: string;
  issue: string;
  amount: number;
  notes: string;
  performedBy: string;
  status: TransactionStatus;
  receiptUrl: string | null;
  
  // These fields will be populated from related tables
  vehicleInfo?: string; // e.g., "2020 Toyota Camry (ABC123)"
  maintenanceTypeName?: string; // e.g., "Oil Change"
}

/**
 * Maps a database maintenance transaction to the frontend maintenance transaction format
 */
export const mapDatabaseMaintenanceTransactionToFrontend = (
  dbTransaction: MaintenanceTransaction
): FrontendMaintenanceTransaction => {
  return {
    id: dbTransaction.id,
    vehicleId: dbTransaction.vehicle_id,
    maintenanceTypeId: dbTransaction.maintenance_type_id,
    date: dbTransaction.date,
    issue: dbTransaction.issue,
    amount: dbTransaction.amount,
    notes: dbTransaction.notes,
    performedBy: dbTransaction.performed_by,
    status: dbTransaction.status as TransactionStatus,
    receiptUrl: dbTransaction.receipt_url
  };
};

/**
 * Maps a frontend maintenance transaction to the database format
 */
export const mapFrontendMaintenanceTransactionToDatabase = (
  frontendTransaction: Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">
): Omit<MaintenanceTransaction, "id" | "created_at" | "updated_at"> => {
  return {
    vehicle_id: frontendTransaction.vehicleId,
    maintenance_type_id: frontendTransaction.maintenanceTypeId,
    date: frontendTransaction.date,
    issue: frontendTransaction.issue,
    amount: frontendTransaction.amount,
    notes: frontendTransaction.notes,
    performed_by: frontendTransaction.performedBy,
    status: frontendTransaction.status,
    receipt_url: frontendTransaction.receiptUrl
  };
};
