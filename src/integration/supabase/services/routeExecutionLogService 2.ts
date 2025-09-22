import { supabase } from '../index';
import { 
  RouteExecutionLog,
  FrontendRouteExecutionLog,
  mapDatabaseRouteExecutionLogToFrontend,
  mapFrontendRouteExecutionLogToDatabase
} from '../types/route-assignment';

/**
 * Service for managing route execution logs in the system
 */
export const RouteExecutionLogService = {
  /**
   * Get all route execution logs
   * @returns Promise with array of route execution logs
   */
  getAllRouteExecutionLogs: async (): Promise<FrontendRouteExecutionLog[]> => {
    try {
      const { data, error } = await supabase
        .from('route_execution_logs')
        .select('*')
        .order('execution_date', { ascending: false });

      if (error) {
        console.error('Error fetching route execution logs:', error);
        throw error;
      }

      return data ? data.map((log: RouteExecutionLog) => mapDatabaseRouteExecutionLogToFrontend(log)) : [];
    } catch (err) {
      console.error('Error in getAllRouteExecutionLogs:', err);
      throw err;
    }
  },

  /**
   * Get a route execution log by ID
   * @param id - Route execution log ID
   * @returns Promise with route execution log data
   */
  getRouteExecutionLogById: async (id: string): Promise<FrontendRouteExecutionLog | null> => {
    try {
      const { data, error } = await supabase
        .from('route_execution_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching route execution log with ID ${id}:`, error);
        throw error;
      }

      return data ? mapDatabaseRouteExecutionLogToFrontend(data as RouteExecutionLog) : null;
    } catch (err) {
      console.error(`Error in getRouteExecutionLogById for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new route execution log
   * @param log - Route execution log data to create
   * @returns Promise with created route execution log data
   */
  createRouteExecutionLog: async (
    log: Omit<FrontendRouteExecutionLog, 'id'>
  ): Promise<FrontendRouteExecutionLog> => {
    try {
      // Convert to database format, omitting id and created_at which will be generated
      const { id, created_at, updated_at, ...dbLog } = mapFrontendRouteExecutionLogToDatabase({
        ...log,
        id: '', // This will be ignored
      });
      
      const { data, error } = await supabase
        .from('route_execution_logs')
        .insert(dbLog)
        .select()
        .single();

      if (error) {
        console.error('Error creating route execution log:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after creating route execution log');
      }

      return mapDatabaseRouteExecutionLogToFrontend(data as RouteExecutionLog);
    } catch (err) {
      console.error('Error in createRouteExecutionLog:', err);
      throw err;
    }
  },

  /**
   * Update an existing route execution log
   * @param id - Route execution log ID
   * @param log - Updated route execution log data
   * @returns Promise with updated route execution log data
   */
  updateRouteExecutionLog: async (
    id: string,
    log: Omit<FrontendRouteExecutionLog, 'id'>
  ): Promise<FrontendRouteExecutionLog> => {
    try {
      // Convert to database format, adding updated_at timestamp
      const dbLog = {
        route_assignment_id: log.routeAssignmentId,
        execution_date: log.executionDate,
        start_time: log.startTime,
        end_time: log.endTime,
        status: log.status,
        delay_reason: log.delayReason,
        notes: log.notes,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('route_execution_logs')
        .update(dbLog)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating route execution log with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`No data returned after updating route execution log with ID ${id}`);
      }

      return mapDatabaseRouteExecutionLogToFrontend(data as RouteExecutionLog);
    } catch (err) {
      console.error(`Error in updateRouteExecutionLog for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a route execution log
   * @param id - Route execution log ID
   * @returns Promise with success status
   */
  deleteRouteExecutionLog: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('route_execution_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting route execution log with ID ${id}:`, error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error(`Error in deleteRouteExecutionLog for ID ${id}:`, err);
      throw err;
    }
  },

  /**
   * Get route execution logs by route assignment ID
   * @param assignmentId - Route assignment ID
   * @returns Promise with array of route execution logs
   */
  getRouteExecutionLogsByAssignment: async (assignmentId: string): Promise<FrontendRouteExecutionLog[]> => {
    try {
      const { data, error } = await supabase
        .from('route_execution_logs')
        .select('*')
        .eq('route_assignment_id', assignmentId)
        .order('execution_date', { ascending: false });

      if (error) {
        console.error(`Error fetching route execution logs for assignment ${assignmentId}:`, error);
        throw error;
      }

      return data ? data.map((log: RouteExecutionLog) => mapDatabaseRouteExecutionLogToFrontend(log)) : [];
    } catch (err) {
      console.error(`Error in getRouteExecutionLogsByAssignment for assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  /**
   * Get route execution logs by status
   * @param status - Execution status
   * @returns Promise with array of route execution logs
   */
  getRouteExecutionLogsByStatus: async (status: string): Promise<FrontendRouteExecutionLog[]> => {
    try {
      const { data, error } = await supabase
        .from('route_execution_logs')
        .select('*')
        .eq('status', status)
        .order('execution_date', { ascending: false });

      if (error) {
        console.error(`Error fetching route execution logs with status ${status}:`, error);
        throw error;
      }

      return data ? data.map((log: RouteExecutionLog) => mapDatabaseRouteExecutionLogToFrontend(log)) : [];
    } catch (err) {
      console.error(`Error in getRouteExecutionLogsByStatus for status ${status}:`, err);
      throw err;
    }
  },

  /**
   * Get route execution logs by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Promise with array of route execution logs
   */
  getRouteExecutionLogsByDateRange: async (startDate: string, endDate: string): Promise<FrontendRouteExecutionLog[]> => {
    try {
      const { data, error } = await supabase
        .from('route_execution_logs')
        .select('*')
        .gte('execution_date', startDate)
        .lte('execution_date', endDate)
        .order('execution_date', { ascending: false });

      if (error) {
        console.error(`Error fetching route execution logs between ${startDate} and ${endDate}:`, error);
        throw error;
      }

      return data ? data.map((log: RouteExecutionLog) => mapDatabaseRouteExecutionLogToFrontend(log)) : [];
    } catch (err) {
      console.error(`Error in getRouteExecutionLogsByDateRange for range ${startDate} to ${endDate}:`, err);
      throw err;
    }
  }
};

export default RouteExecutionLogService;
