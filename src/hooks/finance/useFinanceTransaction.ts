/**
 * Finance Transaction hooks for Supabase integration
 * These hooks provide data fetching and state management for finance transaction data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FinanceTransaction,
  FrontendFinanceTransaction,
  mapDatabaseFinanceTransactionToFrontend
} from "@/integration/supabase/types/finance";
import { supabase } from "@/integration/supabase/client";
import * as XLSX from 'xlsx';
import { processFinanceData, generateFinanceTemplate } from "@/utils/financeProcessor";

/**
 * Hook for fetching all finance transactions
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useFinanceTransactions = () => {
  const [transactions, setTransactions] = useState<FrontendFinanceTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_transactions")
        .select("*")
        .order("date", { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setTransactions(data.map(mapDatabaseFinanceTransactionToFrontend));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single finance transaction by ID
 * @param id Transaction ID
 * @returns Object containing transaction data, loading state, error state, and refetch function
 */
export const useFinanceTransaction = (id: string) => {
  const [transaction, setTransaction] = useState<FrontendFinanceTransaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setTransaction(mapDatabaseFinanceTransactionToFrontend(data));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transaction, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new finance transaction
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateFinanceTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdTransaction, setCreatedTransaction] = useState<FrontendFinanceTransaction | null>(null);

  const create = useCallback(
    async (transactionData: Omit<FrontendFinanceTransaction, "id">) => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert frontend data to database format
        const dbTransactionData = {
          transaction_id: transactionData.transactionId,
          amount: transactionData.amount,
          account: transactionData.account,
          client: transactionData.client,
          payment_method: transactionData.paymentMethod,
          date: transactionData.date,
          category: transactionData.category,
          description: transactionData.description,
          invoice_id: transactionData.invoiceId,
          status: transactionData.status
        };
        
        const { data, error: supabaseError } = await supabase
          .from("finance_transactions")
          .insert(dbTransactionData)
          .select()
          .single();
        
        if (supabaseError) throw new Error(supabaseError.message);
        
        const newTransaction = mapDatabaseFinanceTransactionToFrontend(data);
        setCreatedTransaction(newTransaction);
        return newTransaction;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error, createdTransaction };
};

/**
 * Hook for updating a finance transaction
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateFinanceTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedTransaction, setUpdatedTransaction] = useState<FrontendFinanceTransaction | null>(null);

  const update = useCallback(
    async (
      id: string,
      transactionData: Partial<Omit<FrontendFinanceTransaction, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert frontend data to database format
        const dbTransactionData: Record<string, any> = {};
        
        if (transactionData.transactionId !== undefined) dbTransactionData.transaction_id = transactionData.transactionId;
        if (transactionData.amount !== undefined) dbTransactionData.amount = transactionData.amount;
        if (transactionData.account !== undefined) dbTransactionData.account = transactionData.account;
        if (transactionData.client !== undefined) dbTransactionData.client = transactionData.client;
        if (transactionData.paymentMethod !== undefined) dbTransactionData.payment_method = transactionData.paymentMethod;
        if (transactionData.date !== undefined) dbTransactionData.date = transactionData.date;
        if (transactionData.category !== undefined) dbTransactionData.category = transactionData.category;
        if (transactionData.description !== undefined) dbTransactionData.description = transactionData.description;
        if (transactionData.invoiceId !== undefined) dbTransactionData.invoice_id = transactionData.invoiceId;
        if (transactionData.status !== undefined) dbTransactionData.status = transactionData.status;
        
        const { data, error: supabaseError } = await supabase
          .from("finance_transactions")
          .update(dbTransactionData)
          .eq("id", id)
          .select()
          .single();
        
        if (supabaseError) throw new Error(supabaseError.message);
        
        const updatedTransaction = mapDatabaseFinanceTransactionToFrontend(data);
        setUpdatedTransaction(updatedTransaction);
        return updatedTransaction;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { update, loading, error, updatedTransaction };
};

/**
 * Hook for deleting a finance transaction
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteFinanceTransaction = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: supabaseError } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("id", id);
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setIsDeleted(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteTransaction, loading, error, isDeleted };
};

/**
 * Hook for uploading finance transaction data from Excel
 * @returns Object containing upload function, loading state, and error state
 */
export const useUploadFinanceTransactions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number>(0);

  const upload = useCallback(async (file: File) => {
    try {
      console.log('Starting finance transaction upload process');
      setLoading(true);
      setError(null);
      setProgress(0);
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }
      
      if (file.size === 0) {
        throw new Error('File is empty');
      }
      
      console.log(`Reading file: ${file.name}, size: ${file.size} bytes`);
      
      // Read the Excel file
      const fileData = await file.arrayBuffer();
      console.log('File read successfully, converting to ArrayBuffer');
      setProgress(10);
      
      // Process the Excel data using our financeProcessor utility
      console.log('Processing finance data from Excel');
      const result = await processFinanceData(fileData);
      console.log('Finance data processed:', result);
      setProgress(30);
      
      if (!result.success) {
        console.error('Validation errors in finance data:', result.errors);
        throw new Error(`Validation errors: ${result.errors?.join(", ") || "Unknown error"}`);
      }
      
      if (!result.data || result.data.length === 0) {
        console.error('No valid transactions found in the file');
        throw new Error("No valid transactions found in the file");
      }
      
      console.log(`Found ${result.data.length} valid transactions, beginning database insert`);
      setProgress(50);
      
      // Batch insert to Supabase
      let inserted = 0;
      const totalRecords = result.data.length;
      const batchSize = 20; // Insert in batches of 20 for better performance
      const batches = [];
      
      // Create batches
      for (let i = 0; i < result.data.length; i += batchSize) {
        batches.push(result.data.slice(i, i + batchSize));
      }
      
      console.log(`Created ${batches.length} batches for insertion`);
      
      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} records`);
        
        // Create the transactions in the database
        const { error: supabaseError } = await supabase
          .from("finance_transactions")
          .insert(batch);
          
        if (supabaseError) {
          console.error('Supabase error during batch insert:', supabaseError);
          throw new Error(`Database error: ${supabaseError.message}`);
        }
        
        inserted += batch.length;
        const newProgress = 50 + Math.floor((inserted / totalRecords) * 50);
        console.log(`Inserted ${inserted}/${totalRecords} records, progress: ${newProgress}%`);
        setProgress(newProgress);
      }
      
      console.log('Finance transaction upload completed successfully');
      setLoading(false);
      setProgress(100);
      setUploadedCount(result.data.length);
      return result.data.length;
    } catch (err) {
      console.error('Error in finance transaction upload:', err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
      setProgress(0);
      throw err;
    }
  }, []);

  /**
   * Generate a downloadable template for finance transactions
   * @returns Promise<Blob> that can be used to create a downloadable file
   */
  const generateTemplate = useCallback(async () => {
    try {
      console.log('Generating finance template');
      return await generateFinanceTemplate();
    } catch (err) {
      console.error('Error generating finance template:', err);
      setError('Failed to generate template. Please try again.');
      // Return an empty blob as fallback
      return new Blob([""], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
  }, []);

  return { upload, generateTemplate, loading, progress, error, uploadedCount };
};

/**
 * Hook for fetching finance transactions by client
 * @param client Client name to filter by
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useFinanceTransactionsByClient = (client: string) => {
  const [transactions, setTransactions] = useState<FrontendFinanceTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!client) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_transactions")
        .select("*")
        .ilike("client", `%${client}%`)
        .order("date", { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setTransactions(data.map(mapDatabaseFinanceTransactionToFrontend));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching finance transactions by category
 * @param category Category to filter by
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useFinanceTransactionsByCategory = (category: string) => {
  const [transactions, setTransactions] = useState<FrontendFinanceTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!category) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("category", category)
        .order("date", { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setTransactions(data.map(mapDatabaseFinanceTransactionToFrontend));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};
