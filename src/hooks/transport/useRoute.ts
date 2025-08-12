import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRoutes, 
  fetchRouteById, 
  createRoute, 
  updateRoute, 
  deleteRoute 
} from './routeApi';
import { FrontendRoute } from '@/integration/supabase/types/transport-route';
import { v4 as uuidv4 } from 'uuid';
import { migrateRouteMockData } from './migrateRouteData';

// Mock data for development and testing
// Exported for use in migration function
export const mockRoutes: FrontendRoute[] = [
  {
    id: '1',
    name: '75 Polani',
    description: 'Route from Polani to Central Station',
    schedules: [
      { id: '1', routeId: '1', day: 'Sunday', startTime: '6:30am', endTime: '6:55am' },
      { id: '2', routeId: '1', day: 'Monday', startTime: '6:25am', endTime: '6:30am' },
      { id: '3', routeId: '1', day: 'Tuesday', startTime: '6:25am', endTime: '6:30am' },
      { id: '4', routeId: '1', day: 'Wednesday', startTime: '6:25am', endTime: '6:30am' },
      { id: '5', routeId: '1', day: 'Thursday', startTime: '6:25am', endTime: '6:30am' },
      { id: '6', routeId: '1', day: 'Friday', startTime: '6:25am', endTime: '6:30am' },
      { id: '7', routeId: '1', day: 'Saturday', startTime: '6:25am', endTime: '6:30am' },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '49 Kihalani',
    description: 'Route from Kihalani to Downtown',
    schedules: [
      { id: '8', routeId: '2', day: 'Sunday', startTime: '6:50am', endTime: '6:55am' },
      { id: '9', routeId: '2', day: 'Monday', startTime: '6:50am', endTime: '6:55am' },
      { id: '10', routeId: '2', day: 'Tuesday', startTime: '6:50am', endTime: '6:55am' },
      { id: '11', routeId: '2', day: 'Wednesday', startTime: '6:50am', endTime: '6:55am' },
      { id: '12', routeId: '2', day: 'Thursday', startTime: '6:50am', endTime: '6:55am' },
      { id: '13', routeId: '2', day: 'Friday', startTime: '6:50am', endTime: '6:55am' },
      { id: '14', routeId: '2', day: 'Saturday', startTime: '6:50am', endTime: '6:55am' },
    ],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: '81 Luakaha',
    description: 'Route from Luakaha to Business District',
    schedules: [
      { id: '15', routeId: '3', day: 'Sunday', startTime: '7:00am', endTime: '7:05am' },
      { id: '16', routeId: '3', day: 'Monday', startTime: '7:00am', endTime: '7:05am' },
      { id: '17', routeId: '3', day: 'Tuesday', startTime: '7:00am', endTime: '7:05am' },
      { id: '18', routeId: '3', day: 'Wednesday', startTime: '7:00am', endTime: '7:05am' },
      { id: '19', routeId: '3', day: 'Thursday', startTime: '7:00am', endTime: '7:05am' },
      { id: '20', routeId: '3', day: 'Friday', startTime: '7:00am', endTime: '7:05am' },
      { id: '21', routeId: '3', day: 'Saturday', startTime: '7:00am', endTime: '7:05am' },
    ],
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: '274 Lakau',
    description: 'Route from Lakau to Shopping Center',
    schedules: [
      { id: '22', routeId: '4', day: 'Sunday', startTime: '7:25am', endTime: '7:30am' },
      { id: '23', routeId: '4', day: 'Monday', startTime: '7:25am', endTime: '7:30am' },
      { id: '24', routeId: '4', day: 'Tuesday', startTime: '7:25am', endTime: '7:30am' },
      { id: '25', routeId: '4', day: 'Wednesday', startTime: '7:25am', endTime: '7:30am' },
      { id: '26', routeId: '4', day: 'Thursday', startTime: '7:25am', endTime: '7:30am' },
      { id: '27', routeId: '4', day: 'Friday', startTime: '7:25am', endTime: '7:30am' },
      { id: '28', routeId: '4', day: 'Saturday', startTime: '7:25am', endTime: '7:30am' },
    ],
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-04T00:00:00Z'
  }
];

interface UseRouteReturn {
  routes: FrontendRoute[];
  selectedRoute: FrontendRoute | null;
  loading: boolean;
  error: string | null;
  fetchAllRoutes: () => Promise<void>;
  fetchRoute: (id: string) => Promise<void>;
  addRoute: (route: Omit<FrontendRoute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editRoute: (id: string, route: Omit<FrontendRoute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeRoute: (id: string) => Promise<void>;
  setSelectedRoute: (route: FrontendRoute | null) => void;
  migrateToDatabase: () => Promise<void>;
}

export function useRoute(useMockData = false): UseRouteReturn {
  const [routes, setRoutes] = useState<FrontendRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<FrontendRoute | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setRoutes(mockRoutes);
      } else {
        const fetchedRoutes = await fetchRoutes();
        setRoutes(fetchedRoutes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const fetchRoute = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const route = mockRoutes.find(r => r.id === id) || null;
        setSelectedRoute(route);
      } else {
        const fetchedRoute = await fetchRouteById(id);
        setSelectedRoute(fetchedRoute);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch route with id ${id}`);
      console.error(`Error fetching route with id ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const addRoute = useCallback(async (route: Omit<FrontendRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const newRoute: FrontendRoute = {
          ...route,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRoutes(prevRoutes => [...prevRoutes, newRoute]);
        return;
      }
      
      await createRoute(
        route.name,
        route.description,
        route.schedules.map(s => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      );
      
      // Refresh routes list
      await fetchAllRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add route');
      console.error('Error adding route:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllRoutes]);

  const editRoute = useCallback(async (id: string, route: Omit<FrontendRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setRoutes(prevRoutes => 
          prevRoutes.map(r => 
            r.id === id 
              ? { 
                  ...route, 
                  id, 
                  createdAt: r.createdAt, 
                  updatedAt: new Date().toISOString() 
                } 
              : r
          )
        );
        
        if (selectedRoute?.id === id) {
          setSelectedRoute({
            ...route,
            id,
            createdAt: selectedRoute.createdAt,
            updatedAt: new Date().toISOString()
          });
        }
        
        return;
      }
      
      await updateRoute(
        id,
        route.name,
        route.description,
        route.schedules.map(s => ({
          id: s.id,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      );
      
      // Refresh routes list and selected route if needed
      await fetchAllRoutes();
      if (selectedRoute?.id === id) {
        await fetchRoute(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update route with id ${id}`);
      console.error(`Error updating route with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllRoutes, fetchRoute, selectedRoute]);

  const removeRoute = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setRoutes(prevRoutes => prevRoutes.filter(r => r.id !== id));
        if (selectedRoute?.id === id) {
          setSelectedRoute(null);
        }
        return;
      }
      
      await deleteRoute(id);
      
      // Refresh routes list
      await fetchAllRoutes();
      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete route with id ${id}`);
      console.error(`Error deleting route with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllRoutes, selectedRoute]);

  // Migrate mock data to database
  const migrateToDatabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await migrateRouteMockData();
      
      // Refresh routes after migration
      await fetchAllRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to migrate routes to database');
      console.error('Error migrating routes to database:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAllRoutes]);

  // Load routes on component mount
  useEffect(() => {
    fetchAllRoutes();
  }, [fetchAllRoutes]);

  return {
    routes,
    selectedRoute,
    loading,
    error,
    fetchAllRoutes,
    fetchRoute,
    addRoute,
    editRoute,
    removeRoute,
    setSelectedRoute,
    migrateToDatabase
  };
}
