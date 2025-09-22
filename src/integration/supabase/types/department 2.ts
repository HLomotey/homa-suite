/**
 * Department type definition for Supabase integration
 */

/**
 * Department interface representing the departments table in Supabase
 */
export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

/**
 * Frontend department type
 */
export interface FrontendDepartment {
  id: string;
  name: string;
  description?: string;
}

/**
 * Maps a database department to the frontend department format
 */
export const mapDatabaseDepartmentToFrontend = (dbDepartment: Department): FrontendDepartment => {
  return {
    id: dbDepartment.id,
    name: dbDepartment.name,
    description: dbDepartment.description || undefined
  };
};
