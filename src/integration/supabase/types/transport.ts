/**
 * Transport types for Supabase integration
 * These types define the transport/vehicle structure and related interfaces
 */

import { Json } from './database';

/**
 * Vehicle interface representing the vehicles table in Supabase
 */
export interface Vehicle {
  id: string;
  staff_id: string;
  model: string;
  plate_number: string;
  status: string;
  last_service: string;
  type: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * VehicleStatus enum
 */
export type VehicleStatus = 'active' | 'maintenance' | 'repair' | 'retired';

/**
 * VehicleType enum
 */
export type VehicleType = 'car' | 'truck' | 'bus' | 'van';

/**
 * TransportStaff interface representing the transport_staff table in Supabase
 * This is a simplified version for transport purposes
 */
export interface TransportStaff {
  id: string;
  name: string;
  department: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * TransportStats interface representing the transport_stats table in Supabase
 */
export interface TransportStats {
  id: string;
  total_vehicles: number;
  active_vehicles: number;
  maintenance_vehicles: number;
  repair_vehicles: number;
  retired_vehicles: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend vehicle type that matches the structure in TransportForm.tsx and TransportList.tsx
 */
export interface FrontendVehicle {
  id: string;
  staffId: string;
  model: string;
  plateNumber: string;
  status: VehicleStatus;
  lastService: string;
  type: VehicleType;
}

/**
 * Frontend staff type that matches the structure in the transport components
 */
export interface FrontendTransportStaff {
  id: string;
  name: string;
  department: string;
}

/**
 * Frontend transport stats type
 */
export interface FrontendTransportStats {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  repairVehicles: number;
  retiredVehicles: number;
}

/**
 * Maps a database vehicle to the frontend vehicle format
 */
export const mapDatabaseVehicleToFrontend = (dbVehicle: Vehicle): FrontendVehicle => {
  return {
    id: dbVehicle.id,
    staffId: dbVehicle.staff_id,
    model: dbVehicle.model,
    plateNumber: dbVehicle.plate_number,
    status: dbVehicle.status as VehicleStatus,
    lastService: dbVehicle.last_service,
    type: dbVehicle.type as VehicleType
  };
};

/**
 * Maps a database transport staff to the frontend staff format
 */
export const mapDatabaseTransportStaffToFrontend = (
  dbStaff: TransportStaff
): FrontendTransportStaff => {
  return {
    id: dbStaff.id,
    name: dbStaff.name,
    department: dbStaff.department
  };
};

/**
 * Maps a database transport stats to the frontend format
 */
export const mapDatabaseTransportStatsToFrontend = (
  dbStats: TransportStats
): FrontendTransportStats => {
  return {
    totalVehicles: dbStats.total_vehicles,
    activeVehicles: dbStats.active_vehicles,
    maintenanceVehicles: dbStats.maintenance_vehicles,
    repairVehicles: dbStats.repair_vehicles,
    retiredVehicles: dbStats.retired_vehicles
  };
};
