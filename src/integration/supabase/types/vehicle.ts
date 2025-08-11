/**
 * Vehicle types for Supabase integration
 * These types define the vehicle structure and related interfaces
 */

import { Json } from './database';

/**
 * Vehicle interface representing the vehicles table in Supabase
 */
export interface Vehicle {
  id: string;
  state: string;
  address: string;
  make: string;
  model: string;
  vin: string;
  year: number;
  color: string;
  license_plate: string;
  status: string;
  purchase_date: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * VehicleStatus enum
 */
export type VehicleStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Sold';

/**
 * Frontend vehicle type that matches the structure in VehicleForm.tsx
 */
export interface FrontendVehicle {
  id: string;
  state: string;
  address: string;
  make: string;
  model: string;
  vin: string;
  year: number;
  color: string;
  licensePlate: string;
  status: VehicleStatus;
  purchaseDate: string;
}

/**
 * Maps a database vehicle to the frontend vehicle format
 */
export const mapDatabaseVehicleToFrontend = (dbVehicle: Vehicle): FrontendVehicle => {
  return {
    id: dbVehicle.id,
    state: dbVehicle.state,
    address: dbVehicle.address,
    make: dbVehicle.make,
    model: dbVehicle.model,
    vin: dbVehicle.vin,
    year: dbVehicle.year,
    color: dbVehicle.color,
    licensePlate: dbVehicle.license_plate,
    status: dbVehicle.status as VehicleStatus,
    purchaseDate: dbVehicle.purchase_date
  };
};

/**
 * Maps a frontend vehicle to the database format
 */
export const mapFrontendVehicleToDatabase = (frontendVehicle: Omit<FrontendVehicle, "id">): Omit<Vehicle, "id" | "created_at" | "updated_at"> => {
  return {
    state: frontendVehicle.state,
    address: frontendVehicle.address,
    make: frontendVehicle.make,
    model: frontendVehicle.model,
    vin: frontendVehicle.vin,
    year: frontendVehicle.year,
    color: frontendVehicle.color,
    license_plate: frontendVehicle.licensePlate,
    status: frontendVehicle.status,
    purchase_date: frontendVehicle.purchaseDate
  };
};
