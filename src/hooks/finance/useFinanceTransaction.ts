import { useState, useRef } from 'react';
import { supabase } from '@/integration/supabase/client';

// Hook for uploading finance transactions from CSV files

export interface FrontendFinanceTransaction {
  id?: string;
  client_name: string;
  company_account?: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  date_paid?: string;
  item_description: string;
  rate: number;
  quantity: number;
  discount_percentage?: number;
  line_subtotal: number;
  tax_1_type?: string;
  tax_1_amount?: number;
  tax_2_type?: string;
  tax_2_amount?: number;
  line_total: number;
  currency: string;
}

export function useUploadFinanceTransactions() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [timeoutWarnings, setTimeoutWarnings] = useState<string[]>([]);
  const cancelRef = useRef(false);

  const generateTemplate = async (): Promise<Blob> => {
    // Create a simple CSV template
    const csvContent = [
      'Client Name,Company Account,Invoice #,Date,Invoice Status,Date Paid,Item Description,Rate,Quantity,Discount Percentage,Line Subtotal,Tax 1 Type,Tax 1 Amount,Tax 2 Type,Tax 2 Amount,Line Total,Currency',
      'Example Client Corp,ACC-001,INV-2024-001,2024-01-15,paid,2024-01-20,Consulting Services,150.00,8,0,1200.00,GST,120.00,,0,1320.00,USD'
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  };

  const parseCSVFile = async (file: File): Promise<FrontendFinanceTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('File must contain at least a header row and one data row'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const rows = lines.slice(1).map(line => {
            // Simple CSV parsing - handle quoted values
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          });
          
          const transactions: FrontendFinanceTransaction[] = rows
            .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
            .map((row, index) => {
              try {
                const transaction: FrontendFinanceTransaction = {
                  client_name: String(row[headers.indexOf('Client Name')] || '').trim(),
                  company_account: String(row[headers.indexOf('Company Account')] || '').trim() || undefined,
                  invoice_number: String(row[headers.indexOf('Invoice #')] || '').trim(),
                  date_issued: String(row[headers.indexOf('Date')] || '').trim(),
                  invoice_status: (String(row[headers.indexOf('Invoice Status')] || 'pending').toLowerCase() as any),
                  date_paid: String(row[headers.indexOf('Date Paid')] || '').trim() || undefined,
                  item_description: String(row[headers.indexOf('Item Description')] || '').trim(),
                  rate: Number(row[headers.indexOf('Rate')] || 0),
                  quantity: Number(row[headers.indexOf('Quantity')] || 1),
                  discount_percentage: Number(row[headers.indexOf('Discount Percentage')] || 0),
                  line_subtotal: Number(row[headers.indexOf('Line Subtotal')] || 0),
                  tax_1_type: String(row[headers.indexOf('Tax 1 Type')] || '').trim() || undefined,
                  tax_1_amount: Number(row[headers.indexOf('Tax 1 Amount')] || 0),
                  tax_2_type: String(row[headers.indexOf('Tax 2 Type')] || '').trim() || undefined,
                  tax_2_amount: Number(row[headers.indexOf('Tax 2 Amount')] || 0),
                  line_total: Number(row[headers.indexOf('Line Total')] || 0),
                  currency: String(row[headers.indexOf('Currency')] || 'USD').trim(),
                };

                // Validate required fields
                if (!transaction.client_name || !transaction.invoice_number || !transaction.date_issued) {
                  throw new Error(`Row ${index + 2}: Missing required fields (Client Name, Invoice #, or Date)`);
                }

                // Validate invoice status
                if (!['pending', 'paid', 'overdue', 'cancelled'].includes(transaction.invoice_status)) {
                  transaction.invoice_status = 'pending';
                }

                return transaction;
              } catch (err) {
                throw new Error(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Invalid data format'}`);
              }
            });

          resolve(transactions);
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const upload = async (file: File): Promise<number> => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setTimeoutWarnings([]);
    cancelRef.current = false;

    try {
      console.log('Starting file upload process...');
      
      // Parse the CSV file
      setProgress(10);
      const transactions = await parseCSVFile(file);
      console.log(`Parsed ${transactions.length} transactions from file`);
      
      if (cancelRef.current) {
        throw new Error('Upload cancelled by user');
      }

      setProgress(30);

      // Check for existing invoice numbers to prevent duplicates
      const invoiceNumbers = transactions.map(t => t.invoice_number);
      const { data: existingInvoices } = await supabase
        .from('finance_invoices' as any)
        .select('invoice_number')
        .in('invoice_number', invoiceNumbers);

      const existingNumbers = new Set(existingInvoices?.map((inv: any) => inv.invoice_number) || []);
      const newTransactions = transactions.filter(t => !existingNumbers.has(t.invoice_number));
      
      if (existingNumbers.size > 0) {
        const duplicateCount = transactions.length - newTransactions.length;
        setTimeoutWarnings(prev => [...prev, `Filtered out ${duplicateCount} duplicate invoice(s)`]);
      }

      if (newTransactions.length === 0) {
        throw new Error('No new transactions to upload (all invoices already exist)');
      }

      setProgress(50);

      // Upload in batches to avoid timeout
      const batchSize = 100;
      let uploadedCount = 0;
      
      for (let i = 0; i < newTransactions.length; i += batchSize) {
        if (cancelRef.current) {
          throw new Error('Upload cancelled by user');
        }

        const batch = newTransactions.slice(i, i + batchSize);
        console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newTransactions.length / batchSize)}`);
        
        const startTime = Date.now();
        const { error: batchError } = await supabase
          .from('finance_invoices' as any)
          .insert(batch.map(transaction => ({
            client_name: transaction.client_name,
            invoice_number: transaction.invoice_number,
            date_issued: transaction.date_issued,
            invoice_status: transaction.invoice_status,
            date_paid: transaction.date_paid || null,
            item_name: transaction.item_description,
            item_description: transaction.item_description,
            rate: transaction.rate,
            quantity: transaction.quantity,
            discount_percentage: transaction.discount_percentage || 0,
            line_subtotal: transaction.line_subtotal,
            tax_1_type: transaction.tax_1_type || null,
            tax_1_amount: transaction.tax_1_amount || 0,
            tax_2_type: transaction.tax_2_type || null,
            tax_2_amount: transaction.tax_2_amount || 0,
            line_total: transaction.line_total,
            currency: transaction.currency,
            company_account_id: null, // We don't have this mapping yet
          })) as any);

        const batchTime = Date.now() - startTime;
        if (batchTime > 10000) { // 10 seconds
          setTimeoutWarnings(prev => [...prev, `Batch ${Math.floor(i / batchSize) + 1} took ${Math.round(batchTime / 1000)}s (slower than expected)`]);
        }

        if (batchError) {
          console.error('Batch upload error:', batchError);
          throw new Error(`Failed to upload batch: ${batchError.message}`);
        }

        uploadedCount += batch.length;
        const progressPercent = 50 + Math.round((uploadedCount / newTransactions.length) * 50);
        setProgress(progressPercent);
      }

      setProgress(100);
      console.log(`Successfully uploaded ${uploadedCount} transactions`);
      return uploadedCount;

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelUpload = () => {
    cancelRef.current = true;
    setLoading(false);
    setProgress(0);
    setError('Upload cancelled by user');
  };

  return {
    upload,
    generateTemplate,
    cancelUpload,
    loading,
    progress,
    error,
    timeoutWarnings,
  };
}
