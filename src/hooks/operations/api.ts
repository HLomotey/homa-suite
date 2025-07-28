/**
 * Operations API functions for Supabase integration
 * These functions handle direct communication with Supabase for operations data
 */

import { supabase } from "../../integration/supabase/client";
import {
  JobOrder,
  RegionPerformance,
  TopPerformer,
  ClientSatisfaction,
  JobOrderTrend,
  TimeToFillTrend,
  JobType,
  FrontendJobOrder,
  FrontendRegionPerformance,
  FrontendTopPerformer,
  FrontendClientSatisfaction,
  FrontendJobOrderTrend,
  FrontendTimeToFillTrend,
  FrontendJobType,
  JobOrderStatus,
  mapDatabaseJobOrderToFrontend,
  mapDatabaseRegionPerformanceToFrontend,
  mapDatabaseTopPerformerToFrontend,
  mapDatabaseClientSatisfactionToFrontend,
  mapDatabaseJobOrderTrendToFrontend,
  mapDatabaseTimeToFillTrendToFrontend,
  mapDatabaseJobTypeToFrontend
} from "../../integration/supabase/types";

/**
 * Fetch all job orders from Supabase
 * @returns Promise with array of job orders
 */
export const fetchJobOrders = async (): Promise<FrontendJobOrder[]> => {
  const { data, error } = await supabase
    .from("job_orders")
    .select("*")
    .order("date_created", { ascending: false });

  if (error) {
    console.error("Error fetching job orders:", error);
    throw new Error(error.message);
  }

  return (data as JobOrder[]).map(mapDatabaseJobOrderToFrontend);
};

/**
 * Fetch a single job order by ID
 * @param id Job order ID
 * @returns Promise with job order data
 */
export const fetchJobOrderById = async (
  id: string
): Promise<FrontendJobOrder> => {
  const { data, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching job order with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseJobOrderToFrontend(data as JobOrder);
};

/**
 * Create a new job order
 * @param jobOrder Job order data to create
 * @returns Promise with created job order data
 */
export const createJobOrder = async (
  jobOrder: Omit<FrontendJobOrder, "id">
): Promise<FrontendJobOrder> => {
  // Convert frontend job order to database format
  const dbJobOrder = {
    job_order_id: jobOrder.jobOrderId,
    client: jobOrder.client,
    position: jobOrder.position,
    status: jobOrder.status,
    date_created: jobOrder.date,
    time_to_fill: jobOrder.timeToFill
  };

  const { data, error } = await supabase
    .from("job_orders")
    .insert(dbJobOrder)
    .select()
    .single();

  if (error) {
    console.error("Error creating job order:", error);
    throw new Error(error.message);
  }

  return mapDatabaseJobOrderToFrontend(data as JobOrder);
};

/**
 * Update an existing job order
 * @param id Job order ID
 * @param jobOrder Job order data to update
 * @returns Promise with updated job order data
 */
export const updateJobOrder = async (
  id: string,
  jobOrder: Partial<Omit<FrontendJobOrder, "id">>
): Promise<FrontendJobOrder> => {
  // Convert frontend job order to database format
  const dbJobOrder: any = {};
  
  if (jobOrder.jobOrderId !== undefined) dbJobOrder.job_order_id = jobOrder.jobOrderId;
  if (jobOrder.client !== undefined) dbJobOrder.client = jobOrder.client;
  if (jobOrder.position !== undefined) dbJobOrder.position = jobOrder.position;
  if (jobOrder.status !== undefined) dbJobOrder.status = jobOrder.status;
  if (jobOrder.date !== undefined) dbJobOrder.date_created = jobOrder.date;
  if (jobOrder.timeToFill !== undefined) dbJobOrder.time_to_fill = jobOrder.timeToFill;

  const { data, error } = await supabase
    .from("job_orders")
    .update(dbJobOrder)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating job order with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseJobOrderToFrontend(data as JobOrder);
};

/**
 * Delete a job order
 * @param id Job order ID
 * @returns Promise with success status
 */
export const deleteJobOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("job_orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting job order with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch job orders by status
 * @param status Job order status to filter by
 * @returns Promise with array of job orders
 */
export const fetchJobOrdersByStatus = async (
  status: JobOrderStatus
): Promise<FrontendJobOrder[]> => {
  const { data, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("status", status)
    .order("date_created", { ascending: false });

  if (error) {
    console.error(`Error fetching job orders with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as JobOrder[]).map(mapDatabaseJobOrderToFrontend);
};

/**
 * Fetch job orders by client
 * @param client Client name to filter by
 * @returns Promise with array of job orders
 */
export const fetchJobOrdersByClient = async (
  client: string
): Promise<FrontendJobOrder[]> => {
  const { data, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("client", client)
    .order("date_created", { ascending: false });

  if (error) {
    console.error(`Error fetching job orders for client ${client}:`, error);
    throw new Error(error.message);
  }

  return (data as JobOrder[]).map(mapDatabaseJobOrderToFrontend);
};

/**
 * Fetch all region performance data from Supabase
 * @returns Promise with array of region performance data
 */
export const fetchRegionPerformance = async (): Promise<FrontendRegionPerformance[]> => {
  const { data, error } = await supabase
    .from("region_performance")
    .select("*")
    .order("region", { ascending: true });

  if (error) {
    console.error("Error fetching region performance:", error);
    throw new Error(error.message);
  }

  return (data as RegionPerformance[]).map(mapDatabaseRegionPerformanceToFrontend);
};

/**
 * Fetch all top performers from Supabase
 * @returns Promise with array of top performers
 */
export const fetchTopPerformers = async (): Promise<FrontendTopPerformer[]> => {
  const { data, error } = await supabase
    .from("top_performers")
    .select("*")
    .order("placements", { ascending: false });

  if (error) {
    console.error("Error fetching top performers:", error);
    throw new Error(error.message);
  }

  return (data as TopPerformer[]).map(mapDatabaseTopPerformerToFrontend);
};

/**
 * Fetch top performers by region
 * @param region Region to filter by
 * @returns Promise with array of top performers
 */
export const fetchTopPerformersByRegion = async (
  region: string
): Promise<FrontendTopPerformer[]> => {
  const { data, error } = await supabase
    .from("top_performers")
    .select("*")
    .eq("region", region)
    .order("placements", { ascending: false });

  if (error) {
    console.error(`Error fetching top performers for region ${region}:`, error);
    throw new Error(error.message);
  }

  return (data as TopPerformer[]).map(mapDatabaseTopPerformerToFrontend);
};

/**
 * Fetch client satisfaction data from Supabase
 * @returns Promise with array of client satisfaction data
 */
export const fetchClientSatisfaction = async (): Promise<FrontendClientSatisfaction[]> => {
  const { data, error } = await supabase
    .from("client_satisfaction")
    .select("*")
    .order("month", { ascending: true });

  if (error) {
    console.error("Error fetching client satisfaction:", error);
    throw new Error(error.message);
  }

  return (data as ClientSatisfaction[]).map(mapDatabaseClientSatisfactionToFrontend);
};

/**
 * Fetch job order trends from Supabase
 * @returns Promise with array of job order trends
 */
export const fetchJobOrderTrends = async (): Promise<FrontendJobOrderTrend[]> => {
  const { data, error } = await supabase
    .from("job_order_trends")
    .select("*")
    .order("month", { ascending: true });

  if (error) {
    console.error("Error fetching job order trends:", error);
    throw new Error(error.message);
  }

  return (data as JobOrderTrend[]).map(mapDatabaseJobOrderTrendToFrontend);
};

/**
 * Fetch time to fill trends from Supabase
 * @returns Promise with array of time to fill trends
 */
export const fetchTimeToFillTrends = async (): Promise<FrontendTimeToFillTrend[]> => {
  const { data, error } = await supabase
    .from("time_to_fill_trends")
    .select("*")
    .order("month", { ascending: true });

  if (error) {
    console.error("Error fetching time to fill trends:", error);
    throw new Error(error.message);
  }

  return (data as TimeToFillTrend[]).map(mapDatabaseTimeToFillTrendToFrontend);
};

/**
 * Fetch job type distribution from Supabase
 * @returns Promise with array of job types
 */
export const fetchJobTypes = async (): Promise<FrontendJobType[]> => {
  const { data, error } = await supabase
    .from("job_types")
    .select("*")
    .order("count", { ascending: false });

  if (error) {
    console.error("Error fetching job types:", error);
    throw new Error(error.message);
  }

  return (data as JobType[]).map(mapDatabaseJobTypeToFrontend);
};

/**
 * Create or update region performance data
 * @param regionPerformance Region performance data to create or update
 * @returns Promise with created/updated region performance data
 */
export const updateRegionPerformance = async (
  region: string,
  regionPerformance: Omit<FrontendRegionPerformance, "region">
): Promise<FrontendRegionPerformance> => {
  // Convert frontend region performance to database format
  const dbRegionPerformance = {
    region: region,
    fill_rate: regionPerformance.fillRate,
    time_to_fill: regionPerformance.timeToFill,
    client_satisfaction: regionPerformance.clientSatisfaction
  };

  // Check if region performance already exists
  const { data: existingData, error: checkError } = await supabase
    .from("region_performance")
    .select("id")
    .eq("region", region)
    .limit(1);

  if (checkError) {
    console.error(`Error checking existing region performance:`, checkError);
    throw new Error(checkError.message);
  }

  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing region performance
    const { data, error } = await supabase
      .from("region_performance")
      .update(dbRegionPerformance)
      .eq("id", existingData[0].id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating region performance:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  } else {
    // Create new region performance
    const { data, error } = await supabase
      .from("region_performance")
      .insert(dbRegionPerformance)
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating region performance:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  }

  return mapDatabaseRegionPerformanceToFrontend(result as RegionPerformance);
};

/**
 * Create or update client satisfaction data
 * @param clientSatisfaction Client satisfaction data to create or update
 * @returns Promise with created/updated client satisfaction data
 */
export const updateClientSatisfaction = async (
  clientSatisfaction: FrontendClientSatisfaction
): Promise<FrontendClientSatisfaction> => {
  // Convert frontend client satisfaction to database format
  const dbClientSatisfaction = {
    month: clientSatisfaction.month,
    score: clientSatisfaction.score
  };

  // Check if client satisfaction already exists for this month
  const { data: existingData, error: checkError } = await supabase
    .from("client_satisfaction")
    .select("id")
    .eq("month", clientSatisfaction.month)
    .limit(1);

  if (checkError) {
    console.error(`Error checking existing client satisfaction:`, checkError);
    throw new Error(checkError.message);
  }

  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing client satisfaction
    const { data, error } = await supabase
      .from("client_satisfaction")
      .update(dbClientSatisfaction)
      .eq("id", existingData[0].id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating client satisfaction:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  } else {
    // Create new client satisfaction
    const { data, error } = await supabase
      .from("client_satisfaction")
      .insert(dbClientSatisfaction)
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating client satisfaction:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  }

  return mapDatabaseClientSatisfactionToFrontend(result as ClientSatisfaction);
};

/**
 * Create or update job order trend data
 * @param jobOrderTrend Job order trend data to create or update
 * @returns Promise with created/updated job order trend data
 */
export const updateJobOrderTrend = async (
  jobOrderTrend: FrontendJobOrderTrend
): Promise<FrontendJobOrderTrend> => {
  // Convert frontend job order trend to database format
  const dbJobOrderTrend = {
    month: jobOrderTrend.month,
    total: jobOrderTrend.total,
    filled: jobOrderTrend.filled,
    pending: jobOrderTrend.pending
  };

  // Check if job order trend already exists for this month
  const { data: existingData, error: checkError } = await supabase
    .from("job_order_trends")
    .select("id")
    .eq("month", jobOrderTrend.month)
    .limit(1);

  if (checkError) {
    console.error(`Error checking existing job order trend:`, checkError);
    throw new Error(checkError.message);
  }

  let result;
  
  if (existingData && existingData.length > 0) {
    // Update existing job order trend
    const { data, error } = await supabase
      .from("job_order_trends")
      .update(dbJobOrderTrend)
      .eq("id", existingData[0].id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating job order trend:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  } else {
    // Create new job order trend
    const { data, error } = await supabase
      .from("job_order_trends")
      .insert(dbJobOrderTrend)
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating job order trend:`, error);
      throw new Error(error.message);
    }
    
    result = data;
  }

  return mapDatabaseJobOrderTrendToFrontend(result as JobOrderTrend);
};
