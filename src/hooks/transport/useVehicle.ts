import { useState, useEffect, useCallback } from "react";
import { FrontendVehicle } from "@/integration/supabase/types/vehicle";
import {
  fetchVehicles,
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  fetchVehiclesByStatus
} from "./vehicleApi";
import { mockVehicles } from "@/components/transport/mock-data/vehicles";

export const useVehicle = () => {
  const [vehicles, setVehicles] = useState<FrontendVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<FrontendVehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use mock data flag - set to false when ready to use real API
  const useMockData = true;

  // Fetch all vehicles
  const getVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setVehicles(mockVehicles);
      } else {
        const data = await fetchVehicles();
        setVehicles(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Fetch a single vehicle by ID
  const getVehicleById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const vehicle = mockVehicles.find(v => v.id === id);
          if (vehicle) {
            setSelectedVehicle(vehicle);
            return vehicle;
          } else {
            throw new Error("Vehicle not found");
          }
        } else {
          const data = await fetchVehicleById(id);
          setSelectedVehicle(data);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch vehicle");
        console.error(`Error fetching vehicle with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Create a new vehicle
  const addVehicle = useCallback(
    async (vehicle: Omit<FrontendVehicle, "id">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new vehicle
          const newVehicle = {
            ...vehicle,
            id: `mock-${Date.now()}`
          } as FrontendVehicle;
          
          setVehicles(prev => [newVehicle, ...prev]);
          return newVehicle;
        } else {
          const data = await createVehicle(vehicle);
          setVehicles(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create vehicle");
        console.error("Error creating vehicle:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Update an existing vehicle
  const editVehicle = useCallback(
    async (id: string, vehicle: Partial<Omit<FrontendVehicle, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Update the vehicle in the mock data
          const updatedVehicles = vehicles.map(v => 
            v.id === id ? { ...v, ...vehicle } as FrontendVehicle : v
          );
          
          setVehicles(updatedVehicles);
          const updatedVehicle = updatedVehicles.find(v => v.id === id);
          
          if (updatedVehicle) {
            if (selectedVehicle?.id === id) {
              setSelectedVehicle(updatedVehicle);
            }
            return updatedVehicle;
          } else {
            throw new Error("Vehicle not found");
          }
        } else {
          const data = await updateVehicle(id, vehicle);
          
          setVehicles(prev => 
            prev.map(v => (v.id === id ? data : v))
          );
          
          if (selectedVehicle?.id === id) {
            setSelectedVehicle(data);
          }
          
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update vehicle");
        console.error(`Error updating vehicle with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, vehicles, selectedVehicle]
  );

  // Delete a vehicle
  const removeVehicle = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Remove the vehicle from the mock data
          setVehicles(prev => prev.filter(v => v.id !== id));
          
          if (selectedVehicle?.id === id) {
            setSelectedVehicle(null);
          }
        } else {
          await deleteVehicle(id);
          
          setVehicles(prev => prev.filter(v => v.id !== id));
          
          if (selectedVehicle?.id === id) {
            setSelectedVehicle(null);
          }
        }
        
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete vehicle");
        console.error(`Error deleting vehicle with ID ${id}:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, selectedVehicle]
  );

  // Fetch vehicles by status
  const getVehiclesByStatus = useCallback(
    async (status: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const filteredVehicles = mockVehicles.filter(v => v.status === status);
          return filteredVehicles;
        } else {
          const data = await fetchVehiclesByStatus(status);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch vehicles with status ${status}`);
        console.error(`Error fetching vehicles with status ${status}:`, err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Load vehicles on initial render
  useEffect(() => {
    getVehicles();
  }, [getVehicles]);

  return {
    vehicles,
    selectedVehicle,
    loading,
    error,
    getVehicles,
    getVehicleById,
    addVehicle,
    editVehicle,
    removeVehicle,
    getVehiclesByStatus,
    setSelectedVehicle
  };
};
