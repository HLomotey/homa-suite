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
      .order("created_at", { ascending: false });

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
    .single();

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
    .insert(dbProperty)
    .select()
    .single();

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
  property: Partial<Omit<FrontendProperty, "id" | "dateAdded">>
): Promise<FrontendProperty> => {
  // Convert frontend property to database format
  const dbProperty: any = {};

  if (property.title !== undefined) dbProperty.title = property.title;
  if (property.address !== undefined) dbProperty.address = property.address;
  if (property.price !== undefined) dbProperty.price = property.price;
  if (property.bedrooms !== undefined) dbProperty.bedrooms = property.bedrooms;
  if (property.bathrooms !== undefined)
    dbProperty.bathrooms = property.bathrooms;
  if (property.area !== undefined) dbProperty.area = property.area;
  if (property.type !== undefined) dbProperty.type = property.type;
  if (property.status !== undefined) dbProperty.status = property.status;
  if (property.image !== undefined) dbProperty.image = property.image;
  if (property.description !== undefined)
    dbProperty.description = property.description;
  if (property.locationId !== undefined)
    dbProperty.location_id = property.locationId;
  if (property.managerId !== undefined)
    dbProperty.manager_id = property.managerId;

  const { data, error } = await supabase
    .from("properties")
    .update(dbProperty)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating property with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabasePropertyToFrontend(data as Property);
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
    .order("created_at", { ascending: false });

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching properties with type ${type}:`, error);
    throw new Error(error.message);
  }

  return (data as Property[]).map(mapDatabasePropertyToFrontend);
};
