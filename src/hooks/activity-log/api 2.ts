import { supabase, supabaseAdmin } from '@/integration/supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string | null;
  old_data: any;
  new_data: any;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  timestamp: string;
  created_at: string;
}

export interface ActivityLogFilters {
  user_id?: string;
  table_name?: string;
  operation?: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get activity logs with optional filters
 */
export const getActivityLogs = async (filters: ActivityLogFilters = {}): Promise<ActivityLog[]> => {
  try {
    let query = supabaseAdmin
      .from('activity_log')
      .select('*')
      .order('timestamp', { ascending: false });

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.table_name) {
      query = query.eq('table_name', filters.table_name);
    }

    if (filters.operation) {
      query = query.eq('operation', filters.operation);
    }

    if (filters.record_id) {
      query = query.eq('record_id', filters.record_id);
    }

    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    throw error;
  }
};

/**
 * Get activity logs for a specific user
 */
export const getUserActivityLogs = async (userId: string, limit = 50): Promise<ActivityLog[]> => {
  return getActivityLogs({ user_id: userId, limit });
};

/**
 * Get activity logs for a specific table
 */
export const getTableActivityLogs = async (tableName: string, limit = 50): Promise<ActivityLog[]> => {
  return getActivityLogs({ table_name: tableName, limit });
};

/**
 * Get activity logs for a specific record
 */
export const getRecordActivityLogs = async (tableName: string, recordId: string): Promise<ActivityLog[]> => {
  return getActivityLogs({ table_name: tableName, record_id: recordId });
};

/**
 * Get recent activity logs (last 24 hours)
 */
export const getRecentActivityLogs = async (limit = 100): Promise<ActivityLog[]> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return getActivityLogs({ 
    start_date: yesterday.toISOString(),
    limit 
  });
};

/**
 * Get activity summary by table
 */
export const getActivitySummaryByTable = async (days = 7): Promise<{ table_name: string; count: number }[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('activity_log')
      .select('table_name')
      .gte('timestamp', startDate.toISOString())
      .order('table_name');

    if (error) {
      console.error('Error fetching activity summary:', error);
      throw error;
    }

    // Count activities per table
    const summary = (data || []).reduce((acc: { [key: string]: number }, log) => {
      acc[log.table_name] = (acc[log.table_name] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(summary)
      .map(([table_name, count]) => ({ table_name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getActivitySummaryByTable:', error);
    throw error;
  }
};

/**
 * Get activity summary by user
 */
export const getActivitySummaryByUser = async (days = 7): Promise<{ user_email: string; count: number }[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('activity_log')
      .select('user_email')
      .gte('timestamp', startDate.toISOString())
      .not('user_email', 'is', null)
      .order('user_email');

    if (error) {
      console.error('Error fetching user activity summary:', error);
      throw error;
    }

    // Count activities per user
    const summary = (data || []).reduce((acc: { [key: string]: number }, log) => {
      if (log.user_email) {
        acc[log.user_email] = (acc[log.user_email] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(summary)
      .map(([user_email, count]) => ({ user_email, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getActivitySummaryByUser:', error);
    throw error;
  }
};
