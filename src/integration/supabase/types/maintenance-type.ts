/**
 * Maintenance Type types for Supabase integration
 * These types define the maintenance type structure and related interfaces
 */

import { Json } from './database';

/**
 * MaintenanceType interface representing the maintenance_types table in Supabase
 */
export interface MaintenanceType {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_cost: number;
  estimated_duration: number; // in hours
  created_at: string;
  updated_at: string | null;
}

/**
 * MaintenanceCategory enum
 */
export type MaintenanceCategory = 'Routine' | 'Repair' | 'Emergency' | 'Inspection' | 'Upgrade';

/**
 * Frontend maintenance type that matches the structure in MaintenanceTypeForm.tsx
 */
export interface FrontendMaintenanceType {
  id: string;
  name: string;
  description: string;
  category: MaintenanceCategory;
  estimatedCost: number;
  estimatedDuration: number; // in hours
}

/**
 * Maps a database maintenance type to the frontend maintenance type format
 */
export const mapDatabaseMaintenanceTypeToFrontend = (dbMaintenanceType: MaintenanceType): FrontendMaintenanceType => {
  return {
    id: dbMaintenanceType.id,
    name: dbMaintenanceType.name,
    description: dbMaintenanceType.description,
    category: dbMaintenanceType.category as MaintenanceCategory,
    estimatedCost: dbMaintenanceType.estimated_cost,
    estimatedDuration: dbMaintenanceType.estimated_duration
  };
};

/**
 * Maps a frontend maintenance type to the database format
 */
export const mapFrontendMaintenanceTypeToDatabase = (
  frontendMaintenanceType: Omit<FrontendMaintenanceType, "id">
): Omit<MaintenanceType, "id" | "created_at" | "updated_at"> => {
  return {
    name: frontendMaintenanceType.name,
    description: frontendMaintenanceType.description,
    category: frontendMaintenanceType.category,
    estimated_cost: frontendMaintenanceType.estimatedCost,
    estimated_duration: frontendMaintenanceType.estimatedDuration
  };
};
