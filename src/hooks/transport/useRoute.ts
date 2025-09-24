import { useState, useEffect } from 'react';
import { FrontendRoute, FrontendRouteSchedule } from '@/integration/supabase/types/transport-route';
import { fetchRoutes, createRoute, updateRoute, deleteRoute } from './routeApi';

// Mock data for development
export const mockRoutes: FrontendRoute[] = [
  {
    id: 'mock-1',
    name: 'Downtown Express',
    description: 'Express route through downtown area',
    schedules: [
      { id: 'sched-1', routeId: 'mock-1', day: 'Monday', startTime: '08:00', endTime: '18:00' },
      { id: 'sched-2', routeId: 'mock-1', day: 'Tuesday', startTime: '08:00', endTime: '18:00' },
      { id: 'sched-3', routeId: 'mock-1', day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
      { id: 'sched-4', routeId: 'mock-1', day: 'Thursday', startTime: '08:00', endTime: '18:00' },
      { id: 'sched-5', routeId: 'mock-1', day: 'Friday', startTime: '08:00', endTime: '18:00' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-2',
    name: 'Suburban Loop',
    description: 'Loop route covering suburban areas',
    schedules: [
      { id: 'sched-6', routeId: 'mock-2', day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { id: 'sched-7', routeId: 'mock-2', day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { id: 'sched-8', routeId: 'mock-2', day: 'Friday', startTime: '09:00', endTime: '17:00' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useRoute(useMockData: boolean = false) {
  const [routes, setRoutes] = useState<FrontendRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRoutes = async () => {
    if (useMockData) {
      setRoutes(mockRoutes);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedRoutes = await fetchRoutes();
      setRoutes(fetchedRoutes);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (
    name: string,
    description: string,
    schedules: FrontendRouteSchedule[]
  ) => {
    if (useMockData) {
      const routeId = `mock-${Date.now()}`;
      const newRoute: FrontendRoute = {
        id: routeId,
        name,
        description,
        schedules: schedules.map((schedule, index) => ({
          ...schedule,
          id: `${routeId}-sched-${index}`,
          routeId
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRoutes(prev => [...prev, newRoute]);
      return newRoute;
    }

    setLoading(true);
    setError(null);
    
    try {
      const newRoute = await createRoute(name, description, schedules);
      setRoutes(prev => [...prev, newRoute]);
      return newRoute;
    } catch (err) {
      console.error('Error creating route:', err);
      setError(err instanceof Error ? err.message : 'Failed to create route');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editRoute = async (
    id: string,
    name: string,
    description: string,
    schedules: FrontendRouteSchedule[]
  ) => {
    if (useMockData) {
      setRoutes(prev => prev.map(route => 
        route.id === id 
          ? { 
              ...route, 
              name, 
              description, 
              schedules: schedules.map((schedule, index) => ({
                ...schedule,
                id: schedule.id || `${id}-sched-${index}`,
                routeId: id
              })), 
              updatedAt: new Date().toISOString() 
            }
          : route
      ));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedRoute = await updateRoute(id, name, description, schedules);
      setRoutes(prev => prev.map(route => 
        route.id === id ? updatedRoute : route
      ));
      return updatedRoute;
    } catch (err) {
      console.error('Error updating route:', err);
      setError(err instanceof Error ? err.message : 'Failed to update route');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeRoute = async (id: string) => {
    if (useMockData) {
      setRoutes(prev => prev.filter(route => route.id !== id));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await deleteRoute(id);
      setRoutes(prev => prev.filter(route => route.id !== id));
    } catch (err) {
      console.error('Error deleting route:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete route');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllRoutes();
  }, [useMockData]);

  return {
    routes,
    loading,
    error,
    fetchAllRoutes,
    addRoute,
    editRoute,
    removeRoute
  };
}
