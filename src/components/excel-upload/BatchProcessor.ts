/**
 * Batch processing utilities for large Excel uploads
 */

import { supabase } from '@/integration/supabase/client';
import { FinanceInvoiceData, mapToFinanceInvoice } from './DataMapper';

export interface BatchProcessorOptions {
  batchSize?: number;
  onProgress?: (processed: number, total: number) => void;
  onBatchComplete?: (batchIndex: number, batchSize: number) => void;
}

export class BatchProcessor {
  private batchSize: number;
  private onProgress?: (processed: number, total: number) => void;
  private onBatchComplete?: (batchIndex: number, batchSize: number) => void;

  constructor(options: BatchProcessorOptions = {}) {
    this.batchSize = options.batchSize || 100;
    this.onProgress = options.onProgress;
    this.onBatchComplete = options.onBatchComplete;
  }

  async processFinanceData(jsonData: any[]): Promise<number> {
    let processed = 0;
    let updated = 0;
    let inserted = 0;
    const totalRecords = jsonData.length;
    
    // Track processed invoice numbers to avoid duplicates within the entire dataset
    const processedInvoiceNumbers = new Set<string>();

    for (let i = 0; i < jsonData.length; i += this.batchSize) {
      const batch = jsonData.slice(i, i + this.batchSize);
      
      // Convert batch data to match finance_invoices table schema
      const rawInvoiceBatch: FinanceInvoiceData[] = batch.map(mapToFinanceInvoice);
      
      // Handle duplicates within the same batch by keeping only the first occurrence of each invoice number
      const invoiceMap = new Map<string, FinanceInvoiceData>();
      const invoiceBatch: FinanceInvoiceData[] = [];
      
      for (const invoice of rawInvoiceBatch) {
        const invoiceNumber = invoice.invoice_number;
        
        // Skip if we've already processed this invoice number in a previous batch
        if (processedInvoiceNumbers.has(invoiceNumber)) {
          console.log(`Skipping duplicate invoice number across batches: ${invoiceNumber}`);
          continue;
        }
        
        // For duplicates within the same batch, keep only the first occurrence
        if (!invoiceMap.has(invoiceNumber)) {
          invoiceMap.set(invoiceNumber, invoice);
          invoiceBatch.push(invoice);
          processedInvoiceNumbers.add(invoiceNumber);
        } else {
          console.log(`Skipping duplicate invoice number within batch: ${invoiceNumber}`);
        }
      }
      
      // Skip empty batches (could happen if all were duplicates)
      if (invoiceBatch.length === 0) {
        console.log(`Batch ${Math.floor(i/this.batchSize) + 1} has no unique invoices, skipping`);
        continue;
      }

      // Use UPSERT to handle duplicates with existing database records
      const { data, error: upsertError } = await supabase
        .from('finance_invoices')
        .upsert(invoiceBatch, { 
          onConflict: 'invoice_number',
          ignoreDuplicates: false 
        })
        .select('id');

      if (upsertError) {
        console.error(`Error upserting batch ${Math.floor(i/this.batchSize) + 1}:`, upsertError);
        throw new Error(`Database error in batch ${Math.floor(i/this.batchSize) + 1}: ${upsertError.message}`);
      }
      
      processed += batch.length;
      
      // Call progress callback
      if (this.onProgress) {
        this.onProgress(processed, totalRecords);
      }
      
      // Call batch complete callback
      if (this.onBatchComplete) {
        this.onBatchComplete(Math.floor(i/this.batchSize) + 1, batch.length);
      }
      
      console.log(`Processed batch ${Math.floor(i/this.batchSize) + 1}: ${batch.length} rows (${processed}/${totalRecords} total) - UPSERT mode`);
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Batch processing complete: ${processed} records processed (updated existing or inserted new)`);
    return processed;
  }
}
