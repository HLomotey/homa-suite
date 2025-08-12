/**
 * Location types for Supabase integration
 * These types define the company location/branch structure
 */

/**
 * Location interface representing the company_locations table in Supabase
 */
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend location type that matches the structure for UI components
 */
export interface FrontendLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  isActive: boolean;
}

/**
 * Maps a database location to the frontend location format
 */
export const mapDatabaseLocationToFrontend = (dbLocation: Location): FrontendLocation => {
  return {
    id: dbLocation.id,
    name: dbLocation.name,
    address: dbLocation.address,
    city: dbLocation.city,
    state: dbLocation.state,
    zipCode: dbLocation.zip_code,
    country: dbLocation.country,
    phone: dbLocation.phone,
    email: dbLocation.email,
    isActive: dbLocation.is_active
  };
};

/**
 * Maps a frontend location to the database format
 */
export const mapFrontendLocationToDatabase = (frontendLocation: Omit<FrontendLocation, "id">): Omit<Location, "id" | "created_at" | "updated_at"> => {
  return {
    name: frontendLocation.name,
    address: frontendLocation.address,
    city: frontendLocation.city,
    state: frontendLocation.state,
    zip_code: frontendLocation.zipCode,
    country: frontendLocation.country,
    phone: frontendLocation.phone || '',
    email: frontendLocation.email || '',
    is_active: frontendLocation.isActive
  };
};
