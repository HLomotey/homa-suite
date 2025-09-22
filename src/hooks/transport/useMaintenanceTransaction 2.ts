import { useState, useEffect, useCallback } from "react";
import { FrontendMaintenanceTransaction } from "@/integration/supabase/types/maintenance-transaction";
import {
  fetchMaintenanceTransactions,
  fetchMaintenanceTransactionById,
  createMaintenanceTransaction,
  updateMaintenanceTransaction,
  deleteMaintenanceTransaction,
  fetchMaintenanceTransactionsByVehicle
} from "./maintenanceTransactionApi";
import { mockMaintenanceTransactions } from "@/components/transport/mock-data/maintenance-transactions";

export const useMaintenanceTransaction = () => {
  const [transactions, setTransactions] = useState<FrontendMaintenanceTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<FrontendMaintenanceTransaction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use mock data flag - set to false when ready to use real API
  const useMockData = false;

  // Fetch all maintenance transactions
  const getTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setTransactions(mockMaintenanceTransactions);
      } else {
        const data = await fetchMaintenanceTransactions();
        setTransactions(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch maintenance transactions");
      console.error("Error fetching maintenance transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // Fetch a single maintenance transaction by ID
  const getTransactionById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const transaction = mockMaintenanceTransactions.find(t => t.id === id);
          if (transaction) {
            setSelectedTransaction(transaction);
            return transaction;
          } else {
            throw new Error("Maintenance transaction not found");
          }
        } else {
          const data = await fetchMaintenanceTransactionById(id);
          setSelectedTransaction(data);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch maintenance transaction");
        console.error(`Error fetching maintenance transaction with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Create a new maintenance transaction
  const addTransaction = useCallback(
    async (transaction: Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Generate a mock ID for the new transaction
          const newTransaction = {
            ...transaction,
            id: `mock-${Date.now()}`,
            vehicleInfo: "Mock Vehicle Info",
            maintenanceTypeName: "Mock Maintenance Type"
          } as FrontendMaintenanceTransaction;
          
          setTransactions(prev => [newTransaction, ...prev]);
          return newTransaction;
        } else {
          const data = await createMaintenanceTransaction(transaction);
          setTransactions(prev => [data, ...prev]);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create maintenance transaction");
        console.error("Error creating maintenance transaction:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Update an existing maintenance transaction
  const editTransaction = useCallback(
    async (id: string, transaction: Partial<Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">>) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Update the transaction in the mock data
          const updatedTransactions = transactions.map(t => {
            if (t.id === id) {
              return {
                ...t,
                ...transaction,
              } as FrontendMaintenanceTransaction;
            }
            return t;
          });
          
          setTransactions(updatedTransactions);
          const updatedTransaction = updatedTransactions.find(t => t.id === id);
          
          if (updatedTransaction) {
            if (selectedTransaction?.id === id) {
              setSelectedTransaction(updatedTransaction);
            }
            return updatedTransaction;
          } else {
            throw new Error("Maintenance transaction not found");
          }
        } else {
          const data = await updateMaintenanceTransaction(id, transaction);
          
          setTransactions(prev => 
            prev.map(t => (t.id === id ? data : t))
          );
          
          if (selectedTransaction?.id === id) {
            setSelectedTransaction(data);
          }
          
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update maintenance transaction");
        console.error(`Error updating maintenance transaction with ID ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, transactions, selectedTransaction]
  );

  // Delete a maintenance transaction
  const removeTransaction = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          // Remove the transaction from the mock data
          setTransactions(prev => prev.filter(t => t.id !== id));
          
          if (selectedTransaction?.id === id) {
            setSelectedTransaction(null);
          }
        } else {
          await deleteMaintenanceTransaction(id);
          
          setTransactions(prev => prev.filter(t => t.id !== id));
          
          if (selectedTransaction?.id === id) {
            setSelectedTransaction(null);
          }
        }
        
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete maintenance transaction");
        console.error(`Error deleting maintenance transaction with ID ${id}:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, selectedTransaction]
  );

  // Fetch maintenance transactions by vehicle ID
  const getTransactionsByVehicle = useCallback(
    async (vehicleId: string) => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const filteredTransactions = mockMaintenanceTransactions.filter(t => t.vehicleId === vehicleId);
          return filteredTransactions;
        } else {
          const data = await fetchMaintenanceTransactionsByVehicle(vehicleId);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch maintenance transactions for vehicle ${vehicleId}`);
        console.error(`Error fetching maintenance transactions for vehicle ${vehicleId}:`, err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [useMockData]
  );

  // Load transactions on initial render
  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  return {
    transactions,
    selectedTransaction,
    loading,
    error,
    getTransactions,
    getTransactionById,
    addTransaction,
    editTransaction,
    removeTransaction,
    getTransactionsByVehicle,
    setSelectedTransaction
  };
};
