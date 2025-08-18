import { useState, useEffect, useCallback } from "react";
import { FrontendBillingPeriod } from "@/integration/supabase/types/billing";
import {
  fetchBillingPeriods,
  fetchBillingPeriodById,
  createBillingPeriod,
  updateBillingPeriod,
  deleteBillingPeriod
} from "./billingApi";

export const useBillingPeriod = () => {
  const [billingPeriods, setBillingPeriods] = useState<FrontendBillingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<FrontendBillingPeriod | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use mock data flag - set to false when ready to use real API
  const useMockData = false;

  // Mock data for billing periods
  const mockBillingPeriods: FrontendBillingPeriod[] = [
    {
      id: "1",
      name: "January 2025",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      status: "Active",
      createdBy: "admin",
    },
    {
      id: "2",
      name: "February 2025",
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      status: "Closed",
      createdBy: "admin",
    },
  ];

  // Fetch all billing periods
  const getBillingPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setBillingPeriods(mockBillingPeriods);
      } else {
        const data = await fetchBillingPeriods();
        setBillingPeriods(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch billing periods");
      console.error("Error fetching billing periods:", err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Fetch a single billing period by ID
  const getBillingPeriodById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const period = mockBillingPeriods.find(p => p.id === id);
          if (period) {
            setSelectedPeriod(period);
            return period;
          } else {
            throw new Error("Billing period not found");
          }
        } else {
          const data = await fetchBillingPeriodById(id);
          setSelectedPeriod(data);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch billing period");
        console.error(`Error fetching billing period with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Create a new billing period
  const addBillingPeriod = useCallback(
    async (period: Omit<FrontendBillingPeriod, "id">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new period
          const newPeriod = {
            ...period,
            id: `mock-${Date.now()}`
          } as FrontendBillingPeriod;
          
          setBillingPeriods(prev => [newPeriod, ...prev]);
          return newPeriod;
        } else {
          const data = await createBillingPeriod(period);
          setBillingPeriods(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create billing period");
        console.error("Error creating billing period:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Update an existing billing period
  const editBillingPeriod = useCallback(
    async (id: string, period: Partial<Omit<FrontendBillingPeriod, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Update the period in the mock data
          const updatedPeriods = billingPeriods.map(p => 
            p.id === id ? { ...p, ...period } as FrontendBillingPeriod : p
          );
          
          setBillingPeriods(updatedPeriods);
          const updatedPeriod = updatedPeriods.find(p => p.id === id);
          
          if (updatedPeriod) {
            if (selectedPeriod?.id === id) {
              setSelectedPeriod(updatedPeriod);
            }
            return updatedPeriod;
          } else {
            throw new Error("Billing period not found");
          }
        } else {
          const data = await updateBillingPeriod(id, period);
          
          setBillingPeriods(prev => 
            prev.map(p => (p.id === id ? data : p))
          );
          
          if (selectedPeriod?.id === id) {
            setSelectedPeriod(data);
          }
          
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update billing period");
        console.error(`Error updating billing period with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, billingPeriods, selectedPeriod]
  );

  // Delete a billing period
  const removeBillingPeriod = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Remove the period from the mock data
          setBillingPeriods(prev => prev.filter(p => p.id !== id));
          
          if (selectedPeriod?.id === id) {
            setSelectedPeriod(null);
          }
        } else {
          await deleteBillingPeriod(id);
          
          setBillingPeriods(prev => prev.filter(p => p.id !== id));
          
          if (selectedPeriod?.id === id) {
            setSelectedPeriod(null);
          }
        }
        
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete billing period");
        console.error(`Error deleting billing period with ID ${id}:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, selectedPeriod]
  );

  // Load billing periods on initial render
  useEffect(() => {
    getBillingPeriods();
  }, [getBillingPeriods]);

  return {
    billingPeriods,
    selectedPeriod,
    loading,
    error,
    getBillingPeriods,
    getBillingPeriodById,
    addBillingPeriod,
    editBillingPeriod,
    removeBillingPeriod,
    setSelectedPeriod
  };
};
