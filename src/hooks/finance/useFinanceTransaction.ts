/**
 * Finance Transaction hooks for Supabase integration
 * These hooks provide data fetching and state management for finance transaction data
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FinanceTransaction,
  FrontendFinanceTransaction,
  mapDatabaseFinanceTransactionToFrontend
} from "@/integration/supabase/types/finance";
import { supabase } from "@/integration/supabase/client";
import * as XLSX from 'xlsx';
import { processFinanceData, generateFinanceTemplate } from "@/utils/financeProcessor";
import { toast } from "sonner";

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
          client: transactionData.client,
          invoice_id: transactionData.invoiceId,
          date: transactionData.date,
          status: transactionData.status,
          date_paid: transactionData.datePaid,
          description: transactionData.description,
          rate: transactionData.rate,
          quantity: transactionData.quantity,
          discount_percentage: transactionData.discountPercentage,
          line_subtotal: transactionData.lineSubtotal,
          tax_1_type: transactionData.tax1Type,
          tax_1_amount: transactionData.tax1Amount,
          tax_2_type: transactionData.tax2Type,
          tax_2_amount: transactionData.tax2Amount,
          amount: transactionData.amount,
          currency: transactionData.currency
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
        
        if (transactionData.client !== undefined) dbTransactionData.client = transactionData.client;
        if (transactionData.invoiceId !== undefined) dbTransactionData.invoice_id = transactionData.invoiceId;
        if (transactionData.date !== undefined) dbTransactionData.date = transactionData.date;
        if (transactionData.status !== undefined) dbTransactionData.status = transactionData.status;
        if (transactionData.datePaid !== undefined) dbTransactionData.date_paid = transactionData.datePaid;
        if (transactionData.description !== undefined) dbTransactionData.description = transactionData.description;
        if (transactionData.rate !== undefined) dbTransactionData.rate = transactionData.rate;
        if (transactionData.quantity !== undefined) dbTransactionData.quantity = transactionData.quantity;
        if (transactionData.discountPercentage !== undefined) dbTransactionData.discount_percentage = transactionData.discountPercentage;
        if (transactionData.lineSubtotal !== undefined) dbTransactionData.line_subtotal = transactionData.lineSubtotal;
        if (transactionData.tax1Type !== undefined) dbTransactionData.tax_1_type = transactionData.tax1Type;
        if (transactionData.tax1Amount !== undefined) dbTransactionData.tax_1_amount = transactionData.tax1Amount;
        if (transactionData.tax2Type !== undefined) dbTransactionData.tax_2_type = transactionData.tax2Type;
        if (transactionData.tax2Amount !== undefined) dbTransactionData.tax_2_amount = transactionData.tax2Amount;
        if (transactionData.amount !== undefined) dbTransactionData.amount = transactionData.amount;
        if (transactionData.currency !== undefined) dbTransactionData.currency = transactionData.currency;
        
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
  const [timeoutWarnings, setTimeoutWarnings] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to cancel ongoing upload operations
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      console.log('🛑 Cancelling upload operation...');
      abortControllerRef.current.abort();
      setLoading(false);
      setProgress(0);
      toast.info('Upload operation cancelled');
    }
  }, []);

  const upload = useCallback(async (file: File) => {
    // Create a new AbortController for this upload operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    try {
      console.log('Starting finance transaction upload process');
      setLoading(true);
      setError(null);
      setProgress(0);
      setTimeoutWarnings([]);
      
      // Create a timeout detector for the entire process
      const overallTimeout = setTimeout(() => {
        console.warn('⚠️ TIMEOUT WARNING: Overall upload process taking longer than expected (60s)');
        toast.warning('Upload process is taking longer than expected. Check console for details.');
        setTimeoutWarnings(prev => [...prev, 'Overall upload process exceeded 60s']);
      }, 60000); // 60 second timeout for the entire process
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }
      
      if (file.size === 0) {
        throw new Error('File is empty');
      }
      
      console.log(`Reading file: ${file.name}, size: ${file.size} bytes`);
      
      // Read the Excel file with timeout detection
      console.time('file-read');
      const fileReadTimeout = setTimeout(() => {
        console.warn('⚠️ TIMEOUT WARNING: File reading operation taking longer than expected (10s)');
        setTimeoutWarnings(prev => [...prev, 'File reading exceeded 10s']);
      }, 10000); // 10 second timeout for file reading
      
      const fileData = await file.arrayBuffer();
      clearTimeout(fileReadTimeout);
      console.timeEnd('file-read');
      console.log('File read successfully, converting to ArrayBuffer');
      setProgress(10);
      
      // Process the Excel data using our financeProcessor utility with timeout detection
      console.log('Processing finance data from Excel');
      console.time('data-processing');
      const processingTimeout = setTimeout(() => {
        console.warn('⚠️ TIMEOUT WARNING: Data processing operation taking longer than expected (15s)');
        setTimeoutWarnings(prev => [...prev, 'Data processing exceeded 15s']);
      }, 15000); // 15 second timeout for data processing
      
      const result = await processFinanceData(fileData);
      clearTimeout(processingTimeout);
      console.timeEnd('data-processing');
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
      
      console.log(`Found ${result.data.length} valid transactions, checking for duplicates`);
      setProgress(40);
      
      // Check for existing records to prevent duplicates
      console.log('Checking for existing invoice records to prevent duplicates');
      const invoiceNumbers = result.data.map(t => t.invoiceId).filter(Boolean);
      const uniqueInvoiceNumbers = [...new Set(invoiceNumbers)];
      
      if (uniqueInvoiceNumbers.length > 0) {
        console.log(`Checking ${uniqueInvoiceNumbers.length} unique invoice numbers for duplicates`);
        const { data: existingInvoices, error: checkError } = await supabase
          .from("finance_invoices")
          .select("invoice_number")
          .in("invoice_number", uniqueInvoiceNumbers);
          
        if (checkError) {
          console.error('Error checking for existing invoices:', checkError);
          throw new Error(`Error checking for duplicates: ${checkError.message}`);
        }
        
        const existingInvoiceNumbers = new Set(existingInvoices?.map(inv => inv.invoice_number) || []);
        
        if (existingInvoiceNumbers.size > 0) {
          console.warn(`Found ${existingInvoiceNumbers.size} duplicate invoice numbers:`, Array.from(existingInvoiceNumbers));
          
          // Filter out duplicates
          const originalCount = result.data.length;
          result.data = result.data.filter(transaction => 
            !existingInvoiceNumbers.has(transaction.invoiceId)
          );
          
          const duplicateCount = originalCount - result.data.length;
          if (duplicateCount > 0) {
            console.warn(`Filtered out ${duplicateCount} duplicate records`);
            toast.warning(`Found ${duplicateCount} duplicate invoice(s). Only new records will be uploaded.`);
            setTimeoutWarnings(prev => [...prev, `${duplicateCount} duplicate records filtered out`]);
          }
        }
      }
      
      if (result.data.length === 0) {
        console.warn('No new records to upload after duplicate filtering');
        throw new Error("All records already exist in the database. No new data to upload.");
      }
      
      console.log(`${result.data.length} new records ready for upload`);
      setProgress(50);
      
      // Validate total transaction size
      if (result.data.length > 500) {
        console.warn(`⚠️ Large dataset detected: ${result.data.length} records. This may cause performance issues.`);
        toast.warning(`Large dataset detected (${result.data.length} records). Processing may take longer than usual.`);
        setTimeoutWarnings(prev => [...prev, `Large dataset warning: ${result.data.length} records`]);
      }
      
      // Batch insert to Supabase
      let inserted = 0;
      const totalRecords = result.data.length;
      
      // Adjust batch size based on total records to prevent issues
      let batchSize = 20; // Default batch size
      if (totalRecords > 200) {
        batchSize = 10; // Smaller batches for large datasets
        console.log(`Reducing batch size to ${batchSize} due to large dataset (${totalRecords} records)`);  
      }
      
      const batches = [];
      
      // Create batches
      for (let i = 0; i < result.data.length; i += batchSize) {
        batches.push(result.data.slice(i, i + batchSize));
      }
      
      console.log(`Created ${batches.length} batches for insertion`);
      
      // Process each batch with timeout detection and cancellation support
      console.log('Beginning batch processing of records');
      for (let i = 0; i < batches.length; i++) {
        // Check if operation has been cancelled
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🛑 Upload operation was cancelled, stopping batch processing');
          throw new Error('Upload operation cancelled by user');
        }
        
        const batch = batches[i];
        console.log(`Processing batch ${i+1} of ${batches.length} (${batch.length} records)`);
        
        // Update progress
        const progressPercent = Math.floor(50 + ((i / batches.length) * 50));
        setProgress(progressPercent);
        
        console.time(`batch-${i+1}-insert`);
        
        // Log the first and last record in each batch for debugging
        if (batch.length > 0) {
          console.log(`Batch ${i+1} first record:`, JSON.stringify(batch[0]));
          if (batch.length > 1) {
            console.log(`Batch ${i+1} last record:`, JSON.stringify(batch[batch.length - 1]));
          }
        }
        
        console.log(`Starting database insert for batch ${i+1}`);
        console.time(`batch-${i+1}-insert`);
        
        // Set timeout detection for this batch
        const batchTimeout = setTimeout(() => {
          console.warn(`⚠️ TIMEOUT WARNING: Batch ${i+1} insertion taking longer than expected (20s)`);
          setTimeoutWarnings(prev => [...prev, `Batch ${i+1} insertion exceeded 20s`]);
          // Log network activity to help diagnose the issue
          console.log(`Potential hang detected in batch ${i+1}. Network activity should be checked.`);
        }, 20000); // 20 second timeout for each batch insertion
        
        // Add network request monitoring
        console.log(`🌐 Network: Starting request for batch ${i+1} with ${batch.length} records`);
        const requestStartTime = performance.now();
        
        // Create a secondary timeout to check if the request is still in progress
        const networkCheckTimeout = setTimeout(() => {
          console.warn(`⚠️ NETWORK WARNING: Batch ${i+1} network request still in progress after 10s`);
          console.log(`🌐 Network: Request for batch ${i+1} has been running for 10+ seconds without response`);
          setTimeoutWarnings(prev => [...prev, `Network request for batch ${i+1} exceeded 10s without response`]);
        }, 10000); // Check network status after 10 seconds
        
        // Convert batch data to match finance_invoices table schema
        const invoiceBatch = batch.map(transaction => ({
          client_name: transaction.client,
          invoice_number: transaction.invoiceId,
          date_issued: transaction.date,
          invoice_status: transaction.status,
          date_paid: transaction.datePaid || null,
          item_name: transaction.description || 'Service',
          item_description: transaction.description,
          rate: transaction.rate,
          quantity: transaction.quantity,
          discount_percentage: transaction.discountPercentage || 0,
          line_subtotal: transaction.lineSubtotal || (transaction.rate * transaction.quantity),
          tax_1_type: transaction.tax1Type || null,
          tax_1_amount: transaction.tax1Amount || 0,
          tax_2_type: transaction.tax2Type || null,
          tax_2_amount: transaction.tax2Amount || 0,
          line_total: transaction.amount,
          currency: transaction.currency || 'USD'
        }));

        // Create the transactions in the database with connection error handling
        let insertedData;
        let supabaseError;
        
        try {
          // Wrap the Supabase call in a try-catch to handle network/connection errors
          const response = await Promise.race([
            supabase
              .from("finance_invoices")
              .insert(invoiceBatch)
              .select(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Supabase connection timeout')), 30000)
            )
          ]) as { data: any, error: any };
          
          insertedData = response.data;
          supabaseError = response.error;
        } catch (connectionError) {
          console.error(`❌ CONNECTION ERROR in batch ${i+1}:`, connectionError);
          console.error('Connection details:', {
            timestamp: new Date().toISOString(),
            batchSize: batch.length,
            batchIndex: i
          });
          
          // Add specific error handling for connection timeout
          if (connectionError instanceof Error && connectionError.message === 'Supabase connection timeout') {
            setTimeoutWarnings(prev => [...prev, `Batch ${i+1} connection timed out after 30s`]);
            toast.error(`Network issue detected. Connection timed out for batch ${i+1}.`);
            throw new Error(`Connection timeout for batch ${i+1}. Please check your network connection and try again.`);
          } else {
            setTimeoutWarnings(prev => [...prev, `Batch ${i+1} connection error: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}`]);
            throw connectionError;
          }
        }
        
        // Clear the network check timeout since we got a response
        clearTimeout(networkCheckTimeout);
        
        // Log network request completion time
        const requestEndTime = performance.now();
        const requestDuration = requestEndTime - requestStartTime;
        console.log(`🌐 Network: Completed request for batch ${i+1} in ${requestDuration.toFixed(2)}ms`);
        
        // If the request took longer than 5 seconds, log a warning
        if (requestDuration > 5000) {
          console.warn(`⚠️ NETWORK SLOW: Batch ${i+1} took ${(requestDuration/1000).toFixed(2)}s to complete`);
          setTimeoutWarnings(prev => [...prev, `Batch ${i+1} network request was slow (${(requestDuration/1000).toFixed(2)}s)`]);
        }
          
        clearTimeout(batchTimeout);
        console.timeEnd(`batch-${i+1}-insert`);
        
        if (supabaseError) {
          console.error('Supabase error during batch insert:', supabaseError);
          console.error('Error details:', JSON.stringify(supabaseError));
          throw new Error(`Database error: ${supabaseError.message}`);
        }
        
        // Log inserted data count vs batch size to verify all records were inserted
        const insertedCount = insertedData ? insertedData.length : batch.length;
        console.log(`Batch ${i+1} insertion complete. Expected: ${batch.length}, Confirmed: ${insertedCount}`);
        
        if (insertedData && insertedData.length !== batch.length) {
          console.warn(`Batch ${i+1} insertion count mismatch! Expected ${batch.length} but got ${insertedData.length}`);
        }
        
        inserted += batch.length;
        const newProgress = 50 + Math.floor((inserted / totalRecords) * 50);
        console.log(`Inserted ${inserted}/${totalRecords} records, progress: ${newProgress}%`);
        setProgress(newProgress);
      }
      
      // Clear the overall timeout since we're done
      clearTimeout(overallTimeout);
      
      console.log('Finance transaction upload completed successfully');
      if (timeoutWarnings.length > 0) {
        console.warn('Upload completed with timeout warnings:', timeoutWarnings);
      }
      
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

  return { upload, generateTemplate, cancelUpload, loading, progress, error, uploadedCount, timeoutWarnings };
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
 * Hook for fetching finance transactions by description or client
 * @param searchTerm Search term to filter by
 * @returns Object containing transactions data, loading state, error state, and refetch function
 */
export const useFinanceTransactionsBySearchTerm = (searchTerm: string) => {
  const [transactions, setTransactions] = useState<FrontendFinanceTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!searchTerm) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search in both description and client fields
      const { data, error: supabaseError } = await supabase
        .from("finance_transactions")
        .select("*")
        .or(`description.ilike.%${searchTerm}%,client.ilike.%${searchTerm}%`)
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
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
};
