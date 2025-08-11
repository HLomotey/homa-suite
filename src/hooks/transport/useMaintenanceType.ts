import { useState, useEffect, useCallback } from "react";
import { FrontendMaintenanceType } from "@/integration/supabase/types/maintenance-type";
import {
  fetchMaintenanceTypes,
  fetchMaintenanceTypeById,
  createMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  fetchMaintenanceTypesByCategory
} from "./maintenanceTypeApi";
import { mockMaintenanceTypes } from "@/components/transport/mock-data/maintenance-types";

export const useMaintenanceType = () => {
  const [maintenanceTypes, setMaintenanceTypes] = useState<FrontendMaintenanceType[]>([]);
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<FrontendMaintenanceType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use mock data flag - set to false when ready to use real API
  const useMockData = true;

  // Fetch all maintenance types
  const getMaintenanceTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setMaintenanceTypes(mockMaintenanceTypes);
      } else {
        const data = await fetchMaintenanceTypes();
        setMaintenanceTypes(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch maintenance types");
      console.error("Error fetching maintenance types:", err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Fetch a single maintenance type by ID
  const getMaintenanceTypeById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const maintenanceType = mockMaintenanceTypes.find(mt => mt.id === id);
          if (maintenanceType) {
            setSelectedMaintenanceType(maintenanceType);
            return maintenanceType;
          } else {
            throw new Error("Maintenance type not found");
          }
        } else {
          const data = await fetchMaintenanceTypeById(id);
          setSelectedMaintenanceType(data);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch maintenance type");
        console.error(`Error fetching maintenance type with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Create a new maintenance type
  const addMaintenanceType = useCallback(
    async (maintenanceType: Omit<FrontendMaintenanceType, "id">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new maintenance type
          const newMaintenanceType = {
            ...maintenanceType,
            id: `mock-${Date.now()}`
          } as FrontendMaintenanceType;
          
          setMaintenanceTypes(prev => [newMaintenanceType, ...prev]);
          return newMaintenanceType;
        } else {
          const data = await createMaintenanceType(maintenanceType);
          setMaintenanceTypes(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create maintenance type");
        console.error("Error creating maintenance type:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Update an existing maintenance type
  const editMaintenanceType = useCallback(
    async (id: string, maintenanceType: Partial<Omit<FrontendMaintenanceType, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Update the maintenance type in the mock data
          const updatedMaintenanceTypes = maintenanceTypes.map(mt => 
            mt.id === id ? { ...mt, ...maintenanceType } as FrontendMaintenanceType : mt
          );
          
          setMaintenanceTypes(updatedMaintenanceTypes);
          const updatedMaintenanceType = updatedMaintenanceTypes.find(mt => mt.id === id);
          
          if (updatedMaintenanceType) {
            if (selectedMaintenanceType?.id === id) {
              setSelectedMaintenanceType(updatedMaintenanceType);
            }
            return updatedMaintenanceType;
          } else {
            throw new Error("Maintenance type not found");
          }
        } else {
          const data = await updateMaintenanceType(id, maintenanceType);
          
          setMaintenanceTypes(prev => 
            prev.map(mt => (mt.id === id ? data : mt))
          );
          
          if (selectedMaintenanceType?.id === id) {
            setSelectedMaintenanceType(data);
          }
          
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update maintenance type");
        console.error(`Error updating maintenance type with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, maintenanceTypes, selectedMaintenanceType]
  );

  // Delete a maintenance type
  const removeMaintenanceType = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Remove the maintenance type from the mock data
          setMaintenanceTypes(prev => prev.filter(mt => mt.id !== id));
          
          if (selectedMaintenanceType?.id === id) {
            setSelectedMaintenanceType(null);
          }
        } else {
          await deleteMaintenanceType(id);
          
          setMaintenanceTypes(prev => prev.filter(mt => mt.id !== id));
          
          if (selectedMaintenanceType?.id === id) {
            setSelectedMaintenanceType(null);
          }
        }
        
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete maintenance type");
        console.error(`Error deleting maintenance type with ID ${id}:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, selectedMaintenanceType]
  );

  // Fetch maintenance types by category
  const getMaintenanceTypesByCategory = useCallback(
    async (category: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const filteredMaintenanceTypes = mockMaintenanceTypes.filter(mt => mt.category === category);
          return filteredMaintenanceTypes;
        } else {
          const data = await fetchMaintenanceTypesByCategory(category);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch maintenance types with category ${category}`);
        console.error(`Error fetching maintenance types with category ${category}:`, err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Load maintenance types on initial render
  useEffect(() => {
    getMaintenanceTypes();
  }, [getMaintenanceTypes]);

  return {
    maintenanceTypes,
    selectedMaintenanceType,
    loading,
    error,
    getMaintenanceTypes,
    getMaintenanceTypeById,
    addMaintenanceType,
    editMaintenanceType,
    removeMaintenanceType,
    getMaintenanceTypesByCategory,
    setSelectedMaintenanceType
  };
};
