/**
 * Property types for Supabase integration
 * These types define the property structure and related interfaces
 */

import { Json } from './database';

/**
 * Property interface representing the properties table in Supabase
 */
export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  image: string;
  description: string;
  date_added: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Property status enum
 */
export type PropertyStatus = 'Available' | 'Pending' | 'Sold' | 'Rented';

/**
 * Property type enum
 */
export type PropertyType = 'Apartment' | 'House' | 'Condo' | 'Townhouse' | 'Land' | 'Studio' | 'Loft';

/**
 * Frontend property type that matches the structure in PropertyForm.tsx
 */
export interface FrontendProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: PropertyType;
  status: PropertyStatus;
  image: string;
  description: string;
  dateAdded: string;
}

/**
 * Maps a database property to the frontend property format
 */
export const mapDatabasePropertyToFrontend = (dbProperty: Property): FrontendProperty => {
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    address: dbProperty.address,
    price: dbProperty.price,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    area: dbProperty.area,
    type: dbProperty.type as PropertyType,
    status: dbProperty.status as PropertyStatus,
    image: dbProperty.image,
    description: dbProperty.description,
    dateAdded: dbProperty.date_added
  };
};
