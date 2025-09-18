import { supabase } from '../index';
import { 
  RouteAssignment, 
  RouteExecutionLog,
  FrontendRouteAssignment, 
  FrontendRouteExecutionLog,
  mapDatabaseRouteAssignmentToFrontend,
  mapFrontendRouteAssignmentToDatabase,
  mapDatabaseRouteExecutionLogToFrontend,
  mapFrontendRouteExecutionLogToDatabase
} from '../types/route-assignment';
import { FrontendBillingStaff } from '../types/billing';
import { BillingStaff } from '../types/billing';
import { RouteDriverService } from './routeDriverService';

// Helper functions are now in RouteDriverService

/**
 * Service for managing route assignments in the system
 */
export const RouteAssignmentService = {
  /**
   * Get all route assignments
   * @returns Promise with array of route assignments
   */
  getAllRouteAssignments: async (): Promise<FrontendRouteAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('route_assignments')
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching route assignments:', error);
        throw error;
      }

      if (!data) return [];

      return data.map((assignment: RouteAssignment & { 
        combined_routes?: { id: string, name: string },
        vehicles?: { id: string, make: string, model: string, year: number, registration_number: string },
        users?: { id: string, raw_user_meta_data: unknown }
      }) => {
        const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(assignment);
        
        // Add combined route name
        if (assignment.combined_routes) {
          frontendAssignment.combinedRouteName = assignment.combined_routes.name;
        }
        
        // Add vehicle info
        if (assignment.vehicles) {
          const vehicle = assignment.vehicles;
          frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
        }
        
        // Add driver name
        if (assignment.users && assignment.users.raw_user_meta_data) {
          const userMeta = assignment.users.raw_user_meta_data;
          if (typeof userMeta === 'object' && userMeta !== null) {
            const metaData = userMeta as { first_name?: string; last_name?: string; };
            frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
          }
        }
        
        return frontendAssignment;
      });
    } catch (err) {
      console.error('Error in getAllRouteAssignments:', err);
      throw err;
    }
  },

  /**
   * Get a route assignment by ID
   * @param id - Route assignment ID
   * @returns Promise with route assignment data
   */
  getRouteAssignmentById: async (id: string): Promise<FrontendRouteAssignment | null> => {
    try {
      const { data, error } = await supabase
        .from('route_assignments')
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching route assignment with ID ${id}:`, error);
        throw error;
      }

      if (!data) return null;

      const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(data);
      
      // Add combined route name
      if (data.combined_routes) {
        frontendAssignment.combinedRouteName = data.combined_routes.name;
      }
      
      // Add vehicle info
      if (data.vehicles) {
        const vehicle = data.vehicles;
        frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
      }
      
      // Add driver name
      if (data.users && data.users.raw_user_meta_data) {
        const userMeta = data.users.raw_user_meta_data;
        if (typeof userMeta === 'object' && userMeta !== null) {
          const metaData = userMeta as { first_name?: string; last_name?: string; };
          frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
        }
      }
      
      // Get execution logs for this assignment
      const { data: executionLogs, error: logsError } = await supabase
        .from('route_execution_logs')
        .select('*')
        .eq('route_assignment_id', id)
        .order('execution_date', { ascending: false });
      
      if (logsError) {
        console.error(`Error fetching execution logs for assignment ${id}:`, logsError);
      } else if (executionLogs) {
        frontendAssignment.executionLogs = executionLogs.map(
          (log: RouteExecutionLog) => mapDatabaseRouteExecutionLogToFrontend(log)
        );
      }
      
      return frontendAssignment;
    } catch (err) {
      console.error(`Error in getRouteAssignmentById for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new route assignment
   * @param assignment - Route assignment data to create
   * @returns Promise with created route assignment data
   */
  createRouteAssignment: async (
    assignment: Omit<FrontendRouteAssignment, 'id' | 'combinedRouteName' | 'vehicleInfo' | 'driverName' | 'routes' | 'executionLogs'>
  ): Promise<FrontendRouteAssignment> => {
    try {
      // Convert to database format, omitting id and created_at which will be generated
      const { id, created_at, updated_at, ...dbAssignment } = mapFrontendRouteAssignmentToDatabase({
        ...assignment,
        id: '', // This will be ignored
      });
      
      const { data, error } = await supabase
        .from('route_assignments')
        .insert(dbAssignment)
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .single();

      if (error) {
        console.error('Error creating route assignment:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating route assignment');
      }

      const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(data);
      
      // Add combined route name
      if (data.combined_routes) {
        frontendAssignment.combinedRouteName = data.combined_routes.name;
      }
      
      // Add vehicle info
      if (data.vehicles) {
        const vehicle = data.vehicles;
        frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
      }
      
      // Add driver name
      if (data.users && data.users.raw_user_meta_data) {
        const userMeta = data.users.raw_user_meta_data;
        if (typeof userMeta === 'object' && userMeta !== null) {
          const metaData = userMeta as { first_name?: string; last_name?: string; };
          frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
        }
      }
      
      return frontendAssignment;
    } catch (err) {
      console.error('Error in createRouteAssignment:', err);
      throw err;
    }
  },

  /**
   * Update an existing route assignment
   * @param id - Route assignment ID
   * @param assignment - Updated route assignment data
   * @returns Promise with updated route assignment data
   */
  updateRouteAssignment: async (
    id: string,
    assignment: Omit<FrontendRouteAssignment, 'id' | 'combinedRouteName' | 'vehicleInfo' | 'driverName' | 'routes' | 'executionLogs'>
  ): Promise<FrontendRouteAssignment> => {
    try {
      // Convert to database format, adding updated_at timestamp
      const dbAssignment = {
        combined_route_id: assignment.combinedRouteId,
        vehicle_id: assignment.vehicleId,
        driver_id: assignment.driverId,
        start_date: assignment.startDate,
        end_date: assignment.endDate,
        status: assignment.status,
        notes: assignment.notes,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('route_assignments')
        .update(dbAssignment)
        .eq('id', id)
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .single();

      if (error) {
        console.error(`Error updating route assignment with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating route assignment with ID ${id}`);
      }

      const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(data);
      
      // Add combined route name
      if (data.combined_routes) {
        frontendAssignment.combinedRouteName = data.combined_routes.name;
      }
      
      // Add vehicle info
      if (data.vehicles) {
        const vehicle = data.vehicles;
        frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
      }
      
      // Add driver name
      if (data.users && data.users.raw_user_meta_data) {
        const userMeta = data.users.raw_user_meta_data;
        if (typeof userMeta === 'object' && userMeta !== null) {
          const metaData = userMeta as { first_name?: string; last_name?: string; };
          frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
        }
      }
      
      return frontendAssignment;
    } catch (err) {
      console.error(`Error in updateRouteAssignment for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a route assignment
   * @param id - Route assignment ID
   * @returns Promise with success status
   */
  deleteRouteAssignment: async (id: string): Promise<boolean> => {
    try {
      // First delete all execution logs for this assignment
      const { error: logsError } = await supabase
        .from('route_execution_logs')
        .delete()
        .eq('route_assignment_id', id);

      if (logsError) {
        console.error(`Error deleting execution logs for assignment ${id}:`, logsError);
        throw logsError;
      }

      // Then delete the assignment
      const { error } = await supabase
        .from('route_assignments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting route assignment with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteRouteAssignment for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Get route assignments by vehicle ID
   * @param vehicleId - Vehicle ID
   * @returns Promise with array of route assignments
   */
  getRouteAssignmentsByVehicle: async (vehicleId: string): Promise<FrontendRouteAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('route_assignments')
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .eq('vehicle_id', vehicleId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error(`Error fetching route assignments for vehicle ${vehicleId}:`, error);
        throw error;
      }

      if (!data) return [];

      return data.map((assignment: RouteAssignment & { 
        combined_routes?: { id: string, name: string },
        vehicles?: { id: string, make: string, model: string, year: number, registration_number: string },
        users?: { id: string, raw_user_meta_data: unknown }
      }) => {
        const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(assignment);
        
        // Add combined route name
        if (assignment.combined_routes) {
          frontendAssignment.combinedRouteName = assignment.combined_routes.name;
        }
        
        // Add vehicle info
        if (assignment.vehicles) {
          const vehicle = assignment.vehicles;
          frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
        }
        
        // Add driver name
        if (assignment.users && assignment.users.raw_user_meta_data) {
          const userMeta = assignment.users.raw_user_meta_data;
          if (typeof userMeta === 'object' && userMeta !== null) {
            const metaData = userMeta as { first_name?: string; last_name?: string; };
            frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
          }
        }
        
        return frontendAssignment;
      });
    } catch (err) {
      console.error(`Error in getRouteAssignmentsByVehicle for vehicle ${vehicleId}:`, err);
      throw err;
    }
  },

  /**
   * Get route assignments by driver ID
   * @param driverId - Driver ID
   * @returns Promise with array of route assignments
   */
  getRouteAssignmentsByDriver: async (driverId: string): Promise<FrontendRouteAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('route_assignments')
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .eq('driver_id', driverId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error(`Error fetching route assignments for driver ${driverId}:`, error);
        throw error;
      }

      if (!data) return [];

      return data.map((assignment: RouteAssignment & { 
        combined_routes?: { id: string, name: string },
        vehicles?: { id: string, make: string, model: string, year: number, registration_number: string },
        users?: { id: string, raw_user_meta_data: unknown }
      }) => {
        const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(assignment);
        
        // Add combined route name
        if (assignment.combined_routes) {
          frontendAssignment.combinedRouteName = assignment.combined_routes.name;
        }
        
        // Add vehicle info
        if (assignment.vehicles) {
          const vehicle = assignment.vehicles;
          frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
        }
        
        // Add driver name
        if (assignment.users && assignment.users.raw_user_meta_data) {
          const userMeta = assignment.users.raw_user_meta_data;
          if (typeof userMeta === 'object' && userMeta !== null) {
            const metaData = userMeta as { first_name?: string; last_name?: string; };
            frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
          }
        }
        
        return frontendAssignment;
      });
    } catch (err) {
      console.error(`Error in getRouteAssignmentsByDriver for driver ${driverId}:`, err);
      throw err;
    }
  },

  /**
   * Get route assignments by status
   * @param status - Assignment status
   * @returns Promise with array of route assignments
   */
  getRouteAssignmentsByStatus: async (status: string): Promise<FrontendRouteAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('route_assignments')
        .select(`
          *,
          combined_routes(id, name),
          vehicles(id, make, model, year, registration_number),
          users(id, raw_user_meta_data)
        `)
        .eq('status', status)
        .order('start_date', { ascending: false });

      if (error) {
        console.error(`Error fetching route assignments with status ${status}:`, error);
        throw error;
      }

      if (!data) return [];

      return data.map((assignment: RouteAssignment & { 
        combined_routes?: { id: string, name: string },
        vehicles?: { id: string, make: string, model: string, year: number, registration_number: string },
        users?: { id: string, raw_user_meta_data: unknown }
      }) => {
        const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(assignment);
        
        // Add combined route name
        if (assignment.combined_routes) {
          frontendAssignment.combinedRouteName = assignment.combined_routes.name;
        }
        
        // Add vehicle info
        if (assignment.vehicles) {
          const vehicle = assignment.vehicles;
          frontendAssignment.vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
        }
        
        // Add driver name
        if (assignment.users && assignment.users.raw_user_meta_data) {
          const userMeta = assignment.users.raw_user_meta_data;
          if (typeof userMeta === 'object' && userMeta !== null) {
            const metaData = userMeta as { first_name?: string; last_name?: string; };
            frontendAssignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
          }
        }
        
        return frontendAssignment;
      });
    } catch (err) {
      console.error(`Error in getRouteAssignmentsByStatus:`, err);
      throw err;
    }
  },

  /**
   * Get all drivers for the driver dropdown
   * Fetches staff members with department "driver" from the billing_staff table
   * @returns Promise with array of drivers
   */
  getDriversForDropdown: async () => {
    try {
      // Use the RouteDriverService to get drivers from billing_staff database
      return await RouteDriverService.getDriversForDropdown();
    } catch (err) {
      console.error('Error in getDriversForDropdown:', err);
      throw err;
    }
  }
};

export default RouteAssignmentService;
