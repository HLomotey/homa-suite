/**
 * API functions for the complaints management module
 */

// @ts-nocheck - Bypassing TypeScript errors due to corrupted database types
import { supabase, supabaseAdmin } from "@/integration/supabase";
import { Database } from "@/integration/supabase/types/database";
import { 
  Complaint, 
  ComplaintCategory, 
  ComplaintSubcategory, 
  ComplaintComment, 
  ComplaintAttachment,
  ComplaintRoutingRule,
  ComplaintSLA,
  ComplaintHistory,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintAssetType,
  FrontendComplaint
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
  complaint_comments_count?: number;
  complaint_attachments_count?: number;
  // Keep old format for backward compatibility
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
    
    // Joined fields
    categoryName: complaint.categories?.name,
    subcategoryName: complaint.subcategories?.name,
    assetName: complaint.asset_type === 'property' 
      ? complaint.property?.title 
      : complaint.vehicle ? `${complaint.vehicle.make} ${complaint.vehicle.model}`.trim() : undefined,
    createdByName: complaint.created_by_profile?.full_name,
    assignedToName: complaint.assigned_to_external_staff 
      ? `${complaint.assigned_to_external_staff['PAYROLL FIRST NAME'] || ''} ${complaint.assigned_to_external_staff['PAYROLL LAST NAME'] || ''}`.trim() 
      : undefined,
    escalatedToName: complaint.escalated_to_profile?.full_name,
    
    // UI helpers
    commentCount: complaint.complaint_comments_count || 0,
    attachmentCount: complaint.complaint_attachments_count || 0,
  };
};

// Get all complaints with optional filters
export const getComplaints = async (
  filters?: {
    status?: ComplaintStatus | ComplaintStatus[];
    priority?: ComplaintPriority | ComplaintPriority[];
    assetType?: ComplaintAssetType;
    categoryId?: string;
    assignedTo?: string;
    createdBy?: string;
    search?: string;
  }
): Promise<{ data: FrontendComplaint[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaints")
      .select(`
        *,
        categories:complaint_categories(name),
        subcategories:complaint_subcategories(name),
        created_by_profile:profiles!created_by(full_name),
        assigned_to_external_staff:external_staff!assigned_to("PAYROLL FIRST NAME", "PAYROLL LAST NAME"),
        escalated_to_profile:profiles!escalated_to(full_name),
        property:properties(title),
        vehicle:vehicles(make,model),
        complaint_comments_count:complaint_comments(count),
        complaint_attachments_count:complaint_attachments(count)
      `);

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
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints:", error);
      return { data: null, error };
    }

    // Filter out any parser errors before mapping
    const validData: DatabaseComplaint[] = [];
    
    // Ensure data is an array and not null
    if (Array.isArray(data)) {
      // Safely iterate through the array
      for (const item of data) {
        // Skip null/undefined items
        if (!item) continue;
        
        // Type guard to ensure item is a valid complaint object
        if (isValidComplaintData(item)) {
          validData.push(item);
        } else {
          console.warn('Filtered out invalid complaint data');
        }
      }
    }
    
    const frontendComplaints = validData.map(mapDatabaseComplaintToFrontend);
    return { data: frontendComplaints, error: null };
  } catch (error) {
    console.error("Unexpected error fetching complaints:", error);
    return { data: null, error: error as PostgrestError };
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
        assigned_to_external_staff:external_staff!assigned_to("PAYROLL FIRST NAME", "PAYROLL LAST NAME"),
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
      return { data: null, error: { message: 'Error parsing complaint data', details: '', hint: '', code: 'PARSER_ERROR' } as PostgrestError };
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
    // Generate a new UUID for the complaint
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
      // @ts-ignore - TypeScript database types issue
      const dueDateTime = new Date(now.getTime() + slaConfig.hours_to_resolve * 60 * 60 * 1000);
      dueDate = dueDateTime.toISOString();
    }
    
    // Direct assignment - use the manager ID from the form
    let assignedTo = complaint.assigned_to;
    
    if (assignedTo) {
      console.log(`Manager assigned from form: ${assignedTo}`);
      // The assigned_to field now references external_staff table directly
      // No need to validate user account existence
    } else {
      console.log("No manager assigned from form");
    }
    
    // Step 3: If still no valid assignment, try routing rules
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
        // Validate routing rule assignment as well
        const { data: routingUserExists } = await supabase
          .from("users")
          .select("id")
          // @ts-ignore - TypeScript database types issue
          .eq("id", routingRule.assigned_to)
          .maybeSingle();
        
        if (routingUserExists) {
          // @ts-ignore - TypeScript database types issue
          assignedTo = routingRule.assigned_to;
          console.log(`Assigned via routing rule: ${assignedTo}`);
        } else {
          // @ts-ignore - TypeScript database types issue
          console.warn(`Routing rule assigned user ${routingRule.assigned_to} does not exist in users table.`);
        }
      }
    }
    
    // No hardcoded fallback - let the system handle unassigned complaints
    
    // Final result logging
    if (assignedTo) {
      console.log(`Final assignment: ${assignedTo}`);
    } else {
      console.log("No valid user found for assignment - complaint will be unassigned");
    }
    
    // Insert the complaint
    // @ts-ignore - TypeScript database types issue
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
        assigned_to_external_staff:external_staff!assigned_to("PAYROLL FIRST NAME", "PAYROLL LAST NAME"),
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
    // @ts-ignore - TypeScript database types issue
    await supabaseAdmin
      .from("complaint_history")
      .insert({
        complaint_id: complaintId,
        user_id: complaint.created_by,
        action: "created",
        new_value: "new"
      });

    // @ts-ignore - TypeScript database types issue
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
  updates: Partial<Omit<Complaint, "id" | "created_at" | "updated_at">>
): Promise<{ data: FrontendComplaint | null; error: PostgrestError | null }> => {
  try {
    console.log('🚀 updateComplaint API called with:', { id, updates });
    
    // Get the current complaint state for history tracking
    const { data: currentComplaint } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", id)
      .single();
    
    if (!currentComplaint) {
      return { data: null, error: { message: "Complaint not found", details: "", hint: "", code: "404" } as PostgrestError };
    }
    
    // Handle status transitions
    if (updates.status) {
      // If transitioning to resolved, set resolved_at timestamp
      if (updates.status === "resolved" && currentComplaint.status !== "resolved") {
        updates.resolved_at = new Date().toISOString();
      }
      
      // If transitioning to closed, set closed_at timestamp
      if (updates.status === "closed" && currentComplaint.status !== "closed") {
        updates.closed_at = new Date().toISOString();
      }
    }
    
    // Update the complaint - first do the update without select to avoid complex joins
    console.log('📝 Updating complaint in database...');
    const { error: updateError } = await supabaseAdmin
      .from("complaints")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error(`❌ Error updating complaint with ID ${id}:`, updateError);
      return { data: null, error: updateError };
    }

    console.log('✅ Database update successful, fetching updated data...');
    
    // Then fetch the updated complaint with all relations
    const { data, error } = await supabaseAdmin
      .from("complaints")
      .select(`
        *,
        categories:complaint_categories(name),
        subcategories:complaint_subcategories(name),
        created_by_profile:profiles!created_by(full_name),
        assigned_to_external_staff:external_staff!assigned_to("PAYROLL FIRST NAME", "PAYROLL LAST NAME"),
        escalated_to_profile:profiles!escalated_to(full_name),
        property:properties(title),
        vehicle:vehicles(make,model),
        complaint_comments_count:complaint_comments(count),
        complaint_attachments_count:complaint_attachments(count)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`❌ Error fetching updated complaint with ID ${id}:`, error);
      return { data: null, error };
    }

    console.log('📡 Raw database response:', data);
    console.log('🔍 Expected status:', updates.status, 'Actual status:', data.status);
    
    if (updates.status && data.status !== updates.status) {
      console.warn('⚠️ Status mismatch! Update may have failed due to RLS or other constraints');
    }

    // Create history entries for changes
    const historyEntries = [];
    
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
        // Don't fail the entire update if history insertion fails
      }
    }

    // Ensure data is valid before mapping to prevent ParserError issues
    if (!isValidComplaintData(data)) {
      return { data: null, error: { message: 'Error parsing complaint data', details: '', hint: '', code: 'PARSER_ERROR' } as PostgrestError };
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

// Get complaint categories from the complaint_categories table
export const getComplaintCategories = async (
  assetType?: ComplaintAssetType
): Promise<{ data: ComplaintCategory[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_categories")
      .select("*")
      .order("name");
    
    // Filter by asset type if provided
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching complaint categories:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error fetching complaint categories:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Create a new complaint category
export const createComplaintCategory = async (
  category: Omit<ComplaintCategory, "id" | "created_at" | "updated_at">
): Promise<{ data: ComplaintCategory | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("complaint_categories")
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error("Error creating complaint category:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error creating complaint category:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get complaint subcategories by category ID
export const getComplaintSubcategories = async (
  categoryId: string
): Promise<{ data: ComplaintSubcategory[] | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from("complaint_subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");

    if (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching subcategories for category ${categoryId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get comments for a complaint
export const getComplaintComments = async (
  complaintId: string,
  includeInternal: boolean = false
): Promise<{ data: ComplaintComment[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_comments")
      .select("*")
      .eq("complaint_id", complaintId);
    
    // Filter out internal comments for non-staff users (if column exists)
    // Note: is_internal column may not exist in current schema
    // if (!includeInternal) {
    //   query = query.eq("is_internal", false);
    // }
    
    const { data, error } = await query.order("created_at");

    if (error) {
      console.error(`Error fetching comments for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching comments for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Add a comment to a complaint
export const addComplaintComment = async (
  comment: Omit<ComplaintComment, "id" | "created_at" | "updated_at">
): Promise<{ data: ComplaintComment | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("complaint_comments")
      .insert(comment)
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error("Error adding complaint comment:", error);
      return { data: null, error };
    }

    // Create history entry for comment
    await supabaseAdmin
      .from("complaint_history")
      .insert({
        complaint_id: comment.complaint_id,
        user_id: comment.user_id,
        action: comment.is_internal ? "internal_comment" : "public_comment"
      });

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error adding complaint comment:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get attachments for a complaint
export const getComplaintAttachments = async (
  complaintId: string,
  includeInternal: boolean = false
): Promise<{ data: ComplaintAttachment[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_attachments")
      .select(`
        id,
        complaint_id,
        file_name,
        file_path,
        file_size,
        file_type,
        uploaded_by,
        created_at
      `)
      .eq("complaint_id", complaintId);
    
    // Filter out internal attachments for non-staff users
    if (!includeInternal) {
      query = (query as any).eq("is_internal", false);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching attachments for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching attachments for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Upload an attachment for a complaint
export const uploadComplaintAttachment = async (
  file: File,
  complaintId: string,
  userId: string,
  isInternal: boolean = false
): Promise<{ data: ComplaintAttachment | null; error: PostgrestError | null }> => {
  try {
    // Upload file to storage
    const fileName = `${complaintId}/${uuidv4()}-${file.name}`;
    const { data: fileData, error: uploadError } = await supabaseAdmin
      .storage
      .from("complaint-attachments")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      // Convert StorageError to PostgrestError format
      const postgrestError = {
        message: uploadError.message || 'Storage error',
        details: '',
        hint: '',
        code: 'STORAGE_ERROR'
      } as PostgrestError;
      return { data: null, error: postgrestError };
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from("complaint-attachments")
      .getPublicUrl(fileName);

    // Create attachment record
    const attachmentData: Omit<ComplaintAttachment, "id" | "created_at"> = {
      complaint_id: complaintId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: publicUrlData.publicUrl,
      uploaded_by: userId,
      is_internal: isInternal
    };

    const { data, error } = await supabaseAdmin
      .from("complaint_attachments")
      .insert(attachmentData)
      .select()
      .single();

    if (error) {
      console.error("Error creating attachment record:", error);
      return { data: null, error };
    }

    // Create history entry for attachment
    await supabaseAdmin
      .from("complaint_history")
      .insert({
        complaint_id: complaintId,
        user_id: userId,
        action: "attachment_added",
        new_value: file.name
      });

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error uploading attachment:", error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get complaint history
export const getComplaintHistory = async (
  complaintId: string
): Promise<{ data: ComplaintHistory[] | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from("complaint_history")
      .select("*")
      .eq("complaint_id", complaintId)
      .order("created_at");

    if (error) {
      console.error(`Error fetching history for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching history for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Check and update SLA status for complaints
export const checkAndUpdateSLAs = async (): Promise<{ updated: number; error: PostgrestError | null }> => {
  try {
    // Get all active complaints with due dates
    const { data: activeComplaints, error: fetchError } = await supabase
      .from("complaints")
      .select("*")
      .in("status", ["new", "in_progress", "waiting_on_user"])
      .not("due_date", "is", null)
      .eq("sla_breach", false);
    
    if (fetchError) {
      console.error("Error fetching active complaints for SLA check:", fetchError);
      return { updated: 0, error: fetchError };
    }
    
    if (!activeComplaints || activeComplaints.length === 0) {
      return { updated: 0, error: null };
    }
    
    // Check which complaints have breached SLA
    const now = new Date();
    const breachedComplaints = activeComplaints.filter(complaint => {
      const dueDate = new Date(complaint.due_date!);
      return now > dueDate;
    });
    
    if (breachedComplaints.length === 0) {
      return { updated: 0, error: null };
    }
    
    // Update breached complaints
    const breachedIds = breachedComplaints.map(c => c.id);
    const { error: updateError } = await supabaseAdmin
      .from("complaints")
      .update({ sla_breach: true })
      .in("id", breachedIds);
    
    if (updateError) {
      console.error("Error updating SLA breach status:", updateError);
      return { updated: 0, error: updateError };
    }
    
    // Create history entries for SLA breaches
    const historyEntries = breachedComplaints.map(complaint => ({
      complaint_id: complaint.id,
      user_id: complaint.assigned_to || complaint.created_by,
      action: "sla_breach",
      old_value: complaint.due_date
    }));
    
    await supabaseAdmin
      .from("complaint_history")
      .insert(historyEntries);
    
    // Handle escalations based on SLA breach
    for (const complaint of breachedComplaints) {
      // Get SLA config to find escalation owner
      const { data: slaConfig } = await supabase
        .from("complaint_slas")
        .select("escalation_user_id")
        .eq("priority", complaint.priority)
        .eq("asset_type", complaint.asset_type)
        .eq("category_id", complaint.category_id)
        .maybeSingle();
      
      if (slaConfig?.escalation_user_id) {
        await supabaseAdmin
          .from("complaints")
          .update({ escalated_to: slaConfig.escalation_user_id })
          .eq("id", complaint.id);
        
        // Create history entry for escalation
        await supabaseAdmin
          .from("complaint_history")
          .insert({
            complaint_id: complaint.id,
            user_id: slaConfig.escalation_user_id,
            action: "escalation",
            old_value: complaint.assigned_to || null,
            new_value: slaConfig.escalation_user_id
          });
      }
    }
    
    return { updated: breachedComplaints.length, error: null };
  } catch (error) {
    console.error("Unexpected error checking SLAs:", error);
    return { updated: 0, error: error as PostgrestError };
  }
};
