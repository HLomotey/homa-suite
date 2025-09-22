import { supabase } from "@/integration/supabase";
import {
  DatabaseRoute,
  DatabaseRouteSchedule,
  DatabaseCombinedRoute,
  DatabaseCombinedRouteDetail,
  DatabaseRouteAssignment,
  DatabaseRouteExecutionLog,
  FrontendRoute,
  FrontendRouteSchedule,
  FrontendCombinedRoute,
  FrontendCombinedRouteDetail,
  FrontendRouteAssignment,
  FrontendRouteExecutionLog,
  mapDatabaseRouteToFrontend,
  mapDatabaseRouteAssignmentToFrontend,
  mapDatabaseRouteExecutionLogToFrontend
} from "@/integration/supabase/types/transport-route";
import { RouteDriverService } from "@/integration/supabase/services/routeDriverService";

// Utility function to validate date format (YYYY-MM-DD)
export function isValidDateFormat(dateString: string): boolean {
  if (!dateString) return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Utility function to validate time format (HH:MM)
export function isValidTimeFormat(timeString: string): boolean {
  if (!timeString) return false;
  
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
}

// Basic Routes API
export async function fetchRoutes(): Promise<FrontendRoute[]> {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        schedules:route_schedules(*)
      `)
      .order('name');

    if (error) throw error;

    if (!data) return [];

    return data.map(route => {
      const frontendRoute = mapDatabaseRouteToFrontend(route);
      frontendRoute.schedules = route.schedules || [];
      return frontendRoute;
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}

export async function fetchRouteById(id: string): Promise<FrontendRoute> {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        schedules:route_schedules(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) throw new Error(`Route with id ${id} not found`);

    const frontendRoute = mapDatabaseRouteToFrontend(data);
    frontendRoute.schedules = data.schedules || [];
    return frontendRoute;
  } catch (error) {
    console.error(`Error fetching route with id ${id}:`, error);
    throw error;
  }
}

export async function createRoute(
  name: string,
  description: string,
  schedules: { day: string; startTime: string; endTime: string }[]
): Promise<FrontendRoute> {
  try {
    // Validate inputs
    if (!name) throw new Error('Route name is required');
    
    // Validate schedule times
    for (const schedule of schedules) {
      if (!isValidTimeFormat(schedule.startTime)) {
        throw new Error(`Invalid start time format: ${schedule.startTime}. Expected format: HH:MM`);
      }
      if (!isValidTimeFormat(schedule.endTime)) {
        throw new Error(`Invalid end time format: ${schedule.endTime}. Expected format: HH:MM`);
      }
    }
    
    // Create route
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .insert([{ name, description }])
      .select()
      .single();

    if (routeError) throw routeError;
    
    // Create schedules
    if (schedules.length > 0) {
      const schedulesWithRouteId = schedules.map(schedule => ({
        route_id: routeData.id,
        day: schedule.day,
        start_time: schedule.startTime,
        end_time: schedule.endTime
      }));
      
      const { error: schedulesError } = await supabase
        .from('route_schedules')
        .insert(schedulesWithRouteId);
      
      if (schedulesError) throw schedulesError;
    }
    
    // Fetch the complete route with schedules
    return await fetchRouteById(routeData.id);
  } catch (error) {
    console.error('Error creating route:', error);
    throw error;
  }
}

export async function updateRoute(
  id: string,
  name: string,
  description: string,
  schedules: { id?: string; day: string; startTime: string; endTime: string }[]
): Promise<FrontendRoute> {
  try {
    // Validate inputs
    if (!id) throw new Error('Route ID is required');
    if (!name) throw new Error('Route name is required');
    
    // Validate schedule times
    for (const schedule of schedules) {
      if (!isValidTimeFormat(schedule.startTime)) {
        throw new Error(`Invalid start time format: ${schedule.startTime}. Expected format: HH:MM`);
      }
      if (!isValidTimeFormat(schedule.endTime)) {
        throw new Error(`Invalid end time format: ${schedule.endTime}. Expected format: HH:MM`);
      }
    }
    
    // Update route
    const { error: routeError } = await supabase
      .from('routes')
      .update({ name, description })
      .eq('id', id);

    if (routeError) throw routeError;
    
    // Get existing schedules
    const { data: existingSchedules, error: fetchError } = await supabase
      .from('route_schedules')
      .select('*')
      .eq('route_id', id);
    
    if (fetchError) throw fetchError;
    
    // Identify schedules to add, update, or delete
    const existingIds = existingSchedules?.map(s => s.id) || [];
    const updatedIds = schedules.filter(s => s.id).map(s => s.id as string);
    
    // Schedules to delete (exist in DB but not in updated list)
    const toDelete = existingIds.filter(id => !updatedIds.includes(id));
    
    // Delete schedules
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('route_schedules')
        .delete()
        .in('id', toDelete);
      
      if (deleteError) throw deleteError;
    }
    
    // Update existing and add new schedules
    for (const schedule of schedules) {
      if (schedule.id) {
        // Update existing schedule
        const { error: updateError } = await supabase
          .from('route_schedules')
          .update({
            day: schedule.day,
            start_time: schedule.startTime,
            end_time: schedule.endTime
          })
          .eq('id', schedule.id);
        
        if (updateError) throw updateError;
      } else {
        // Add new schedule
        const { error: insertError } = await supabase
          .from('route_schedules')
          .insert([{
            route_id: id,
            day: schedule.day,
            start_time: schedule.startTime,
            end_time: schedule.endTime
          }]);
        
        if (insertError) throw insertError;
      }
    }
    
    // Fetch the updated route with schedules
    return await fetchRouteById(id);
  } catch (error) {
    console.error(`Error updating route with id ${id}:`, error);
    throw error;
  }
}

export async function deleteRoute(id: string): Promise<void> {
  try {
    // Delete schedules first (foreign key constraint)
    const { error: schedulesError } = await supabase
      .from('route_schedules')
      .delete()
      .eq('route_id', id);
    
    if (schedulesError) throw schedulesError;
    
    // Delete route
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting route with id ${id}:`, error);
    throw error;
  }
}

// Combined Routes API
export async function fetchCombinedRoutes(): Promise<FrontendCombinedRoute[]> {
  try {
    const { data, error } = await supabase
      .from('combined_routes')
      .select(`
        *,
        routes:combined_route_details(
          id,
          route_id,
          order,
          route:routes(
            id,
            name,
            description
          )
        )
      `)
      .order('name');

    if (error) throw error;

    if (!data) return [];

    return data.map(combinedRoute => {
      const frontendCombinedRoute: FrontendCombinedRoute = {
        id: combinedRoute.id,
        name: combinedRoute.name,
        description: combinedRoute.description || '',
        status: combinedRoute.status,
        createdBy: combinedRoute.created_by,
        createdAt: combinedRoute.created_at,
        updatedAt: combinedRoute.updated_at,
        routes: []
      };
      
      // Process routes
      if (combinedRoute.routes && Array.isArray(combinedRoute.routes)) {
        frontendCombinedRoute.routes = combinedRoute.routes.map((routeLink: DatabaseCombinedRouteDetail & { route?: { name: string, description?: string } }) => ({
          id: routeLink.route_id,
          name: routeLink.route?.name || 'Unknown Route',
          description: routeLink.route?.description || '',
          order: routeLink.order
        })).sort((a, b) => a.order - b.order);
      }
      
      return frontendCombinedRoute;
    });
  } catch (error) {
    console.error('Error fetching combined routes:', error);
    throw error;
  }
}

export async function fetchCombinedRouteById(id: string): Promise<FrontendCombinedRoute> {
  try {
    const { data, error } = await supabase
      .from('combined_routes')
      .select(`
        *,
        routes:combined_route_details(
          id,
          route_id,
          order,
          route:routes(
            id,
            name,
            description
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) throw new Error(`Combined route with id ${id} not found`);

    const frontendCombinedRoute: FrontendCombinedRoute = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      routes: []
    };
    
    // Process routes
    if (data.routes && Array.isArray(data.routes)) {
      frontendCombinedRoute.routes = data.routes.map((routeLink: DatabaseCombinedRouteDetail & { route?: { name: string, description?: string } }) => ({
        id: routeLink.route_id,
        name: routeLink.route?.name || 'Unknown Route',
        description: routeLink.route?.description || '',
        order: routeLink.order
      })).sort((a, b) => a.order - b.order);
    }
    
    return frontendCombinedRoute;
  } catch (error) {
    console.error(`Error fetching combined route with id ${id}:`, error);
    throw error;
  }
}

export async function createCombinedRoute(
  name: string,
  description: string,
  createdBy: string,
  routes: { routeId: string; order: number }[]
): Promise<FrontendCombinedRoute> {
  try {
    // Validate inputs
    if (!name) throw new Error('Combined route name is required');
    if (!createdBy) throw new Error('Created by is required');
    if (!routes || routes.length === 0) throw new Error('At least one route is required');
    
    // Create combined route
    const { data: combinedRouteData, error: combinedRouteError } = await supabase
      .from('combined_routes')
      .insert([{ 
        name, 
        description, 
        status: 'active',
        created_by: createdBy
      }])
      .select()
      .single();

    if (combinedRouteError) throw combinedRouteError;
    
    // Create route links
    const routeLinks = routes.map(route => ({
      combined_route_id: combinedRouteData.id,
      route_id: route.routeId,
      order: route.order
    }));
    
    const { error: routeLinksError } = await supabase
      .from('combined_route_routes')
      .insert(routeLinks);
    
    if (routeLinksError) throw routeLinksError;
    
    // Fetch the complete combined route with routes
    return await fetchCombinedRouteById(combinedRouteData.id);
  } catch (error) {
    console.error('Error creating combined route:', error);
    throw error;
  }
}

export async function updateCombinedRoute(
  id: string,
  name: string,
  description: string,
  status: 'active' | 'inactive',
  routes: { routeId: string; order: number }[]
): Promise<FrontendCombinedRoute> {
  try {
    // Validate inputs
    if (!id) throw new Error('Combined route ID is required');
    if (!name) throw new Error('Combined route name is required');
    if (!routes || routes.length === 0) throw new Error('At least one route is required');
    
    // Update combined route
    const { error: combinedRouteError } = await supabase
      .from('combined_routes')
      .update({ name, description, status })
      .eq('id', id);

    if (combinedRouteError) throw combinedRouteError;
    
    // Delete existing route links
    const { error: deleteError } = await supabase
      .from('combined_route_routes')
      .delete()
      .eq('combined_route_id', id);
    
    if (deleteError) throw deleteError;
    
    // Create new route links
    const routeLinks = routes.map(route => ({
      combined_route_id: id,
      route_id: route.routeId,
      order: route.order
    }));
    
    const { error: routeLinksError } = await supabase
      .from('combined_route_routes')
      .insert(routeLinks);
    
    if (routeLinksError) throw routeLinksError;
    
    // Fetch the updated combined route with routes
    return await fetchCombinedRouteById(id);
  } catch (error) {
    console.error(`Error updating combined route with id ${id}:`, error);
    throw error;
  }
}

export async function deleteCombinedRoute(id: string): Promise<void> {
  try {
    // Delete route links first (foreign key constraint)
    const { error: linksError } = await supabase
      .from('combined_route_routes')
      .delete()
      .eq('combined_route_id', id);
    
    if (linksError) throw linksError;
    
    // Delete combined route
    const { error } = await supabase
      .from('combined_routes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting combined route with id ${id}:`, error);
    throw error;
  }
}

// Route Assignments API
export async function fetchRouteAssignments(): Promise<FrontendRouteAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('route_assignments')
      .select(`
        *,
        combined_route:combined_routes(name),
        vehicle:vehicles(make, model, license_plate),
        driver:billing_staff(id, legal_name, preferred_name)
      `)
      .order('start_date', { ascending: false });

    if (error) throw error;

    if (!data) return [];

    // First convert all assignments to frontend format
    const frontendAssignments = data.map(assignment => mapDatabaseRouteAssignmentToFrontend(assignment));
    
    // Then enrich each assignment with driver details from billing_staff
    const enrichedAssignments = [];
    for (const assignment of frontendAssignments) {
      const originalData = data.find(d => d.id === assignment.id);
      if (originalData) {
        const enriched = await RouteDriverService.enrichAssignmentWithDriverDetails({
          ...assignment,
          driver_id: originalData.driver_id,
          users: originalData.users
        });
        enrichedAssignments.push(enriched);
      } else {
        enrichedAssignments.push(assignment);
      }
    }
    
    return enrichedAssignments;
  } catch (error) {
    console.error('Error fetching route assignments:', error);
    throw error;
  }
}

export async function fetchRouteAssignmentById(id: string): Promise<FrontendRouteAssignment> {
  try {
    const { data, error } = await supabase
      .from('route_assignments')
      .select(`
        *,
        combined_route:combined_routes(name),
        vehicle:vehicles(make, model, license_plate),
        driver:billing_staff(id, legal_name, preferred_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) throw new Error(`Route assignment with id ${id} not found`);

    // First convert to frontend format
    const frontendAssignment = mapDatabaseRouteAssignmentToFrontend(data);
    
    // Then enrich with driver details from billing_staff
    const enrichedAssignment = await RouteDriverService.enrichAssignmentWithDriverDetails({
      ...frontendAssignment,
      driver_id: data.driver_id,
      users: data.users
    });
    
    return enrichedAssignment;
  } catch (error) {
    console.error(`Error fetching route assignment with id ${id}:`, error);
    throw error;
  }
}

export async function createRouteAssignment(
  routeId: string | null,
  combinedRouteId: string | null,
  vehicleId: string,
  driverId: string,
  startDate: string,
  endDate: string | null,
  notes: string
): Promise<FrontendRouteAssignment> {
  try {
    // Validate inputs
    if (!routeId && !combinedRouteId) throw new Error('Either route ID or combined route ID is required');
    if (routeId && combinedRouteId) throw new Error('Cannot specify both route ID and combined route ID');
    if (!vehicleId) throw new Error('Vehicle ID is required');
    if (!driverId) throw new Error('Driver ID is required');
    if (!startDate) throw new Error('Start date is required');
    
    // Validate date formats
    if (!isValidDateFormat(startDate)) {
      throw new Error(`Invalid start date format: ${startDate}. Expected format: YYYY-MM-DD`);
    }
    
    if (endDate && !isValidDateFormat(endDate)) {
      throw new Error(`Invalid end date format: ${endDate}. Expected format: YYYY-MM-DD`);
    }
    const { data: newAssignment, error } = await supabase
      .from('route_assignments')
      .insert([{
        route_id: routeId,
        combined_route_id: combinedRouteId,
        vehicle_id: vehicleId,
        driver_id: driverId,
        start_date: startDate,
        end_date: endDate,
        status: 'scheduled',
        notes
      }])
      .select(`
        *,
        combined_route:combined_routes(name),
        vehicle:vehicles(make, model, license_plate)
      `)
      .single();

    if (error) throw error;

    // First convert to frontend format
    const frontendAssignment = mapDatabaseRouteAssignmentToFrontend({
      ...newAssignment,
      combined_route_name: newAssignment.combined_route ? newAssignment.combined_route.name : 'Unknown Route',
      vehicle_info: newAssignment.vehicle ? 
        `${newAssignment.vehicle.make} ${newAssignment.vehicle.model} (${newAssignment.vehicle.license_plate})` : 
        'Unknown Vehicle'
    });
    
    // Then enrich with driver details from billing_staff
    const enrichedAssignment = await RouteDriverService.enrichAssignmentWithDriverDetails({
      ...frontendAssignment,
      driver_id: driverId
    });
    
    return enrichedAssignment;
  } catch (error) {
    console.error('Error creating route assignment:', error);
    throw error;
  }
}

export async function updateRouteAssignment(
  id: string,
  vehicleId: string,
  driverId: string,
  startDate: string,
  endDate: string | null,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  notes: string
): Promise<FrontendRouteAssignment> {
  try {
    // Validate inputs
    if (!id) throw new Error('Assignment ID is required');
    if (!vehicleId) throw new Error('Vehicle ID is required');
    if (!driverId) throw new Error('Driver ID is required');
    if (!startDate) throw new Error('Start date is required');
    if (!status) throw new Error('Status is required');
    
    // Validate date formats
    if (startDate && !isValidDateFormat(startDate)) {
      throw new Error(`Invalid start date format: ${startDate}. Expected format: YYYY-MM-DD`);
    }
    
    if (endDate && !isValidDateFormat(endDate)) {
      throw new Error(`Invalid end date format: ${endDate}. Expected format: YYYY-MM-DD`);
    }
    const { data: updatedAssignment, error } = await supabase
      .from('route_assignments')
      .update({
        vehicle_id: vehicleId,
        driver_id: driverId,
        start_date: startDate,
        end_date: endDate,
        status,
        notes
      })
      .eq('id', id)
      .select(`
        *,
        combined_route:combined_routes(name),
        vehicle:vehicles(make, model, license_plate)
      `)
      .single();

    if (error) throw error;

    // First convert to frontend format
    const frontendAssignment = mapDatabaseRouteAssignmentToFrontend({
      ...updatedAssignment,
      combined_route_name: updatedAssignment.combined_route ? updatedAssignment.combined_route.name : 'Unknown Route',
      vehicle_info: updatedAssignment.vehicle ? 
        `${updatedAssignment.vehicle.make} ${updatedAssignment.vehicle.model} (${updatedAssignment.vehicle.license_plate})` : 
        'Unknown Vehicle'
    });
    
    // Then enrich with driver details from billing_staff
    const enrichedAssignment = await RouteDriverService.enrichAssignmentWithDriverDetails({
      ...frontendAssignment,
      driver_id: driverId
    });
    
    return enrichedAssignment;
  } catch (error) {
    console.error(`Error updating route assignment with id ${id}:`, error);
    throw error;
  }
}

export async function deleteRouteAssignment(id: string): Promise<void> {
  try {
    // Delete execution logs first (foreign key constraint)
    const { error: logsError } = await supabase
      .from('route_execution_logs')
      .delete()
      .eq('route_assignment_id', id);

    if (logsError) throw logsError;

    // Delete assignment
    const { error } = await supabase
      .from('route_assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting route assignment with id ${id}:`, error);
    throw error;
  }
}

// Route Execution Logs API
export async function createRouteExecutionLog(
  routeAssignmentId: string,
  executionDate: string,
  startTime: string,
  status: 'started' | 'completed' | 'delayed' | 'cancelled',
  notes: string,
  delayReason?: string,
  endTime?: string
): Promise<FrontendRouteExecutionLog> {
  try {
    // Validate inputs
    if (!routeAssignmentId) throw new Error('Route assignment ID is required');
    if (!executionDate) throw new Error('Execution date is required');
    if (!startTime) throw new Error('Start time is required');
    if (!status) throw new Error('Status is required');
    
    // Validate date and time formats
    if (!isValidDateFormat(executionDate)) {
      throw new Error(`Invalid execution date format: ${executionDate}. Expected format: YYYY-MM-DD`);
    }
    
    if (!isValidTimeFormat(startTime)) {
      throw new Error(`Invalid start time format: ${startTime}. Expected format: HH:MM`);
    }
    
    if (endTime && !isValidTimeFormat(endTime)) {
      throw new Error(`Invalid end time format: ${endTime}. Expected format: HH:MM`);
    }
    
    const { data, error } = await supabase
      .from('route_execution_logs')
      .insert([{
        route_assignment_id: routeAssignmentId,
        execution_date: executionDate,
        start_time: startTime,
        end_time: endTime || null,
        status,
        notes,
        delay_reason: delayReason || null
      }])
      .select()
      .single();

    if (error) throw error;

    return mapDatabaseRouteExecutionLogToFrontend(data);
  } catch (error) {
    console.error('Error creating route execution log:', error);
    throw error;
  }
}

export async function updateRouteExecutionLog(
  id: string,
  endTime: string,
  status: 'completed' | 'delayed' | 'cancelled',
  notes: string,
  delayReason?: string
): Promise<FrontendRouteExecutionLog> {
  try {
    // Validate inputs
    if (!id) throw new Error('Log ID is required');
    if (!endTime) throw new Error('End time is required');
    if (!status) throw new Error('Status is required');
    
    // Validate time format
    if (!isValidTimeFormat(endTime)) {
      throw new Error(`Invalid end time format: ${endTime}. Expected format: HH:MM`);
    }
    
    const { data, error } = await supabase
      .from('route_execution_logs')
      .update({
        end_time: endTime,
        status,
        notes,
        delay_reason: delayReason || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapDatabaseRouteExecutionLogToFrontend(data);
  } catch (error) {
    console.error(`Error updating route execution log with id ${id}:`, error);
    throw error;
  }
}

export async function fetchRouteExecutionLogsByAssignment(
  assignmentId: string
): Promise<FrontendRouteExecutionLog[]> {
  try {
    const { data, error } = await supabase
      .from('route_execution_logs')
      .select('*')
      .eq('route_assignment_id', assignmentId)
      .order('execution_date', { ascending: false });

    if (error) throw error;

    if (!data) return [];

    return data.map(log => mapDatabaseRouteExecutionLogToFrontend(log));
  } catch (error) {
    console.error(`Error fetching execution logs for assignment ${assignmentId}:`, error);
    throw error;
  }
}

export async function deleteRouteExecutionLog(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('route_execution_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting route execution log with id ${id}:`, error);
    throw error;
  }
}
