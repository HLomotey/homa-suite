/**
 * Property module index file
 * Exports all property-related types, API functions, and hooks
 */

// Re-export types from types/property
export type {
  Property,
  PropertyStatus,
  PropertyType,
  FrontendProperty,
} from "../../integration/supabase/types/property";

export { mapDatabasePropertyToFrontend } from "../../integration/supabase/types/property";

// Re-export API functions
export {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  fetchPropertiesByStatus,
  fetchPropertiesByType,
} from "./api";

// Re-export hooks
export {
  useProperties,
  useProperty,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  usePropertiesByStatus,
  usePropertiesByType,
} from "./useProperty";
