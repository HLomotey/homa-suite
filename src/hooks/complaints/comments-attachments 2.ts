/**
 * API functions for complaint comments and attachments
 */

import { supabase, supabaseAdmin } from "@/integration/supabase";
import { 
  ComplaintComment, 
  ComplaintAttachment
} from "@/integration/supabase/types/complaints";
import { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Get comments for a specific complaint
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

    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Unexpected error fetching comments for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Add a comment to a complaint
export const addComplaintComment = async (
  complaintId: string,
  userId: string,
  comment: string,
  isInternal: boolean = false
): Promise<{ data: ComplaintComment | null; error: PostgrestError | null }> => {
  try {
    const commentData = {
      id: uuidv4(),
      complaint_id: complaintId,
      user_id: userId,
      comment: comment,
      created_at: new Date().toISOString()
      // is_internal: isInternal // Uncomment if column exists
    };

    const { data, error } = await supabaseAdmin
      .from("complaint_comments")
      .insert(commentData)
      .select("*")
      .single();

    if (error) {
      console.error(`Error adding comment to complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    // Create history entry for comment addition
    await supabaseAdmin
      .from("complaint_history")
      .insert({
        complaint_id: complaintId,
        user_id: userId,
        action: "comment_added",
        new_value: comment.substring(0, 100) // Truncate for history
      });

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error adding comment to complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Update a complaint comment
export const updateComplaintComment = async (
  commentId: string,
  comment: string
): Promise<{ data: ComplaintComment | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("complaint_comments")
      .update({
        comment: comment,
        updated_at: new Date().toISOString()
      })
      .eq("id", commentId)
      .select("*")
      .single();

    if (error) {
      console.error(`Error updating comment ${commentId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error updating comment ${commentId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Delete a complaint comment
export const deleteComplaintComment = async (
  commentId: string
): Promise<{ success: boolean; error: PostgrestError | null }> => {
  try {
    const { error } = await supabaseAdmin
      .from("complaint_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Unexpected error deleting comment ${commentId}:`, error);
    return { success: false, error: error as PostgrestError };
  }
};

// Get attachments for a specific complaint
export const getComplaintAttachments = async (
  complaintId: string,
  includeInternal: boolean = false
): Promise<{ data: ComplaintAttachment[] | null; error: PostgrestError | null }> => {
  try {
    let query = supabase
      .from("complaint_attachments")
      .select("*")
      .eq("complaint_id", complaintId);
    
    // Filter out internal attachments for non-staff users (if column exists)
    // if (!includeInternal) {
    //   query = query.eq("is_internal", false);
    // }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching attachments for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Unexpected error fetching attachments for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Upload an attachment to a complaint
export const uploadComplaintAttachment = async (
  complaintId: string,
  file: File,
  userId: string,
  isInternal: boolean = false
): Promise<{ data: ComplaintAttachment | null; error: PostgrestError | null }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `complaints/${complaintId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('complaint-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error(`Error uploading file for complaint ${complaintId}:`, uploadError);
      return { data: null, error: uploadError as unknown as PostgrestError };
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('complaint-attachments')
      .getPublicUrl(filePath);

    // Insert attachment record
    const attachmentData = {
      id: uuidv4(),
      complaint_id: complaintId,
      file_name: file.name,
      file_path: filePath, // Use file_path instead of file_url
      file_size: file.size,
      file_type: file.type,
      uploaded_by: userId,
      created_at: new Date().toISOString()
      // is_internal: isInternal // Uncomment if column exists
    };

    const { data, error } = await supabaseAdmin
      .from("complaint_attachments")
      .insert(attachmentData)
      .select("*")
      .single();

    if (error) {
      console.error(`Error saving attachment record for complaint ${complaintId}:`, error);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('complaint-attachments')
        .remove([filePath]);
      
      return { data: null, error };
    }

    // Create history entry for attachment upload
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
    console.error(`Unexpected error uploading attachment for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Delete a complaint attachment
export const deleteComplaintAttachment = async (
  attachmentId: string
): Promise<{ success: boolean; error: PostgrestError | null }> => {
  try {
    // Get attachment details first
    const { data: attachment, error: fetchError } = await supabase
      .from("complaint_attachments")
      .select("file_path")
      .eq("id", attachmentId)
      .single();

    if (fetchError) {
      console.error(`Error fetching attachment ${attachmentId}:`, fetchError);
      return { success: false, error: fetchError };
    }

    // Delete from storage
    if (attachment?.file_path) {
      const { error: storageError } = await supabase.storage
        .from('complaint-attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        console.error(`Error deleting file from storage:`, storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from("complaint_attachments")
      .delete()
      .eq("id", attachmentId);

    if (error) {
      console.error(`Error deleting attachment ${attachmentId}:`, error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Unexpected error deleting attachment ${attachmentId}:`, error);
    return { success: false, error: error as PostgrestError };
  }
};

// Get attachment download URL
export const getAttachmentDownloadUrl = async (
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url: string | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from('complaint-attachments')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(`Error creating signed URL for ${filePath}:`, error);
      return { url: null, error: error as unknown as PostgrestError };
    }

    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error(`Unexpected error creating signed URL for ${filePath}:`, error);
    return { url: null, error: error as PostgrestError };
  }
};
