import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRouteExecutionLogsByAssignment,
  createRouteExecutionLog,
  updateRouteExecutionLog,
  deleteRouteExecutionLog
} from './routeApi';
import { 
  FrontendRouteExecutionLog 
} from '@/integration/supabase/types/transport-route';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development and testing
const mockExecutionLogs: FrontendRouteExecutionLog[] = [
  {
    id: '1',
    routeAssignmentId: '1',
    executionDate: '2025-08-10',
    startTime: '06:30',
    endTime: '07:45',
    status: 'completed',
    delayReason: null,
    notes: 'Completed without issues'
  },
  {
    id: '2',
    routeAssignmentId: '1',
    executionDate: '2025-08-11',
    startTime: '06:30',
    endTime: null,
    status: 'started',
    delayReason: null,
    notes: 'Route in progress'
  },
  {
    id: '3',
    routeAssignmentId: '2',
    executionDate: '2025-08-10',
    startTime: '14:00',
    endTime: '15:30',
    status: 'delayed',
    delayReason: 'Traffic congestion',
    notes: 'Delayed due to unexpected traffic'
  }
];

/**
 * Interface for useRouteExecutionLog hook return value
 */
interface UseRouteExecutionLogReturn {
  executionLogs: FrontendRouteExecutionLog[];
  selectedLog: FrontendRouteExecutionLog | null;
  loading: boolean;
  error: string | null;
  fetchLogsByAssignment: (assignmentId: string) => Promise<void>;
  startExecution: (
    assignmentId: string, 
    executionDate: string, 
    startTime: string, 
    notes?: string
  ) => Promise<string>;
  completeExecution: (
    logId: string, 
    endTime: string, 
    status: 'completed' | 'delayed' | 'cancelled', 
    notes?: string,
    delayReason?: string
  ) => Promise<void>;
  updateLog: (
    logId: string, 
    updates: Partial<Omit<FrontendRouteExecutionLog, 'id' | 'routeAssignmentId'>>
  ) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  setSelectedLog: (log: FrontendRouteExecutionLog | null) => void;
}

/**
 * Hook for managing route execution logs
 */
export function useRouteExecutionLog(useMockData = true): UseRouteExecutionLogReturn {
  const [executionLogs, setExecutionLogs] = useState<FrontendRouteExecutionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<FrontendRouteExecutionLog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch execution logs by assignment ID
   */
  const fetchLogsByAssignment = useCallback(async (assignmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Use mock data for development
        const filteredLogs = mockExecutionLogs.filter(log => log.routeAssignmentId === assignmentId);
        setExecutionLogs(filteredLogs);
      } else {
        // Fetch from API
        const logs = await fetchRouteExecutionLogsByAssignment(assignmentId);
        setExecutionLogs(logs);
      }
    } catch (err) {
      console.error('Error fetching execution logs:', err);
      setError('Failed to fetch execution logs');
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  /**
   * Start a new route execution
   */
  const startExecution = useCallback(async (
    assignmentId: string, 
    executionDate: string, 
    startTime: string, 
    notes?: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const newLog: FrontendRouteExecutionLog = {
        id: useMockData ? uuidv4() : '',
        routeAssignmentId: assignmentId,
        executionDate,
        startTime,
        endTime: null,
        status: 'started',
        delayReason: null,
        notes: notes || null
      };
      
      if (useMockData) {
        // Add to mock data
        const updatedLogs = [...executionLogs, newLog];
        setExecutionLogs(updatedLogs);
        return newLog.id;
      } else {
        // Create via API
        const createdLog = await createRouteExecutionLog(
          newLog.routeAssignmentId,
          newLog.executionDate,
          newLog.startTime,
          newLog.status,
          newLog.notes || '',
          newLog.delayReason
        );
        setExecutionLogs(prev => [...prev, createdLog]);
        return createdLog.id;
      }
    } catch (err) {
      console.error('Error starting route execution:', err);
      setError('Failed to start route execution');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [executionLogs, useMockData]);

  /**
   * Complete a route execution
   */
  const completeExecution = useCallback(async (
    logId: string, 
    endTime: string, 
    status: 'completed' | 'delayed' | 'cancelled', 
    notes?: string,
    delayReason?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Update mock data
        const updatedLogs = executionLogs.map(log => {
          if (log.id === logId) {
            return {
              ...log,
              endTime,
              status,
              notes: notes || log.notes,
              delayReason: delayReason || log.delayReason
            };
          }
          return log;
        });
        setExecutionLogs(updatedLogs);
      } else {
        // Update via API
        const logToUpdate = executionLogs.find(log => log.id === logId);
        if (!logToUpdate) {
          throw new Error('Execution log not found');
        }
        
        const updatedLog = {
          ...logToUpdate,
          endTime,
          status,
          notes: notes || logToUpdate.notes,
          delayReason: delayReason || logToUpdate.delayReason
        };
        
        await updateRouteExecutionLog(
          logId,
          endTime,
          status,
          notes || '',
          delayReason
        );
        
        setExecutionLogs(prev => 
          prev.map(log => log.id === logId ? updatedLog : log)
        );
      }
    } catch (err) {
      console.error('Error completing route execution:', err);
      setError('Failed to complete route execution');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [executionLogs, useMockData]);

  /**
   * Update an execution log
   */
  const updateLog = useCallback(async (
    logId: string, 
    updates: Partial<Omit<FrontendRouteExecutionLog, 'id' | 'routeAssignmentId'>>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Update mock data
        const updatedLogs = executionLogs.map(log => {
          if (log.id === logId) {
            return { ...log, ...updates };
          }
          return log;
        });
        setExecutionLogs(updatedLogs);
      } else {
        // Update via API
        const logToUpdate = executionLogs.find(log => log.id === logId);
        if (!logToUpdate) {
          throw new Error('Execution log not found');
        }
        
        const updatedLog = { ...logToUpdate, ...updates };
        
        // For API call, we need to extract the specific fields needed by updateRouteExecutionLog
        await updateRouteExecutionLog(
          logId,
          updatedLog.endTime || '',
          updatedLog.status as 'completed' | 'delayed' | 'cancelled',
          updatedLog.notes || '',
          updatedLog.delayReason
        );
        
        setExecutionLogs(prev => 
          prev.map(log => log.id === logId ? updatedLog : log)
        );
      }
    } catch (err) {
      console.error('Error updating execution log:', err);
      setError('Failed to update execution log');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [executionLogs, useMockData]);

  /**
   * Delete an execution log
   */
  const deleteLog = useCallback(async (logId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Delete from mock data
        const updatedLogs = executionLogs.filter(log => log.id !== logId);
        setExecutionLogs(updatedLogs);
      } else {
        // Delete via API
        await deleteRouteExecutionLog(logId);
        setExecutionLogs(prev => prev.filter(log => log.id !== logId));
      }
    } catch (err) {
      console.error('Error deleting execution log:', err);
      setError('Failed to delete execution log');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [executionLogs, useMockData]);

  return {
    executionLogs,
    selectedLog,
    loading,
    error,
    fetchLogsByAssignment,
    startExecution,
    completeExecution,
    updateLog,
    deleteLog,
    setSelectedLog
  };
}
