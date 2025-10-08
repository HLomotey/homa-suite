/**
 * Property types for Supabase integration
 * These types define the property structure and related interfaces
 */

import { Json } from './database';
import { Location } from './location';


/**
 * Property interface representing the properties table in Supabase
 */
export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  rent_amount: number;
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
  location_id: string | null;
  manager_id: string | null;
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
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: PropertyType;
  status: PropertyStatus;
  image: string;
  description: string;
  dateAdded: string;
  locationId: string | null;
  managerId: string | null;
  location?: Location | null;
  managerName?: string;
}

/**
 * Maps a database property to the frontend property format
 */
export const mapDatabasePropertyToFrontend = (dbProperty: any): FrontendProperty => {
  // Handle the joined location data from company_locations
  let location = null;
  if (dbProperty.company_locations) {
    const locationData = dbProperty.company_locations;
    location = {
      id: locationData.id,
      name: locationData.name,
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      zipCode: locationData.zip_code,
      country: locationData.country,
      phone: locationData.phone,
      email: locationData.email,
      isActive: locationData.is_active
    };
  }

  // Handle the joined manager data from external_staff
  let managerName = null;
  if (dbProperty.external_staff) {
    const firstName = dbProperty.external_staff['PAYROLL FIRST NAME'] || '';
    const lastName = dbProperty.external_staff['PAYROLL LAST NAME'] || '';
    managerName = `${firstName} ${lastName}`.trim() || null;
  }

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    address: dbProperty.address,
    price: dbProperty.price,
    rentAmount: dbProperty.rent_amount || 0,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    area: dbProperty.area,
    type: dbProperty.type as PropertyType,
    status: dbProperty.status as PropertyStatus,
    image: dbProperty.image,
    description: dbProperty.description,
    dateAdded: dbProperty.date_added,
    locationId: dbProperty.location_id,
    managerId: dbProperty.manager_id,
    location: location,
    managerName: managerName
  };
};

/**
 * Maps a frontend property to the database property format
 */
export const mapFrontendPropertyToDatabase = (frontendProperty: FrontendProperty): Omit<Property, 'created_at' | 'updated_at'> => {
  return {
    id: frontendProperty.id,
    title: frontendProperty.title,
    address: frontendProperty.address,
    price: frontendProperty.price,
    rent_amount: frontendProperty.rentAmount,
    bedrooms: frontendProperty.bedrooms,
    bathrooms: frontendProperty.bathrooms,
    area: frontendProperty.area,
    type: frontendProperty.type,
    status: frontendProperty.status,
    image: frontendProperty.image,
    description: frontendProperty.description,
    date_added: frontendProperty.dateAdded,
    location_id: frontendProperty.locationId,
    manager_id: frontendProperty.managerId
  };
};
