/**
 * Invoice hooks for Supabase integration
 * These hooks provide data fetching and state management for invoice data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendInvoice,
  InvoiceStatus,
} from "@/integration/supabase/types/finance";
import { supabase } from "@/integration/supabase/client";
import { mapDatabaseInvoiceToFrontend } from "@/integration/supabase/types/finance";
import * as ExcelJS from 'exceljs';

/**
 * Hook for fetching all invoices
 * @returns Object containing invoices data, loading state, error state, and refetch function
 */
export const useInvoices = () => {
  const [invoices, setInvoices] = useState<FrontendInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_invoices")
        .select("*")
        .order("date_issued", { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setInvoices(data.map(mapDatabaseInvoiceToFrontend));
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

  return { invoices, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching a single invoice by ID
 * @param id Invoice ID
 * @returns Object containing invoice data, loading state, error state, and refetch function
 */
export const useInvoice = (id: string) => {
  const [invoice, setInvoice] = useState<FrontendInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_invoices")
        .select("*")
        .eq("id", id)
        .single();
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setInvoice(mapDatabaseInvoiceToFrontend(data));
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

  return { invoice, loading, error, refetch: fetchData };
};

/**
 * Hook for creating a new invoice
 * @returns Object containing create function, loading state, and error state
 */
export const useCreateInvoice = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<FrontendInvoice | null>(null);

  const create = useCallback(
    async (invoiceData: Omit<FrontendInvoice, "id">) => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert frontend data to database format
        const dbInvoiceData = {
          client_name: invoiceData.clientName,
          invoice_number: invoiceData.invoiceNumber,
          date_issued: invoiceData.dateIssued,
          invoice_status: invoiceData.invoiceStatus,
          date_paid: invoiceData.datePaid,
          item_name: invoiceData.itemName,
          item_description: invoiceData.itemDescription,
          rate: invoiceData.rate,
          quantity: invoiceData.quantity,
          discount_percentage: invoiceData.discountPercentage,
          line_subtotal: invoiceData.lineSubtotal,
          tax_1_type: invoiceData.tax1Type,
          tax_1_amount: invoiceData.tax1Amount,
          tax_2_type: invoiceData.tax2Type,
          tax_2_amount: invoiceData.tax2Amount,
          line_total: invoiceData.lineTotal,
          currency: invoiceData.currency
        };
        
        const { data: newInvoice, error: supabaseError } = await (supabase
          .from("finance_invoices") as any)
          .insert(dbInvoiceData)
          .select()
          .single();
        
        if (supabaseError) throw new Error(supabaseError.message);
        
        const newInvoiceMapped = mapDatabaseInvoiceToFrontend(newInvoice);
        setCreatedInvoice(newInvoiceMapped);
        return newInvoiceMapped;
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

  return { create, loading, error, createdInvoice };
};

/**
 * Hook for updating an invoice
 * @returns Object containing update function, loading state, and error state
 */
export const useUpdateInvoice = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedInvoice, setUpdatedInvoice] = useState<FrontendInvoice | null>(null);

  const update = useCallback(
    async (
      id: string,
      invoiceData: Partial<Omit<FrontendInvoice, "id">>
    ) => {
      try {
        setLoading(true);
        setError(null);
        
        const updateData: Record<string, any> = {};
        
        if (invoiceData.clientName !== undefined) updateData.client_name = invoiceData.clientName;
        if (invoiceData.invoiceNumber !== undefined) updateData.invoice_number = invoiceData.invoiceNumber;
        if (invoiceData.dateIssued !== undefined) updateData.date_issued = invoiceData.dateIssued;
        if (invoiceData.invoiceStatus !== undefined) updateData.invoice_status = invoiceData.invoiceStatus;
        if (invoiceData.datePaid !== undefined) updateData.date_paid = invoiceData.datePaid;
        if (invoiceData.itemName !== undefined) updateData.item_name = invoiceData.itemName;
        if (invoiceData.itemDescription !== undefined) updateData.item_description = invoiceData.itemDescription;
        if (invoiceData.rate !== undefined) updateData.rate = invoiceData.rate;
        if (invoiceData.quantity !== undefined) updateData.quantity = invoiceData.quantity;
        if (invoiceData.discountPercentage !== undefined) updateData.discount_percentage = invoiceData.discountPercentage;
        if (invoiceData.lineSubtotal !== undefined) updateData.line_subtotal = invoiceData.lineSubtotal;
        if (invoiceData.tax1Type !== undefined) updateData.tax_1_type = invoiceData.tax1Type;
        if (invoiceData.tax1Amount !== undefined) updateData.tax_1_amount = invoiceData.tax1Amount;
        if (invoiceData.tax2Type !== undefined) updateData.tax_2_type = invoiceData.tax2Type;
        if (invoiceData.tax2Amount !== undefined) updateData.tax_2_amount = invoiceData.tax2Amount;
        if (invoiceData.lineTotal !== undefined) updateData.line_total = invoiceData.lineTotal;
        if (invoiceData.currency !== undefined) updateData.currency = invoiceData.currency;
        
        const { data: updatedInvoice, error: supabaseError } = await (supabase
          .from("finance_invoices") as any)
          .update(updateData)
          .eq("id", id)
          .select()
          .single();
        
        if (supabaseError) throw new Error(supabaseError.message);
        
        const updatedInvoiceMapped = mapDatabaseInvoiceToFrontend(updatedInvoice);
        setUpdatedInvoice(updatedInvoiceMapped);
        return updatedInvoiceMapped;
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

  return { update, loading, error, updatedInvoice };
};

/**
 * Hook for deleting an invoice
 * @returns Object containing delete function, loading state, and error state
 */
export const useDeleteInvoice = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: supabaseError } = await supabase
        .from("finance_invoices")
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

  return { deleteInvoice, loading, error, isDeleted };
};

/**
 * Hook for fetching invoices by status
 * @param status Invoice status to filter by
 * @returns Object containing invoices data, loading state, error state, and refetch function
 */
export const useInvoicesByStatus = (status: InvoiceStatus) => {
  const [invoices, setInvoices] = useState<FrontendInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_invoices")
        .select("*")
        .eq("invoice_status", status)
        .order("date_issued", { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setInvoices(data.map(mapDatabaseInvoiceToFrontend));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { invoices, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching invoices by client name
 * @param clientName Client name to filter by
 * @returns Object containing invoices data, loading state, error state, and refetch function
 */
export const useInvoicesByClient = (clientName: string) => {
  const [invoices, setInvoices] = useState<FrontendInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!clientName) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("finance_invoices")
        .select("*")
        .ilike("client_name", `%${clientName}%`)
        .order("date_issued", { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setInvoices(data.map(mapDatabaseInvoiceToFrontend));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [clientName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { invoices, loading, error, refetch: fetchData };
};

/**
 * Hook for uploading finance transaction data from Excel
 * @returns Object containing upload function, loading state, and error state
 */
export const useUploadInvoices = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number>(0);

  /**
   * Expected Excel column structure based on the template from screenshot:
   * - Transaction ID
   * - Amount
   * - Account
   * - Client
   * - Payment Method
   * - Date
   * - Category
   * - Description
   * - Invoice ID
   * - Status
   */
  // Helper function to parse Excel date (which is stored as a number) to a string date
  const parseExcelDate = (excelDate: number | string): string => {
    if (typeof excelDate === 'string') {
      return excelDate; // Already a string date
    }
    
    // Excel dates are stored as days since 1900-01-01
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Helper function to validate transaction status
  const validateTransactionStatus = (status: string): string => {
    const validStatuses = ['Pending', 'Completed', 'Failed'];
    
    if (validStatuses.includes(status)) {
      return status;
    }
    return 'Pending'; // Default status
  };

  // Convert Excel row to FrontendFinanceTransaction format
  const convertExcelRowToTransaction = (row: any): any => {
    // Map Excel columns to our data model based on the format from the screenshot
    return {
      // Direct mappings from Excel columns to our data model
      transaction_id: row['Transaction ID'] || '',
      amount: parseFloat(row['Amount']) || 0,
      account: row['Account'] || '',
      client: row['Client'] || '',
      payment_method: row['Payment Method'] || '',
      date: typeof row['Date'] === 'number' 
        ? parseExcelDate(row['Date']) 
        : row['Date'] || '',
      category: row['Category'] || '',
      description: row['Description'] || '',
      invoice_id: row['Invoice ID'] || '',
      status: validateTransactionStatus(row['Status'] || 'Pending')
    };
  };

  const upload = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      // Read the Excel file
      const fileData = await file.arrayBuffer();
      setProgress(10);
      
      // Parse the Excel data using ExcelJS
      const { data: jsonData } = await import('@/utils/excelJSHelper').then(async (module) => {
        return await module.readExcelFile(fileData);
      });
      setProgress(30);
      setProgress(40);
      
      // Check if the file has headers
      if (jsonData.length === 0) {
        throw new Error('The Excel file is empty');
      }
      
      // Extract headers from the first row
      const headers = Object.values(jsonData[0]);
      
      // Expected headers from the template based on the screenshot
      const expectedHeaders = [
        "Transaction ID",
        "Amount",
        "Account",
        "Client",
        "Payment Method",
        "Date",
        "Category",
        "Description",
        "Invoice ID",
        "Status"
      ];
      
      // Validate headers
      const missingHeaders = expectedHeaders.filter(
        header => !headers.includes(header)
      );
      
      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required columns: ${missingHeaders.join(", ")}. Please use the template provided.`
        );
      }
      
      // Convert headers to object keys for each row
      const rowsWithHeaders = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowWithHeaders: Record<string, any> = {};
        
        // Map A, B, C... to actual header names
        Object.keys(row).forEach((key, index) => {
          const headerName = headers[index];
          if (typeof headerName === 'string') {
            rowWithHeaders[headerName] = row[key];
          }
        });
        
        rowsWithHeaders.push(rowWithHeaders);
      }
      
      setProgress(50);
      
      // Convert Excel rows to transaction objects
      const transactions = rowsWithHeaders.map(convertExcelRowToTransaction);
      
      // Batch insert to Supabase
      let inserted = 0;
      const totalRecords = transactions.length;
      
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        
        // Create the transaction in the database
        const { error: supabaseError } = await supabase
          .from("finance_transactions")
          .insert(transaction);
          
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        inserted++;
        const newProgress = 50 + Math.floor((inserted / totalRecords) * 50);
        setProgress(newProgress);
      }
      
      setLoading(false);
      setProgress(100);
      setUploadedCount(transactions.length);
      return transactions.length;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
      throw err;
    }
  }, []);

  return { upload, loading, progress, error, uploadedCount };
};
