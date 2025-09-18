import { useState, useEffect, useCallback } from 'react';
import { 
  fetchCombinedRoutes, 
  fetchCombinedRouteById, 
  createCombinedRoute, 
  updateCombinedRoute, 
  deleteCombinedRoute 
} from './routeApi';
import { FrontendCombinedRoute } from '@/integration/supabase/types/transport-route';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development and testing
const mockCombinedRoutes: FrontendCombinedRoute[] = [
  {
    id: '1',
    name: 'Morning School Route',
    description: 'Combined route for morning school pickups',
    createdBy: 'user-123',
    status: 'active',
    routes: [
      { id: '1', combinedRouteId: '1', routeId: '1', routeName: '75 Polani', order: 1 },
      { id: '2', combinedRouteId: '1', routeId: '2', routeName: '49 Kihalani', order: 2 }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Afternoon Business District',
    description: 'Combined route for afternoon business district service',
    createdBy: 'user-123',
    status: 'active',
    routes: [
      { id: '3', combinedRouteId: '2', routeId: '3', routeName: '81 Luakaha', order: 1 },
      { id: '4', combinedRouteId: '2', routeId: '4', routeName: '274 Lakau', order: 2 }
    ],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Weekend Shopping Route',
    description: 'Combined route for weekend shopping centers',
    createdBy: 'user-456',
    status: 'inactive',
    routes: [
      { id: '5', combinedRouteId: '3', routeId: '2', routeName: '49 Kihalani', order: 1 },
      { id: '6', combinedRouteId: '3', routeId: '4', routeName: '274 Lakau', order: 2 }
    ],
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z'
  }
];

interface UseCombinedRouteReturn {
  combinedRoutes: FrontendCombinedRoute[];
  selectedCombinedRoute: FrontendCombinedRoute | null;
  loading: boolean;
  error: string | null;
  fetchAllCombinedRoutes: () => Promise<void>;
  fetchCombinedRoute: (id: string) => Promise<void>;
  addCombinedRoute: (combinedRoute: Omit<FrontendCombinedRoute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editCombinedRoute: (id: string, combinedRoute: Omit<FrontendCombinedRoute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeCombinedRoute: (id: string) => Promise<void>;
  setSelectedCombinedRoute: (combinedRoute: FrontendCombinedRoute | null) => void;
}

export function useCombinedRoute(useMockData = true): UseCombinedRouteReturn {
  const [combinedRoutes, setCombinedRoutes] = useState<FrontendCombinedRoute[]>([]);
  const [selectedCombinedRoute, setSelectedCombinedRoute] = useState<FrontendCombinedRoute | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCombinedRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setCombinedRoutes(mockCombinedRoutes);
      } else {
        const fetchedRoutes = await fetchCombinedRoutes();
        setCombinedRoutes(fetchedRoutes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch combined routes');
      console.error('Error fetching combined routes:', err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const fetchCombinedRoute = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const route = mockCombinedRoutes.find(r => r.id === id) || null;
        setSelectedCombinedRoute(route);
      } else {
        const fetchedRoute = await fetchCombinedRouteById(id);
        setSelectedCombinedRoute(fetchedRoute);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch combined route with id ${id}`);
      console.error(`Error fetching combined route with id ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  const addCombinedRoute = useCallback(async (combinedRoute: Omit<FrontendCombinedRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        const newRoute: FrontendCombinedRoute = {
          ...combinedRoute,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCombinedRoutes(prevRoutes => [...prevRoutes, newRoute]);
        return;
      }
      
      await createCombinedRoute(
        combinedRoute.name,
        combinedRoute.description,
        combinedRoute.createdBy,
        combinedRoute.routes.map(r => ({
          routeId: r.routeId,
          order: r.order
        }))
      );
      
      // Refresh routes list
      await fetchAllCombinedRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add combined route');
      console.error('Error adding combined route:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllCombinedRoutes]);

  const editCombinedRoute = useCallback(async (id: string, combinedRoute: Omit<FrontendCombinedRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setCombinedRoutes(prevRoutes => 
          prevRoutes.map(r => 
            r.id === id 
              ? { 
                  ...combinedRoute, 
                  id, 
                  createdAt: r.createdAt, 
                  updatedAt: new Date().toISOString() 
                } 
              : r
          )
        );
        
        if (selectedCombinedRoute?.id === id) {
          setSelectedCombinedRoute({
            ...combinedRoute,
            id,
            createdAt: selectedCombinedRoute.createdAt,
            updatedAt: new Date().toISOString()
          });
        }
        
        return;
      }
      
      await updateCombinedRoute(
        id,
        combinedRoute.name,
        combinedRoute.description,
        combinedRoute.status,
        combinedRoute.routes.map(r => ({
          routeId: r.routeId,
          order: r.order
        }))
      );
      
      // Refresh routes list and selected route if needed
      await fetchAllCombinedRoutes();
      if (selectedCombinedRoute?.id === id) {
        await fetchCombinedRoute(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update combined route with id ${id}`);
      console.error(`Error updating combined route with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllCombinedRoutes, fetchCombinedRoute, selectedCombinedRoute]);

  const removeCombinedRoute = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        setCombinedRoutes(prevRoutes => prevRoutes.filter(r => r.id !== id));
        if (selectedCombinedRoute?.id === id) {
          setSelectedCombinedRoute(null);
        }
        return;
      }
      
      await deleteCombinedRoute(id);
      
      // Refresh routes list
      await fetchAllCombinedRoutes();
      if (selectedCombinedRoute?.id === id) {
        setSelectedCombinedRoute(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete combined route with id ${id}`);
      console.error(`Error deleting combined route with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, fetchAllCombinedRoutes, selectedCombinedRoute]);

  // Load combined routes on component mount
  useEffect(() => {
    fetchAllCombinedRoutes();
  }, [fetchAllCombinedRoutes]);

  return {
    combinedRoutes,
    selectedCombinedRoute,
    loading,
    error,
    fetchAllCombinedRoutes,
    fetchCombinedRoute,
    addCombinedRoute,
    editCombinedRoute,
    removeCombinedRoute,
    setSelectedCombinedRoute
  };
}
