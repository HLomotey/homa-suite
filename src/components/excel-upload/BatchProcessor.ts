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
    let updated = 0;
    let inserted = 0;
    const totalRecords = jsonData.length;

    for (let i = 0; i < jsonData.length; i += this.batchSize) {
      const batch = jsonData.slice(i, i + this.batchSize);
      
      // Convert batch data to match finance_invoices table schema
      const invoiceBatch: FinanceInvoiceData[] = batch.map(mapToFinanceInvoice);
      
      // Process each invoice individually to handle upserts
      for (const invoiceData of invoiceBatch) {
        try {
          // Check if invoice already exists based on invoice_number, client_name, and company_account_id
          const { data: existingInvoice, error: selectError } = await supabaseAdmin
            .from('finance_invoices' as any)
            .select('id, invoice_status, date_paid')
            .eq('invoice_number', invoiceData.invoice_number)
            .eq('client_name', invoiceData.client_name)
            .eq('company_account_id', invoiceData.company_account_id)
            .single() as { data: any, error: any };

          if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 means no rows found, which is expected for new invoices
            throw selectError;
          }

          if (existingInvoice) {
            // Invoice exists - update it, especially if status changed from unpaid to paid
            const shouldUpdate = 
              existingInvoice.invoice_status !== invoiceData.invoice_status ||
              existingInvoice.date_paid !== invoiceData.date_paid ||
              (invoiceData.invoice_status === 'paid' && existingInvoice.invoice_status !== 'paid');

            if (shouldUpdate) {
              const updateData = {
                ...invoiceData,
                updated_at: new Date().toISOString()
              };
              
              const { error: updateError } = await (supabaseAdmin as any)
                .from('finance_invoices')
                .update(updateData)
                .eq('id', existingInvoice.id);

              if (updateError) {
                console.error(`Error updating invoice ${invoiceData.invoice_number}:`, updateError);
                throw updateError;
              }
              
              updated++;
              console.log(`Updated invoice ${invoiceData.invoice_number} for ${invoiceData.client_name} - Status: ${invoiceData.invoice_status}`);
            } else {
              console.log(`Skipped invoice ${invoiceData.invoice_number} for ${invoiceData.client_name} - No changes needed`);
            }
          } else {
            // Invoice doesn't exist - insert new record
            const { error: insertError } = await supabaseAdmin
              .from('finance_invoices' as any)
              .insert(invoiceData as any);

            if (insertError) {
              console.error(`Error inserting invoice ${invoiceData.invoice_number}:`, insertError);
              throw insertError;
            }
            
            inserted++;
            console.log(`Inserted new invoice ${invoiceData.invoice_number} for ${invoiceData.client_name} - Status: ${invoiceData.invoice_status}`);
          }
          
          processed++;
          
        } catch (error) {
          console.error(`Error processing invoice ${invoiceData.invoice_number}:`, error);
          throw new Error(`Failed to process invoice ${invoiceData.invoice_number}: ${error}`);
        }
      }
      
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
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Invoice batch processing complete: ${processed} records processed (${inserted} inserted, ${updated} updated)`);
    
    return processed;
  }
}
