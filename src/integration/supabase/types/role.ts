/**
 * Role type definition for Supabase integration
 */

/**
 * Role interface representing the roles table in Supabase
 */
export interface Role {
  id: string; // UUID in database
  name: string;
  display_name?: string;
  description: string;
  is_system_role?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Frontend role type
 */
export interface FrontendRole {
  id: string; // Convert to string for frontend use
  name: string;
  description: string;
  permissions?: string[];
}

/**
 * Maps a database role to the frontend role format
 */
export const mapDatabaseRoleToFrontend = (dbRole: Role): FrontendRole => {
  return {
    id: dbRole.id, // Already a string (UUID)
    name: dbRole.name,
    description: dbRole.description,
    permissions: [] // Permissions will be loaded separately from role_permissions table
  };
};
