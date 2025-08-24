import { useState, useEffect } from 'react';
import { 
  getActivityLogs, 
  getUserActivityLogs, 
  getTableActivityLogs, 
  getRecordActivityLogs,
  getRecentActivityLogs,
  getActivitySummaryByTable,
  getActivitySummaryByUser,
  ActivityLog, 
  ActivityLogFilters 
} from './api';

export const useActivityLogs = (filters?: ActivityLogFilters) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivityLogs(filters);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activity logs');
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [JSON.stringify(filters)]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs
  };
};

export const useUserActivityLogs = (userId: string, limit = 50) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserLogs = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUserActivityLogs(userId, limit);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user activity logs');
      console.error('Error fetching user activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLogs();
  }, [userId, limit]);

  return {
    logs,
    loading,
    error,
    refetch: fetchUserLogs
  };
};

export const useTableActivityLogs = (tableName: string, limit = 50) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTableLogs = async () => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTableActivityLogs(tableName, limit);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch table activity logs');
      console.error('Error fetching table activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableLogs();
  }, [tableName, limit]);

  return {
    logs,
    loading,
    error,
    refetch: fetchTableLogs
  };
};

export const useRecordActivityLogs = (tableName: string, recordId: string) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordLogs = async () => {
    if (!tableName || !recordId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getRecordActivityLogs(tableName, recordId);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch record activity logs');
      console.error('Error fetching record activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordLogs();
  }, [tableName, recordId]);

  return {
    logs,
    loading,
    error,
    refetch: fetchRecordLogs
  };
};

export const useRecentActivityLogs = (limit = 100) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentActivityLogs(limit);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recent activity logs');
      console.error('Error fetching recent activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, [limit]);

  return {
    logs,
    loading,
    error,
    refetch: fetchRecentLogs
  };
};

export const useActivitySummary = (days = 7) => {
  const [tableSummary, setTableSummary] = useState<{ table_name: string; count: number }[]>([]);
  const [userSummary, setUserSummary] = useState<{ user_email: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tableData, userData] = await Promise.all([
        getActivitySummaryByTable(days),
        getActivitySummaryByUser(days)
      ]);
      
      setTableSummary(tableData);
      setUserSummary(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activity summary');
      console.error('Error fetching activity summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [days]);

  return {
    tableSummary,
    userSummary,
    loading,
    error,
    refetch: fetchSummary
  };
};
