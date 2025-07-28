/**
 * Role type definition for Supabase integration
 */

/**
 * Role interface representing the roles table in Supabase
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[] | null;
  created_at: string;
}

/**
 * Frontend role type
 */
export interface FrontendRole {
  id: string;
  name: string;
  description: string;
  permissions?: string[];
}

/**
 * Maps a database role to the frontend role format
 */
export const mapDatabaseRoleToFrontend = (dbRole: Role): FrontendRole => {
  return {
    id: dbRole.id,
    name: dbRole.name,
    description: dbRole.description,
    permissions: dbRole.permissions || undefined
  };
};
