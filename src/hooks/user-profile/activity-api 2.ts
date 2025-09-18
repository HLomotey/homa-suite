/**
 * User Activity API
 * Handles user activity logging and retrieval
 */

import { supabaseAdmin } from "../../integration/supabase/admin-client";
import { UserActivity } from "./utils";

/**
 * Log a user activity
 * @param activity Activity data to log
 * @returns Promise with logged activity data
 */
export const logUserActivity = async (
  activity: Omit<UserActivity, "id" | "timestamp">
): Promise<UserActivity> => {
  const dbActivity = {
    user_id: activity.userId,
    action: activity.action,
    details: activity.details || {},
    ip: activity.ip,
    user_agent: activity.userAgent,
  };

  const { data, error } = await (supabaseAdmin
    .from("user_activities")
    .insert(dbActivity as any)
    .select()
    .single() as unknown as Promise<{ data: any, error: any }>);

  if (error) {
    console.error(`Error logging user activity:`, error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned from activity insert');
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    action: data.action,
    details: data.details,
    timestamp: data.created_at,
    ip: data.ip,
    userAgent: data.user_agent,
  };
};

/**
 * Fetch user activities for a specific user
 * @param userId User ID
 * @returns Promise with array of user activities
 */
export const fetchUserActivities = async (
  userId: string
): Promise<UserActivity[]> => {
  const { data, error } = await supabaseAdmin
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }) as { data: any[], error: any };

  if (error) {
    console.error(`Error fetching activities for user ${userId}:`, error);
    throw new Error(error.message);
  }

  return (data || []).map((activity: any) => ({
    id: activity.id,
    userId: activity.user_id,
    action: activity.action,
    details: activity.details,
    timestamp: activity.created_at,
    ip: activity.ip,
    userAgent: activity.user_agent,
  }));
};
