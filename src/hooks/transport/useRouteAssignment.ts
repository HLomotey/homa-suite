import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRouteAssignments, 
  fetchRouteAssignmentById, 
  createRouteAssignment, 
  updateRouteAssignment, 
  deleteRouteAssignment,
  createRouteExecutionLog,
  updateRouteExecutionLog,
  fetchRouteExecutionLogsByAssignment
} from './routeApi';
import { 
  FrontendRouteAssignment, 
  FrontendRouteExecutionLog 
} from '@/integration/supabase/types/transport-route';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development and testing
const mockRouteAssignments: FrontendRouteAssignment[] = [
  {
    id: '1',
    combinedRouteId: '1',
    combinedRouteName: 'Morning School Route',
    vehicleId: '1',
    vehicleInfo: 'Toyota Hiace (ABC123)',
    driverId: 'driver-1',
    driverName: 'John Driver',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'in_progress',
    notes: 'Regular morning school route',
    executionLogs: [
      {
        id: '1',
        routeAssignmentId: '1',
        executionDate: '2025-08-10',
        startTime: '06:30',
        endTime: '07:45',
        status: 'completed',
        notes: 'Completed without issues'
      },
      {
        id: '2',
        routeAssignmentId: '1',
        executionDate: '2025-08-11',
        startTime: '06:30',
        status: 'started',
        notes: 'Route in progress'
      }
    ]
  },
  {
    id: '2',
    combinedRouteId: '2',
    combinedRouteName: 'Afternoon Business District',
    vehicleId: '2',
    vehicleInfo: 'Ford Transit (DEF456)',
    driverId: 'driver-2',
    driverName: 'Jane Driver',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'scheduled',
    notes: 'Afternoon business district route',
    executionLogs: []
  },
  {
    id: '3',
    combinedRouteId: '3',
    combinedRouteName: 'Weekend Shopping Route',
    vehicleId: '3',
    vehicleInfo: 'Mercedes Sprinter (GHI789)',
    driverId: 'driver-1',
    driverName: 'John Driver',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'scheduled',
    notes: 'Weekend shopping centers route',
    executionLogs: []
  }
];

interface UseRouteAssignmentReturn {
  assignments: FrontendRouteAssignment[];
  selectedAssignment: FrontendRouteAssignment | null;
  loading: boolean;
  error: string | null;
  fetchAllAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  fetchAssignmentsByDriver: (driverId: string) => Promise<void>;
  addAssignment: (assignment: Omit<FrontendRouteAssignment, 'id' | 'executionLogs'>) => Promise<void>;
  editAssignment: (id: string, assignment: Omit<FrontendRouteAssignment, 'id' | 'executionLogs'>) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
  setSelectedAssignment: (assignment: FrontendRouteAssignment | null) => void;
  startRouteExecution: (assignmentId: string, executionDate: string, startTime: string, notes: string) => Promise<void>;
  completeRouteExecution: (
    logId: string, 
    endTime: string, 
    status: 'completed' | 'delayed' | 'cancelled', 
    notes: string,
    delayReason?: string
  ) => Promise<void>;
  fetchExecutionLogs: (assignmentId: string) => Promise<FrontendRouteExecutionLog[]>;
}

export function useRouteAssignment(useMockData = true): UseRouteAssignmentReturn {
  const [assignments, setAssignments] = useState<FrontendRouteAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<FrontendRouteAssignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setAssignments(mockRouteAssignments);
      } else {
        const fetchedAssignments = await fetchRouteAssignments();
        setAssignments(fetchedAssignments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch route assignments');
      console.error('Error fetching route assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const fetchAssignment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const assignment = mockRouteAssignments.find(a => a.id === id) || null;
        setSelectedAssignment(assignment);
      } else {
        const fetchedAssignment = await fetchRouteAssignmentById(id);
        setSelectedAssignment(fetchedAssignment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch route assignment with id ${id}`);
      console.error(`Error fetching route assignment with id ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const fetchAssignmentsByDriver = useCallback(async (driverId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const driverAssignments = mockRouteAssignments.filter(a => a.driverId === driverId);
        setAssignments(driverAssignments);
      } else {
        // In a real implementation, we would have a specific API endpoint for this
        const allAssignments = await fetchRouteAssignments();
        const driverAssignments = allAssignments.filter(a => a.driverId === driverId);
        setAssignments(driverAssignments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch assignments for driver ${driverId}`);
      console.error(`Error fetching assignments for driver ${driverId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const addAssignment = useCallback(async (assignment: Omit<FrontendRouteAssignment, 'id' | 'executionLogs'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const newAssignment: FrontendRouteAssignment = {
          ...assignment,
          id: uuidv4(),
          executionLogs: []
        };
        setAssignments(prevAssignments => [...prevAssignments, newAssignment]);
        return;
      }
      
      await createRouteAssignment(
        assignment.combinedRouteId,
        assignment.vehicleId,
        assignment.driverId,
        assignment.startDate,
        assignment.endDate || null,
        assignment.notes
      );
      
      // Refresh assignments list
      await fetchAllAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add route assignment');
      console.error('Error adding route assignment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllAssignments]);

  const editAssignment = useCallback(async (id: string, assignment: Omit<FrontendRouteAssignment, 'id' | 'executionLogs'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setAssignments(prevAssignments => 
          prevAssignments.map(a => 
            a.id === id 
              ? { 
                  ...assignment, 
                  id,
                  executionLogs: a.executionLogs || []
                } 
              : a
          )
        );
        
        if (selectedAssignment?.id === id) {
          setSelectedAssignment({
            ...assignment,
            id,
            executionLogs: selectedAssignment.executionLogs || []
          });
        }
        
        return;
      }
      
      await updateRouteAssignment(
        id,
        assignment.vehicleId,
        assignment.driverId,
        assignment.startDate,
        assignment.endDate || null,
        assignment.status,
        assignment.notes
      );
      
      // Refresh assignments list and selected assignment if needed
      await fetchAllAssignments();
      if (selectedAssignment?.id === id) {
        await fetchAssignment(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update route assignment with id ${id}`);
      console.error(`Error updating route assignment with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllAssignments, fetchAssignment, selectedAssignment]);

  const removeAssignment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setAssignments(prevAssignments => prevAssignments.filter(a => a.id !== id));
        if (selectedAssignment?.id === id) {
          setSelectedAssignment(null);
        }
        return;
      }
      
      await deleteRouteAssignment(id);
      
      // Refresh assignments list
      await fetchAllAssignments();
      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete route assignment with id ${id}`);
      console.error(`Error deleting route assignment with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllAssignments, selectedAssignment]);

  const startRouteExecution = useCallback(async (
    assignmentId: string, 
    executionDate: string, 
    startTime: string, 
    notes: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const newLog: FrontendRouteExecutionLog = {
          id: uuidv4(),
          routeAssignmentId: assignmentId,
          executionDate,
          startTime,
          status: 'started',
          notes
        };
        
        setAssignments(prevAssignments => 
          prevAssignments.map(a => 
            a.id === assignmentId 
              ? { 
                  ...a, 
                  executionLogs: [...(a.executionLogs || []), newLog],
                  status: 'in_progress'
                } 
              : a
          )
        );
        
        if (selectedAssignment?.id === assignmentId) {
          setSelectedAssignment({
            ...selectedAssignment,
            executionLogs: [...(selectedAssignment.executionLogs || []), newLog],
            status: 'in_progress'
          });
        }
        
        return;
      }
      
      await createRouteExecutionLog(
        assignmentId,
        executionDate,
        startTime,
        'started',
        notes
      );
      
      // Update the assignment status to in_progress
      if (selectedAssignment && selectedAssignment.id === assignmentId) {
        await updateRouteAssignment(
          assignmentId,
          selectedAssignment.vehicleId,
          selectedAssignment.driverId,
          selectedAssignment.startDate,
          selectedAssignment.endDate || null,
          'in_progress',
          selectedAssignment.notes
        );
      }
      
      // Refresh assignments list and selected assignment if needed
      await fetchAllAssignments();
      if (selectedAssignment?.id === assignmentId) {
        await fetchAssignment(assignmentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to start route execution for assignment ${assignmentId}`);
      console.error(`Error starting route execution for assignment ${assignmentId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllAssignments, fetchAssignment, selectedAssignment]);

  const completeRouteExecution = useCallback(async (
    logId: string, 
    endTime: string, 
    status: 'completed' | 'delayed' | 'cancelled', 
    notes: string,
    delayReason?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Find the assignment that contains this log
        let targetAssignmentId: string | null = null;
        
        setAssignments(prevAssignments => 
          prevAssignments.map(a => {
            const logIndex = (a.executionLogs || []).findIndex(log => log.id === logId);
            
            if (logIndex >= 0) {
              targetAssignmentId = a.id;
              const updatedLogs = [...(a.executionLogs || [])];
              updatedLogs[logIndex] = {
                ...updatedLogs[logIndex],
                endTime,
                status,
                notes,
                delayReason
              };
              
              return {
                ...a,
                executionLogs: updatedLogs,
                // If the status is completed or cancelled, update the assignment status
                status: status === 'completed' ? 'completed' : 
                       status === 'cancelled' ? 'cancelled' : 
                       a.status
              };
            }
            
            return a;
          })
        );
        
        // Update selected assignment if needed
        if (selectedAssignment && targetAssignmentId === selectedAssignment.id) {
          const logIndex = (selectedAssignment.executionLogs || []).findIndex(log => log.id === logId);
          
          if (logIndex >= 0) {
            const updatedLogs = [...(selectedAssignment.executionLogs || [])];
            updatedLogs[logIndex] = {
              ...updatedLogs[logIndex],
              endTime,
              status,
              notes,
              delayReason
            };
            
            setSelectedAssignment({
              ...selectedAssignment,
              executionLogs: updatedLogs,
              status: status === 'completed' ? 'completed' : 
                     status === 'cancelled' ? 'cancelled' : 
                     selectedAssignment.status
            });
          }
        }
        
        return;
      }
      
      await updateRouteExecutionLog(
        logId,
        endTime,
        status,
        notes,
        delayReason
      );
      
      // Find the assignment for this log and update its status if needed
      if (selectedAssignment) {
        const log = (selectedAssignment.executionLogs || []).find(l => l.id === logId);
        
        if (log && (status === 'completed' || status === 'cancelled')) {
          await updateRouteAssignment(
            selectedAssignment.id,
            selectedAssignment.vehicleId,
            selectedAssignment.driverId,
            selectedAssignment.startDate,
            selectedAssignment.endDate || null,
            status === 'completed' ? 'completed' : 'cancelled',
            selectedAssignment.notes
          );
        }
      }
      
      // Refresh assignments list and selected assignment if needed
      await fetchAllAssignments();
      if (selectedAssignment) {
        await fetchAssignment(selectedAssignment.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to complete route execution log ${logId}`);
      console.error(`Error completing route execution log ${logId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllAssignments, fetchAssignment, selectedAssignment]);

  const fetchExecutionLogs = useCallback(async (assignmentId: string): Promise<FrontendRouteExecutionLog[]> => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const assignment = mockRouteAssignments.find(a => a.id === assignmentId);
        return assignment?.executionLogs || [];
      } else {
        return await fetchRouteExecutionLogsByAssignment(assignmentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch execution logs for assignment ${assignmentId}`);
      console.error(`Error fetching execution logs for assignment ${assignmentId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Load assignments on component mount
  useEffect(() => {
    fetchAllAssignments();
  }, [fetchAllAssignments]);

  return {
    assignments,
    selectedAssignment,
    loading,
    error,
    fetchAllAssignments,
    fetchAssignment,
    fetchAssignmentsByDriver,
    addAssignment,
    editAssignment,
    removeAssignment,
    setSelectedAssignment,
    startRouteExecution,
    completeRouteExecution,
    fetchExecutionLogs
  };
}
