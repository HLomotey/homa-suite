/**
 * CRUD operations for complaints
 */

import { supabase, supabaseAdmin } from "@/integration/supabase";
import { 
  Complaint, 
  FrontendComplaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintAssetType
} from "@/integration/supabase/types/complaints";
import { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Type for database complaint with joined tables
export type DatabaseComplaint = Complaint & {
  categories?: { name: string };
  subcategories?: { name: string };
  created_by_profile?: { full_name: string };
  assigned_to_profile?: { full_name: string };
  escalated_to_profile?: { full_name: string };
  property?: { title: string };
  vehicle?: { make: string; model: string };
  complaint_comments_count?: number | { count: number }[];
  complaint_attachments_count?: number | { count: number }[];
  _count?: { complaint_comments: number; complaint_attachments: number };
};

// Helper function to safely handle complaint data
const isValidComplaintData = (data: any): data is DatabaseComplaint => {
  return data && !('error' in data) && typeof data === 'object' && 'id' in data;
};

// Helper function to map database complaint to frontend format
export const mapDatabaseComplaintToFrontend = (
  complaint: DatabaseComplaint
): FrontendComplaint => {
  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    assetType: complaint.asset_type as ComplaintAssetType,
    assetId: complaint.asset_id,
    categoryId: complaint.category_id,
    subcategoryId: complaint.subcategory_id,
    priority: complaint.priority as ComplaintPriority,
    status: complaint.status as ComplaintStatus,
    createdBy: complaint.created_by,
    assignedTo: complaint.assigned_to,
    escalatedTo: complaint.escalated_to,
    dueDate: complaint.due_date,
    location: complaint.location,
    contactMethod: complaint.contact_method,
    createdAt: complaint.created_at,
    updatedAt: complaint.updated_at,
    resolvedAt: complaint.resolved_at,
    closedAt: complaint.closed_at,
    slaBreach: complaint.sla_breach,
    categoryName: complaint.categories?.name || null,
    subcategoryName: complaint.subcategories?.name || null,
    createdByName: complaint.created_by_profile?.full_name || null,
    assignedToName: complaint.assigned_to_profile?.full_name || null,
    escalatedToName: complaint.escalated_to_profile?.full_name || null,
    assetName: complaint.property?.title || 
              (complaint.vehicle ? `${complaint.vehicle.make} ${complaint.vehicle.model}` : null),
    commentCount: typeof complaint.complaint_comments_count === 'number' 
                   ? complaint.complaint_comments_count 
                   : Array.isArray(complaint.complaint_comments_count) 
                     ? complaint.complaint_comments_count[0]?.count || 0
                     : complaint._count?.complaint_comments || 0,
    attachmentCount: typeof complaint.complaint_attachments_count === 'number' 
                      ? complaint.complaint_attachments_count 
                      : Array.isArray(complaint.complaint_attachments_count) 
                        ? complaint.complaint_attachments_count[0]?.count || 0
                        : complaint._count?.complaint_attachments || 0
  };
};

// Filters for complaint queries
export interface ComplaintFilters {
  status?: ComplaintStatus | ComplaintStatus[];
  priority?: ComplaintPriority | ComplaintPriority[];
  assetType?: ComplaintAssetType;
  categoryId?: string;
  assignedTo?: string;
  createdBy?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Get all complaints with optional filters
export const getComplaints = async (
  filters?: ComplaintFilters,
  page?: number,
  pageSize?: number
): Promise<{ data: FrontendComplaint[] | null; error: PostgrestError | null; count?: number }> => {
  try {
    let query = supabase
      .from("complaints")
      .select(`
        *,
        categories:complaint_categories(name),
        subcategories:complaint_subcategories(name),
        created_by_profile:profiles!created_by(full_name),
        assigned_to_profile:profiles!assigned_to(full_name),
        escalated_to_profile:profiles!escalated_to(full_name),
        property:properties(title),
        vehicle:vehicles(make,model),
        complaint_comments_count:complaint_comments(count),
        complaint_attachments_count:complaint_attachments(count)
      `, { count: 'exact' });

    // Apply filters
    if (filters) {
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status);
        } else {
          query = query.eq("status", filters.status);
        }
      }
      
      if (filters.priority) {
        if (Array.isArray(filters.priority)) {
          query = query.in("priority", filters.priority);
        } else {
          query = query.eq("priority", filters.priority);
        }
      }
      
      if (filters.assetType) {
        query = query.eq("asset_type", filters.assetType);
      }
      
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      
      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }
      
      if (filters.createdBy) {
        query = query.eq("created_by", filters.createdBy);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }
    }

    // Apply pagination
    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    // Order by created_at descending
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching complaints:", error);
      return { data: null, error, count: 0 };
    }

    if (!data) {
      return { data: [], error: null, count: 0 };
    }

    const frontendComplaints = data
      .filter(isValidComplaintData)
      .map(mapDatabaseComplaintToFrontend);

    return { data: frontendComplaints, error: null, count: count || 0 };
  } catch (error) {
    console.error("Unexpected error fetching complaints:", error);
    return { data: null, error: error as PostgrestError, count: 0 };
  }
};

// Get a single complaint by ID
export const getComplaintById = async (
  id: string
): Promise<{ data: FrontendComplaint | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        categories:complaint_categories(name),
        subcategories:complaint_subcategories(name),
        created_by_profile:profiles!created_by(full_name),
        assigned_to_profile:profiles!assigned_to(full_name),
        escalated_to_profile:profiles!escalated_to(full_name),
        property:properties(title),
        vehicle:vehicles(make,model),
        complaint_comments_count:complaint_comments(count),
        complaint_attachments_count:complaint_attachments(count)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching complaint with ID ${id}:`, error);
      return { data: null, error };
    }

    if (!isValidComplaintData(data)) {
      console.error(`Error parsing complaint data for ID ${id}:`, data);
      return { 
        data: null, 
        error: { 
          message: 'Error parsing complaint data', 
          details: '', 
          hint: '', 
          code: 'PARSER_ERROR' 
        } as PostgrestError 
      };
    }

    const frontendComplaint = mapDatabaseComplaintToFrontend(data);
    return { data: frontendComplaint, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching complaint with ID ${id}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Create a new complaint
export const createComplaint = async (
  complaint: Omit<Complaint, "id" | "created_at" | "updated_at" | "sla_breach">
): Promise<{ data: FrontendComplaint | null; error: PostgrestError | null }> => {
  try {
    const complaintId = uuidv4();
    
    // Get SLA configuration for this complaint type
    const { data: slaConfig } = await supabase
      .from("complaint_slas")
      .select("*")
      .eq("priority", complaint.priority)
      .eq("asset_type", complaint.asset_type)
      .eq("category_id", complaint.category_id)
      .maybeSingle();
    
    // Calculate due date based on SLA
    let dueDate = null;
    if (slaConfig) {
      const now = new Date();
      const dueDateTime = new Date(now.getTime() + slaConfig.hours_to_resolve * 60 * 60 * 1000);
      dueDate = dueDateTime.toISOString();
    }
    
    // Find routing rule to auto-assign
    let assignedTo = complaint.assigned_to;
    if (!assignedTo) {
      const { data: routingRule } = await supabase
        .from("complaint_routing_rules")
        .select("*")
        .eq("asset_type", complaint.asset_type)
        .eq("category_id", complaint.category_id)
        .eq("subcategory_id", complaint.subcategory_id || null)
        .eq("asset_id", complaint.asset_id || null)
        .order("priority", { ascending: true })
        .maybeSingle();
      
      if (routingRule) {
        assignedTo = routingRule.assigned_to;
      }
    }
    
    // Insert the complaint
    const { data, error } = await supabaseAdmin
      .from("complaints")
      .insert({
        ...complaint,
        id: complaintId,
        status: "open",
        assigned_to: assignedTo,
        due_date: dueDate,
        sla_breach: false
      })
      .select(`
        *,
        categories:complaint_categories(name),
        subcategories:complaint_subcategories(name),
        created_by_profile:profiles!created_by(full_name),
        assigned_to_profile:profiles!assigned_to(full_name),
        escalated_to_profile:profiles!escalated_to(full_name),
        property:properties(title),
        vehicle:vehicles(make,model)
      `)
      .single();

    if (error) {
      console.error("Error creating complaint:", error);
      return { data: null, error };
    }

    // Create history entry for complaint creation
    await supabaseAdmin
      .from("complaint_history")
      .insert({
        complaint_id: complaintId,
        user_id: complaint.created_by,
        action: "created",
        new_value: "new"
      });

    const frontendComplaint = mapDatabaseComplaintToFrontend({
      ...data,
      complaint_comments_count: 0,
      complaint_attachments_count: 0
    });
    
    return { data: frontendComplaint, error: null };
  } catch (error) {
    console.error("Unexpected error creating complaint:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Update a complaint
export const updateComplaint = async (
  id: string,
  updates: Partial<Complaint>
): Promise<{ data: FrontendComplaint | null; error: PostgrestError | null }> => {
  try {
    // Get current complaint for history tracking
    const { data: currentComplaint } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentComplaint) {
      return { 
        data: null, 
        error: { 
          message: 'Complaint not found', 
          details: '', 
          hint: '', 
          code: 'NOT_FOUND' 
        } as PostgrestError 
      };
    }

    // Update the complaint
    const { data, error } = await supabaseAdmin
      .from("complaints")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(`
        *,
        categories:complaint_categories(name),
        subcategories:complaint_subcategories(name),
        created_by_profile:profiles!created_by(full_name),
        assigned_to_profile:profiles!assigned_to(full_name),
        escalated_to_profile:profiles!escalated_to(full_name),
        property:properties(title),
        vehicle:vehicles(make,model),
        complaint_comments_count:complaint_comments(count),
        complaint_attachments_count:complaint_attachments(count)
      `)
      .single();

    if (error) {
      console.error(`Error updating complaint with ID ${id}:`, error);
      return { data: null, error };
    }

    // Track changes in history
    const historyEntries: any[] = [];
    
    // Track status change
    if (updates.status && updates.status !== currentComplaint.status) {
      historyEntries.push({
        complaint_id: id,
        user_id: updates.assigned_to || currentComplaint.assigned_to,
        action: "status_change",
        old_value: currentComplaint.status,
        new_value: updates.status
      });
    }
    
    // Track assignment change
    if (updates.assigned_to && updates.assigned_to !== currentComplaint.assigned_to) {
      historyEntries.push({
        complaint_id: id,
        user_id: updates.assigned_to,
        action: "assignment",
        old_value: currentComplaint.assigned_to || null,
        new_value: updates.assigned_to
      });
    }
    
    // Track priority change
    if (updates.priority && updates.priority !== currentComplaint.priority) {
      historyEntries.push({
        complaint_id: id,
        user_id: updates.assigned_to || currentComplaint.assigned_to,
        action: "priority_change",
        old_value: currentComplaint.priority,
        new_value: updates.priority
      });
    }
    
    // Insert history entries if any
    if (historyEntries.length > 0) {
      const { error: historyError } = await supabaseAdmin
        .from("complaint_history")
        .insert(historyEntries);
      
      if (historyError) {
        console.error(`Error inserting complaint history:`, historyError);
      }
    }

    if (!isValidComplaintData(data)) {
      return { 
        data: null, 
        error: { 
          message: 'Error parsing complaint data', 
          details: '', 
          hint: '', 
          code: 'PARSER_ERROR' 
        } as PostgrestError 
      };
    }
    
    const frontendComplaint = mapDatabaseComplaintToFrontend(data);
    return { data: frontendComplaint, error: null };
  } catch (error) {
    console.error(`Unexpected error updating complaint with ID ${id}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Delete a complaint
export const deleteComplaint = async (
  id: string
): Promise<{ success: boolean; error: PostgrestError | null }> => {
  try {
    // Delete related records first (comments, attachments, history)
    await supabaseAdmin.from("complaint_comments").delete().eq("complaint_id", id);
    await supabaseAdmin.from("complaint_attachments").delete().eq("complaint_id", id);
    await supabaseAdmin.from("complaint_history").delete().eq("complaint_id", id);
    
    // Delete the complaint
    const { error } = await supabaseAdmin.from("complaints").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting complaint with ID ${id}:`, error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Unexpected error deleting complaint with ID ${id}:`, error);
    return { success: false, error: error as PostgrestError };
  }
};
