import { supabase } from '../index';
import { getDrivers } from '../../../hooks/billing/staffApi';

/**
 * Service for handling driver data for route assignments
 * This service ensures that driver details are loaded from the billing_staff database
 * where the department is "driver"
 */
export const RouteDriverService = {
  /**
   * Get driver name from billing_staff database
   * @param driverId - Driver ID
   * @returns Promise with driver name or null
   */
  getDriverName: async (driverId: string): Promise<string | null> => {
    try {
      // Get the driver details from billing_staff by ID
      const { data, error } = await supabase
        .from('billing_staff')
        .select('legal_name, department')
        .eq('id', driverId)
        .single();
      
      if (error) {
        console.error(`Error fetching driver details for ID ${driverId}:`, error);
        return null;
      }
      
      if (data) {
        // Verify this staff member is actually a driver
        if (data.department?.toLowerCase() === 'driver') {
          return data.legal_name || null;
        } else {
          console.warn(`Staff member ${driverId} is not a driver (department: ${data.department})`);
          return null;
        }
      }
      
      return null;
    } catch (err) {
      console.error(`Error in getDriverName for ID ${driverId}:`, err);
      return null;
    }
  },

  /**
   * Get all drivers for dropdown selection
   * @returns Promise with array of drivers
   */
  getDriversForDropdown: async () => {
    try {
      console.log('Fetching drivers for dropdown from billing_staff database');
      const drivers = await getDrivers();
      
      // Map the billing staff data to the format needed for the dropdown
      return drivers.map(driver => ({
        id: driver.id,
        name: driver.legalName,
        employeeId: driver.employeeId || '',
        department: driver.department
      }));
    } catch (err) {
      console.error('Error in getDriversForDropdown:', err);
      throw err;
    }
  },

  /**
   * Enrich a route assignment with driver details from billing_staff
   * @param assignment - Route assignment to enrich
   * @returns Promise with enriched assignment
   */
  enrichAssignmentWithDriverDetails: async (assignment: any) => {
    try {
      if (!assignment || !assignment.driver_id) {
        return assignment;
      }

      // Get driver name from billing_staff
      const driverName = await RouteDriverService.getDriverName(assignment.driver_id);
      
      if (driverName) {
        // Add driver name to assignment
        assignment.driverName = driverName;
      } else {
        // Fallback to user metadata if driver not found in billing_staff
        if (assignment.users && assignment.users.raw_user_meta_data) {
          const userMeta = assignment.users.raw_user_meta_data;
          if (typeof userMeta === 'object' && userMeta !== null) {
            const metaData = userMeta as { first_name?: string; last_name?: string; };
            assignment.driverName = `${metaData.first_name || ''} ${metaData.last_name || ''}`.trim();
          }
        }
      }
      
      return assignment;
    } catch (err) {
      console.error(`Error enriching assignment with driver details:`, err);
      return assignment;
    }
  }
};

export default RouteDriverService;
