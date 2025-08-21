/**
 * Batch processing utilities for large Excel uploads
 */

import { supabase } from '@/integration/supabase/client';
import { FinanceInvoiceData, mapToFinanceInvoice } from './DataMapper';
import { invalidateFinanceCache } from '@/hooks/finance/useFinanceAnalytics';

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

    for (let i = 0; i < jsonData.length; i += this.batchSize) {
      const batch = jsonData.slice(i, i + this.batchSize);
      
      // Convert batch data to match finance_invoices table schema
      const invoiceBatch: FinanceInvoiceData[] = batch.map(mapToFinanceInvoice);
      
      // Process all rows including those with duplicate invoice numbers
      // This supports batch invoicing where multiple line items can share the same invoice number

      // Use INSERT instead of UPSERT to allow multiple rows with the same invoice number
      // This supports batch invoicing where multiple line items can share the same invoice number
      const { data, error: upsertError } = await supabase
        .from('finance_invoices')
        .insert(invoiceBatch)
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
    
    // Invalidate finance analytics cache to refresh dashboard data
    try {
      invalidateFinanceCache();
      console.log('Finance analytics cache invalidated successfully');
    } catch (error) {
      console.warn('Could not invalidate finance cache:', error);
    }
    
    return processed;
  }
}
