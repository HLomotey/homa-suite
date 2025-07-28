/**
 * Room types for Supabase integration
 * These types define the room structure and related interfaces
 */

import { Json } from './database';

/**
 * Room interface representing the rooms table in Supabase
 */
export interface Room {
  id: string;
  name: string;
  property_id: string;
  property_name: string;
  type: string;
  status: string;
  area: number;
  occupants: number;
  max_occupants: number;
  price: number;
  date_available: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Room status enum
 */
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';

/**
 * Room type enum
 */
export type RoomType = 'Single' | 'Double' | 'Suite' | 'Studio';

/**
 * Frontend room type that matches the structure in RoomForm.tsx
 */
export interface FrontendRoom {
  id: string;
  name: string;
  propertyId: string;
  propertyName: string;
  type: RoomType;
  status: RoomStatus;
  area: number;
  occupants: number;
  maxOccupants: number;
  price: number;
  dateAvailable: string;
}

/**
 * Maps a database room to the frontend room format
 */
export const mapDatabaseRoomToFrontend = (dbRoom: Room): FrontendRoom => {
  return {
    id: dbRoom.id,
    name: dbRoom.name,
    propertyId: dbRoom.property_id,
    propertyName: dbRoom.property_name,
    type: dbRoom.type as RoomType,
    status: dbRoom.status as RoomStatus,
    area: dbRoom.area,
    occupants: dbRoom.occupants,
    maxOccupants: dbRoom.max_occupants,
    price: dbRoom.price,
    dateAvailable: dbRoom.date_available
  };
};
