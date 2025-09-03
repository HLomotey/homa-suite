/**
 * API functions for complaint routing rules and SLA management
 */

import { supabase } from "@/integration/supabase";
import { 
  ComplaintRoutingRule, 
  ComplaintSLA,
  ComplaintAssetType,
  ComplaintPriority
} from "@/integration/supabase/types/complaints";
import { PostgrestError } from "@supabase/supabase-js";

// Get routing rules for complaint auto-assignment
export const getComplaintRoutingRules = async (
  assetType?: ComplaintAssetType,
  categoryId?: string
): Promise<{ data: ComplaintRoutingRule[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_routing_rules")
      .select("*")
      .order("priority", { ascending: true });
    
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }
    
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching complaint routing rules:", error);
      return { data: null, error };
    }

    // Map database data to match ComplaintRoutingRule interface
    const mappedData = data?.map(rule => ({
      ...rule,
      asset_type: rule.asset_type as ComplaintAssetType,
      location_id: null // Database doesn't have this field yet
    })) || [];

    return { data: mappedData as ComplaintRoutingRule[], error: null };
  } catch (error) {
    console.error("Unexpected error fetching complaint routing rules:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get SLA configuration for complaints
export const getComplaintSLAs = async (
  priority?: ComplaintPriority,
  assetType?: ComplaintAssetType,
  categoryId?: string
): Promise<{ data: ComplaintSLA[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_slas")
      .select("*")
      .order("priority");
    
    if (priority) {
      query = query.eq("priority", priority);
    }
    
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }
    
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching complaint SLAs:", error);
      return { data: null, error };
    }

    // Map database data to match ComplaintSLA interface
    const mappedData = data?.map(sla => ({
      ...sla,
      priority: sla.priority as ComplaintPriority,
      asset_type: sla.asset_type as ComplaintAssetType,
      subcategory_id: null, // Database doesn't have this field yet
      hours_to_acknowledge: 1 // Default value since database doesn't have this field
    })) || [];

    return { data: mappedData as ComplaintSLA[], error: null };
  } catch (error) {
    console.error("Unexpected error fetching complaint SLAs:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Find the best routing rule for a complaint
export const findRoutingRule = async (
  assetType: ComplaintAssetType,
  categoryId: string,
  subcategoryId?: string | null,
  assetId?: string | null
): Promise<{ data: ComplaintRoutingRule | null; error: PostgrestError | null }> => {
  try {
    const { data: routingRule, error } = await supabase
      .from("complaint_routing_rules")
      .select("*")
      .eq("asset_type", assetType)
      .eq("category_id", categoryId)
      .eq("subcategory_id", subcategoryId || null)
      .eq("asset_id", assetId || null)
      .order("priority", { ascending: true })
      .maybeSingle();

    if (error) {
      console.error("Error finding routing rule:", error);
      return { data: null, error };
    }

    // Map database data to match ComplaintRoutingRule interface
    const mappedRule = routingRule ? {
      ...routingRule,
      asset_type: routingRule.asset_type as ComplaintAssetType,
      location_id: null // Database doesn't have this field yet
    } : null;

    return { data: mappedRule as ComplaintRoutingRule | null, error: null };
  } catch (error) {
    console.error("Unexpected error finding routing rule:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Find SLA configuration for a complaint
export const findSLAConfig = async (
  priority: ComplaintPriority,
  assetType: ComplaintAssetType,
  categoryId: string
): Promise<{ data: ComplaintSLA | null; error: PostgrestError | null }> => {
  try {
    const { data: slaConfig, error } = await supabase
      .from("complaint_slas")
      .select("*")
      .eq("priority", priority)
      .eq("asset_type", assetType)
      .eq("category_id", categoryId)
      .maybeSingle();

    if (error) {
      console.error("Error finding SLA config:", error);
      return { data: null, error };
    }

    // Map database data to match ComplaintSLA interface
    const mappedSLA = slaConfig ? {
      ...slaConfig,
      priority: slaConfig.priority as ComplaintPriority,
      asset_type: slaConfig.asset_type as ComplaintAssetType,
      subcategory_id: null, // Database doesn't have this field yet
      hours_to_acknowledge: 1 // Default value since database doesn't have this field
    } : null;

    return { data: mappedSLA as ComplaintSLA | null, error: null };
  } catch (error) {
    console.error("Unexpected error finding SLA config:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Calculate due date based on SLA
export const calculateDueDate = (
  slaHours: number,
  createdAt?: string
): string => {
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  const dueDateTime = new Date(baseDate.getTime() + slaHours * 60 * 60 * 1000);
  return dueDateTime.toISOString();
};

// Check if complaint is breaching SLA
export const checkSLABreach = (
  dueDate: string | null,
  currentDate?: string
): boolean => {
  if (!dueDate) return false;
  
  const due = new Date(dueDate);
  const current = currentDate ? new Date(currentDate) : new Date();
  
  return current > due;
};
