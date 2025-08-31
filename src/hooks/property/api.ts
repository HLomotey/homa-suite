/**
 * Property API functions for Supabase integration
 * These functions handle direct communication with Supabase for property data
 */

import { supabase } from "../../integration/supabase/client";
import {
  Property,
  FrontendProperty,
  mapDatabasePropertyToFrontend,
  PropertyStatus,
  PropertyType,
} from "../../integration/supabase/types";
import { Database } from "../../integration/supabase/types/database";

/**
 * Fetch all properties from Supabase
 * @returns Promise with array of properties
 */
export const fetchProperties = async (): Promise<FrontendProperty[]> => {
  console.log("Fetching properties from Supabase...");
  
  try {
    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        company_locations(*),
        billing_staff(id, legal_name)
      `)
      .order("created_at", { ascending: false }) as { data: Property[] | null, error: any };

    console.log("Supabase properties query result:", { data, error });

    if (error) {
      console.error("Error fetching properties:", error);
      throw new Error(error.message);
    }

    // Check if data is null or empty
    if (!data || data.length === 0) {
      console.warn("No properties found in database");
      return [];
    }

    const mappedData = (data as Property[]).map(mapDatabasePropertyToFrontend);
    console.log("Mapped properties data:", mappedData);
    console.log("Property count:", mappedData.length);
    console.log("First property:", mappedData[0]);
    
    return mappedData;
  } catch (err) {
    console.error("Exception in fetchProperties:", err);
    throw err;
  }
};

/**
 * Fetch a single property by ID
 * @param id Property ID
 * @returns Promise with property data
 */
export const fetchPropertyById = async (
  id: string
): Promise<FrontendProperty> => {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      company_locations(*),
      billing_staff(id, legal_name)
    `)
    .eq("id", id)
    .single() as { data: Property | null, error: any };

  if (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabasePropertyToFrontend(data as Property);
};

/**
 * Create a new property
 * @param property Property data to create
 * @returns Promise with created property data
 */
export const createProperty = async (
  property: Omit<FrontendProperty, "id" | "dateAdded">
): Promise<FrontendProperty> => {
  // Convert frontend property to database format
  const dbProperty = {
    title: property.title,
    address: property.address,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    type: property.type,
    status: property.status,
    image: property.image,
    description: property.description,
    location_id: property.locationId,
    manager_id: property.managerId,
    date_added: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("properties")
    .insert(dbProperty as any)
    .select()
    .single() as { data: Property | null, error: any };

  if (error) {
    console.error("Error creating property:", error);
    throw new Error(error.message);
  }

  return mapDatabasePropertyToFrontend(data as Property);
};

/**
 * Update an existing property
 * @param id Property ID
 * @param property Property data to update
 * @returns Promise with updated property data
 */
export const updateProperty = async (
  id: string,
  property: Partial<FrontendProperty>
): Promise<FrontendProperty> => {
  try {
    // Create a plain object for the update data
    const updateData: Record<string, unknown> = {};
    
    // Only include fields that are defined
    if (property.title !== undefined) updateData.title = property.title;
    if (property.address !== undefined) updateData.address = property.address;
    if (property.price !== undefined) updateData.price = property.price;
    if (property.bedrooms !== undefined) updateData.bedrooms = property.bedrooms;
    if (property.bathrooms !== undefined) updateData.bathrooms = property.bathrooms;
    if (property.area !== undefined) updateData.area = property.area;
    if (property.type !== undefined) updateData.type = property.type;
    if (property.status !== undefined) updateData.status = property.status;
    if (property.image !== undefined) updateData.image = property.image;
    if (property.description !== undefined) updateData.description = property.description;
    if (property.locationId !== undefined) updateData.location_id = property.locationId;
    if (property.managerId !== undefined) updateData.manager_id = property.managerId;
    
    // Use a simpler approach with the Supabase client
    // First, get the table reference
    const propertiesTable = supabase.from("properties");
    
    // Then, perform the update operation with a type assertion
    // This is necessary because of TypeScript's strict typing
    const result = await (propertiesTable as any).update(updateData).eq("id", id).select(`
      *,
      company_locations(*),
      external_staff(id, "PAYROLL LAST NAME", "PAYROLL FIRST NAME", business_key)
    `).single();
    
    // Extract data and error from the result
    const { data, error } = result;

    if (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`No data returned when updating property with ID ${id}`);
    }
    
    // Map the database property to frontend format
    return mapDatabasePropertyToFrontend(data);
  } catch (err) {
    console.error(`Exception in updateProperty for ID ${id}:`, err);
    throw err;
  }
};

/**
 * Delete a property
 * @param id Property ID
 * @returns Promise with success status
 */
export const deleteProperty = async (id: string): Promise<void> => {
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting property with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch properties by status
 * @param status Property status to filter by
 * @returns Promise with array of properties
 */
export const fetchPropertiesByStatus = async (
  status: PropertyStatus
): Promise<FrontendProperty[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      company_locations(*),
      billing_staff(id, legal_name)
    `)
    .eq("status", status)
    .order("created_at", { ascending: false }) as { data: Property[] | null, error: any };

  if (error) {
    console.error(`Error fetching properties with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as Property[]).map(mapDatabasePropertyToFrontend);
};

/**
 * Fetch properties by type
 * @param type Property type to filter by
 * @returns Promise with array of properties
 */
export const fetchPropertiesByType = async (
  type: PropertyType
): Promise<FrontendProperty[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      company_locations(*),
      billing_staff(id, legal_name)
    `)
    .eq("type", type)
    .order("created_at", { ascending: false }) as { data: Property[] | null, error: any };

  if (error) {
    console.error(`Error fetching properties with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as Property[]).map(mapDatabasePropertyToFrontend);
};
