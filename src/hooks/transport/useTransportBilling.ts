import { useState, useEffect, useCallback } from "react";
import { 
  FrontendTransportBilling, 
  FrontendTransportBillingRate,
  FrontendTransportBillingUsage,
  TransportBillingStatus
} from "@/integration/supabase/types/billing";
import {
  fetchTransportBillings,
  fetchTransportBillingsByPeriod,
  createTransportBilling,
  updateTransportBilling,
  deleteTransportBilling,
  fetchTransportBillingRates,
  createTransportBillingRate,
  fetchTransportBillingUsage,
  createTransportBillingUsage
} from "./billingApi";

export const useTransportBilling = () => {
  const [billingEntries, setBillingEntries] = useState<FrontendTransportBilling[]>([]);
  const [selectedBilling, setSelectedBilling] = useState<FrontendTransportBilling | null>(null);
  const [billingRates, setBillingRates] = useState<FrontendTransportBillingRate[]>([]);
  const [billingUsage, setBillingUsage] = useState<FrontendTransportBillingUsage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use mock data flag - set to false when ready to use real API
  const useMockData = false;

  // Mock data for billing entries
  const mockBillingEntries: FrontendTransportBilling[] = [
    {
      id: "1",
      billingPeriodId: "1",
      billingPeriodName: "January 2025",
      staffId: "staff-1",
      staffName: "John Doe",
      locationId: "loc-1",
      locationName: "Main Campus",
      vehicleId: "veh-1",
      vehicleInfo: "Toyota Corolla (ABC-123)",
      amount: 500,
      description: "Monthly transport fee",
      status: "Pending" as TransportBillingStatus,
      dueDate: "2025-01-15",
      paidDate: null,
      paymentReference: null,
      notes: null
    },
    {
      id: "2",
      billingPeriodId: "1",
      billingPeriodName: "January 2025",
      staffId: "staff-2",
      staffName: "Jane Smith",
      locationId: "loc-2",
      locationName: "East Campus",
      vehicleId: "veh-2",
      vehicleInfo: "Honda Civic (XYZ-789)",
      amount: 450,
      description: "Monthly transport fee",
      status: "Paid" as TransportBillingStatus,
      dueDate: "2025-01-15",
      paidDate: "2025-01-10",
      paymentReference: "PAY-123456",
      notes: "Paid early"
    }
  ];

  // Mock data for billing rates
  const mockBillingRates: FrontendTransportBillingRate[] = [
    {
      id: "1",
      locationId: "loc-1",
      locationName: "Main Campus",
      vehicleType: "Sedan",
      ratePerDay: 25,
      effectiveFrom: "2025-01-01",
      effectiveTo: null
    },
    {
      id: "2",
      locationId: "loc-2",
      locationName: "East Campus",
      vehicleType: "SUV",
      ratePerDay: 35,
      effectiveFrom: "2025-01-01",
      effectiveTo: null
    }
  ];

  // Mock data for billing usage
  const mockBillingUsage: FrontendTransportBillingUsage[] = [
    {
      id: "1",
      billingId: "1",
      usageDate: "2025-01-05",
      distance: 15,
      duration: 30,
      notes: "Regular commute"
    },
    {
      id: "2",
      billingId: "1",
      usageDate: "2025-01-06",
      distance: 18,
      duration: 35,
      notes: "Traffic delay"
    }
  ];

  // Fetch all billing entries
  const getBillingEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setBillingEntries(mockBillingEntries);
      } else {
        const data = await fetchTransportBillings();
        setBillingEntries(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch billing entries");
      console.error("Error fetching billing entries:", err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Fetch billing entries by period
  const getBillingEntriesByPeriod = useCallback(
    async (periodId: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const filteredEntries = mockBillingEntries.filter(
            entry => entry.billingPeriodId === periodId
          );
          setBillingEntries(filteredEntries);
          return filteredEntries;
        } else {
          const data = await fetchTransportBillingsByPeriod(periodId);
          setBillingEntries(data);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch billing entries for period ${periodId}`);
        console.error(`Error fetching billing entries for period ${periodId}:`, err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Fetch a single billing entry by ID
  const getBillingById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const billing = mockBillingEntries.find(b => b.id === id);
          if (billing) {
            setSelectedBilling(billing);
            return billing;
          } else {
            throw new Error("Billing entry not found");
          }
        } else {
          // In a real implementation, we would have a fetchTransportBillingById function
          // For now, we'll fetch all and filter
          const allBillings = await fetchTransportBillings();
          const billing = allBillings.find(b => b.id === id);
          
          if (billing) {
            setSelectedBilling(billing);
            return billing;
          } else {
            throw new Error("Billing entry not found");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch billing entry");
        console.error(`Error fetching billing entry with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Create a new billing entry
  const addBilling = useCallback(
    async (billing: Omit<FrontendTransportBilling, "id">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new billing
          const newBilling = {
            ...billing,
            id: `mock-${Date.now()}`
          } as FrontendTransportBilling;
          
          setBillingEntries(prev => [newBilling, ...prev]);
          return newBilling;
        } else {
          const data = await createTransportBilling(billing);
          setBillingEntries(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create billing entry");
        console.error("Error creating billing entry:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Update an existing billing entry
  const editBilling = useCallback(
    async (id: string, billing: Partial<Omit<FrontendTransportBilling, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Update the billing in the mock data
          const updatedBillings = billingEntries.map(b => 
            b.id === id ? { 
              ...b, 
              ...billing
            } as FrontendTransportBilling : b
          );
          
          setBillingEntries(updatedBillings);
          const updatedBilling = updatedBillings.find(b => b.id === id);
          
          if (updatedBilling) {
            if (selectedBilling?.id === id) {
              setSelectedBilling(updatedBilling);
            }
            return updatedBilling;
          } else {
            throw new Error("Billing entry not found");
          }
        } else {
          const data = await updateTransportBilling(id, billing);
          
          setBillingEntries(prev => 
            prev.map(b => (b.id === id ? data : b))
          );
          
          if (selectedBilling?.id === id) {
            setSelectedBilling(data);
          }
          
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update billing entry");
        console.error(`Error updating billing entry with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, billingEntries, selectedBilling]
  );

  // Delete a billing entry
  const removeBilling = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Remove the billing from the mock data
          setBillingEntries(prev => prev.filter(b => b.id !== id));
          
          if (selectedBilling?.id === id) {
            setSelectedBilling(null);
          }
        } else {
          await deleteTransportBilling(id);
          
          setBillingEntries(prev => prev.filter(b => b.id !== id));
          
          if (selectedBilling?.id === id) {
            setSelectedBilling(null);
          }
        }
        
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete billing entry");
        console.error(`Error deleting billing entry with ID ${id}:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, selectedBilling]
  );

  // Fetch all billing rates
  const getBillingRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setBillingRates(mockBillingRates);
        return mockBillingRates;
      } else {
        const data = await fetchTransportBillingRates();
        setBillingRates(data);
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch billing rates");
      console.error("Error fetching billing rates:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Create a new billing rate
  const addBillingRate = useCallback(
    async (rate: Omit<FrontendTransportBillingRate, "id">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new rate
          const newRate = {
            ...rate,
            id: `mock-${Date.now()}`
          } as FrontendTransportBillingRate;
          
          setBillingRates(prev => [newRate, ...prev]);
          return newRate;
        } else {
          const data = await createTransportBillingRate(rate);
          setBillingRates(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create billing rate");
        console.error("Error creating billing rate:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Fetch usage records for a billing entry
  const getBillingUsage = useCallback(
    async (billingId: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const filteredUsage = mockBillingUsage.filter(u => u.billingId === billingId);
          setBillingUsage(filteredUsage);
          return filteredUsage;
        } else {
          const data = await fetchTransportBillingUsage(billingId);
          setBillingUsage(data);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch usage for billing ${billingId}`);
        console.error(`Error fetching usage for billing ${billingId}:`, err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Create a new usage record
  const addBillingUsage = useCallback(
    async (usage: Omit<FrontendTransportBillingUsage, "id">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new usage
          const newUsage = {
            ...usage,
            id: `mock-${Date.now()}`
          } as FrontendTransportBillingUsage;
          
          setBillingUsage(prev => [newUsage, ...prev]);
          return newUsage;
        } else {
          const data = await createTransportBillingUsage(usage);
          setBillingUsage(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create usage record");
        console.error("Error creating usage record:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Load billing entries on initial render
  useEffect(() => {
    getBillingEntries();
    getBillingRates();
  }, [getBillingEntries, getBillingRates]);

  return {
    billingEntries,
    selectedBilling,
    billingRates,
    billingUsage,
    loading,
    error,
    getBillingEntries,
    getBillingEntriesByPeriod,
    getBillingById,
    addBilling,
    editBilling,
    removeBilling,
    getBillingRates,
    addBillingRate,
    getBillingUsage,
    addBillingUsage,
    setSelectedBilling
  };
};
