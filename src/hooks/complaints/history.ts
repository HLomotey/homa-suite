/**
 * API functions for complaint history and tracking
 */

import { supabase, supabaseAdmin } from "@/integration/supabase";
import { ComplaintHistory } from "@/integration/supabase/types/complaints";
import { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Get history for a specific complaint
export const getComplaintHistory = async (
  complaintId: string
): Promise<{ data: ComplaintHistory[] | null; error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from("complaint_history")
      .select(`
        *,
        user:profiles!user_id(full_name)
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching history for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Unexpected error fetching history for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Add a history entry
export const addComplaintHistoryEntry = async (
  complaintId: string,
  userId: string,
  action: string,
  oldValue?: string | null,
  newValue?: string | null
): Promise<{ data: ComplaintHistory | null; error: PostgrestError | null }> => {
  try {
    const historyData = {
      id: uuidv4(),
      complaint_id: complaintId,
      user_id: userId,
      action: action,
      old_value: oldValue,
      new_value: newValue,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("complaint_history")
      .insert(historyData)
      .select("*")
      .single();

    if (error) {
      console.error(`Error adding history entry for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Unexpected error adding history entry for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};

// Get activity summary for a complaint
export const getComplaintActivitySummary = async (
  complaintId: string
): Promise<{ 
  data: {
    total_actions: number;
    status_changes: number;
    assignments: number;
    comments: number;
    attachments: number;
    last_activity: string | null;
  } | null; 
  error: PostgrestError | null 
}> => {
  try {
    const { data, error } = await supabase
      .from("complaint_history")
      .select("action, created_at")
      .eq("complaint_id", complaintId);

    if (error) {
      console.error(`Error fetching activity summary for complaint ${complaintId}:`, error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          total_actions: 0,
          status_changes: 0,
          assignments: 0,
          comments: 0,
          attachments: 0,
          last_activity: null
        },
        error: null
      };
    }

    const summary = {
      total_actions: data.length,
      status_changes: data.filter(item => item.action === 'status_change').length,
      assignments: data.filter(item => item.action === 'assignment').length,
      comments: data.filter(item => item.action === 'comment_added').length,
      attachments: data.filter(item => item.action === 'attachment_added').length,
      last_activity: data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at || null
    };

    return { data: summary, error: null };
  } catch (error) {
    console.error(`Unexpected error fetching activity summary for complaint ${complaintId}:`, error);
    return { data: null, error: error as PostgrestError };
  }
};
