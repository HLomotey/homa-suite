/**
 * Invoice hooks for Supabase integration
 * These hooks provide data fetching and state management for invoice data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FrontendInvoice,
  InvoiceStatus,
} from "../../integration/supabase/types/finance";
import { supabase } from "../../integration/supabase/client";
import { mapDatabaseInvoiceToFrontend } from "../../integration/supabase/types/finance";

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
        
        const { data, error: supabaseError } = await supabase
          .from("finance_invoices")
          .insert(dbInvoiceData)
          .select()
          .single();
        
        if (supabaseError) throw new Error(supabaseError.message);
        
        const newInvoice = mapDatabaseInvoiceToFrontend(data);
        setCreatedInvoice(newInvoice);
        return newInvoice;
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
        
        // Convert frontend data to database format
        const dbInvoiceData: Record<string, any> = {};
        
        if (invoiceData.clientName !== undefined) dbInvoiceData.client_name = invoiceData.clientName;
        if (invoiceData.invoiceNumber !== undefined) dbInvoiceData.invoice_number = invoiceData.invoiceNumber;
        if (invoiceData.dateIssued !== undefined) dbInvoiceData.date_issued = invoiceData.dateIssued;
        if (invoiceData.invoiceStatus !== undefined) dbInvoiceData.invoice_status = invoiceData.invoiceStatus;
        if (invoiceData.datePaid !== undefined) dbInvoiceData.date_paid = invoiceData.datePaid;
        if (invoiceData.itemName !== undefined) dbInvoiceData.item_name = invoiceData.itemName;
        if (invoiceData.itemDescription !== undefined) dbInvoiceData.item_description = invoiceData.itemDescription;
        if (invoiceData.rate !== undefined) dbInvoiceData.rate = invoiceData.rate;
        if (invoiceData.quantity !== undefined) dbInvoiceData.quantity = invoiceData.quantity;
        if (invoiceData.discountPercentage !== undefined) dbInvoiceData.discount_percentage = invoiceData.discountPercentage;
        if (invoiceData.lineSubtotal !== undefined) dbInvoiceData.line_subtotal = invoiceData.lineSubtotal;
        if (invoiceData.tax1Type !== undefined) dbInvoiceData.tax_1_type = invoiceData.tax1Type;
        if (invoiceData.tax1Amount !== undefined) dbInvoiceData.tax_1_amount = invoiceData.tax1Amount;
        if (invoiceData.tax2Type !== undefined) dbInvoiceData.tax_2_type = invoiceData.tax2Type;
        if (invoiceData.tax2Amount !== undefined) dbInvoiceData.tax_2_amount = invoiceData.tax2Amount;
        if (invoiceData.lineTotal !== undefined) dbInvoiceData.line_total = invoiceData.lineTotal;
        if (invoiceData.currency !== undefined) dbInvoiceData.currency = invoiceData.currency;
        
        const { data, error: supabaseError } = await supabase
          .from("finance_invoices")
          .update(dbInvoiceData)
          .eq("id", id)
          .select()
          .single();
        
        if (supabaseError) throw new Error(supabaseError.message);
        
        const updatedInvoice = mapDatabaseInvoiceToFrontend(data);
        setUpdatedInvoice(updatedInvoice);
        return updatedInvoice;
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
 * Hook for uploading invoice data from Excel
 * @returns Object containing upload function, loading state, and error state
 */
export const useUploadInvoices = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number>(0);

  const upload = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      // In a real implementation, we would use a library like xlsx or exceljs
      // to parse the Excel file and then insert the data into Supabase
      
      // Simulate progress for now
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(Math.min(currentProgress, 90));
        if (currentProgress >= 90) clearInterval(interval);
      }, 300);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success
      clearInterval(interval);
      setProgress(100);
      setUploadedCount(Math.floor(Math.random() * 50) + 10); // Random number between 10-60
      
      return uploadedCount;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [uploadedCount]);

  return { upload, loading, progress, error, uploadedCount };
};
