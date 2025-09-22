/**
 * Batch processing utilities for large Excel uploads
 */

import { supabase, supabaseAdmin } from '@/integration/supabase/client';
import { FinanceInvoiceData, mapToFinanceInvoice, FinanceExpenseData, mapToFinanceExpense } from './DataMapper';

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

  async processFinanceExpenseData(jsonData: any[]): Promise<number> {
    let processed = 0;
    const totalRecords = jsonData.length;

    for (let i = 0; i < jsonData.length; i += this.batchSize) {
      const batch = jsonData.slice(i, i + this.batchSize);
      
      // Convert batch data to match finance_expenses table schema
      const expenseBatch: FinanceExpenseData[] = batch.map(mapToFinanceExpense);
      
      // Insert expense data into finance_expenses table using admin client to bypass RLS
      const { data, error: insertError } = await supabaseAdmin
        .from('finance_expenses' as any)
        .insert(expenseBatch as any)
        .select('id');

      if (insertError) {
        console.error(`Error inserting expense batch ${Math.floor(i/this.batchSize) + 1}:`, insertError);
        throw new Error(`Database error in expense batch ${Math.floor(i/this.batchSize) + 1}: ${insertError.message}`);
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
      
      console.log(`Processed expense batch ${Math.floor(i/this.batchSize) + 1}: ${batch.length} rows (${processed}/${totalRecords} total)`);
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Expense batch processing complete: ${processed} records processed`);
    
    return processed;
  }

  async processFinanceData(jsonData: any[]): Promise<number> {
    let processed = 0;
    const totalRecords = jsonData.length;

    for (let i = 0; i < jsonData.length; i += this.batchSize) {
      const batch = jsonData.slice(i, i + this.batchSize);
      
      // Convert batch data to match finance_invoices table schema
      const invoiceBatch: FinanceInvoiceData[] = batch.map(mapToFinanceInvoice);
      
      // Use INSERT instead of UPSERT to allow multiple rows with the same invoice number
      const { data, error: insertError } = await supabaseAdmin
        .from('finance_invoices' as any)
        .insert(invoiceBatch as any)
        .select('id');

      if (insertError) {
        console.error(`Error inserting invoice batch ${Math.floor(i/this.batchSize) + 1}:`, insertError);
        throw new Error(`Database error in invoice batch ${Math.floor(i/this.batchSize) + 1}: ${insertError.message}`);
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
      
      console.log(`Processed invoice batch ${Math.floor(i/this.batchSize) + 1}: ${batch.length} rows (${processed}/${totalRecords} total)`);
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Invoice batch processing complete: ${processed} records processed`);
    
    return processed;
  }
}
