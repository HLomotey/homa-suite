/**
 * Batch processing utilities for large Excel uploads
 */

import { supabase } from '@/integration/supabase/client';
// Note: Removed admin client import to avoid Multiple GoTrueClient instances warning
import { FinanceInvoiceData, mapToFinanceInvoice, FinanceExpenseData, mapToFinanceExpense } from './DataMapper';

export interface BatchProcessorOptions {
  batchSize?: number;
  onProgress?: (processed: number, total: number) => void;
  onBatchComplete?: (batchIndex: number, batchSize: number) => void;
  mode?: 'insert' | 'upsert'; // new flag to resolve strategy
}

export class BatchProcessor {
  private batchSize: number;
  private onProgress?: (processed: number, total: number) => void;
  private onBatchComplete?: (batchIndex: number, batchSize: number) => void;
  private mode: 'insert' | 'upsert';

  constructor(options: BatchProcessorOptions = {}) {
    this.batchSize = options.batchSize || 100;
    this.onProgress = options.onProgress;
    this.onBatchComplete = options.onBatchComplete;
    this.mode = options.mode || 'upsert';
  }

  async processFinanceExpenseData(jsonData: any[]): Promise<number> {
    let processed = 0;
    const totalRecords = jsonData.length;

    for (let i = 0; i < jsonData.length; i += this.batchSize) {
      const batch = jsonData.slice(i, i + this.batchSize);
      const expenseBatch: FinanceExpenseData[] = batch.map(mapToFinanceExpense);

      const { error: insertError } = await supabase
        .from('finance_expenses')
        .insert(expenseBatch as any)
        .select('id');

      if (insertError) {
        console.error(`Error inserting expense batch ${Math.floor(i / this.batchSize) + 1}:`, insertError);
        throw new Error(`Database error in expense batch ${Math.floor(i / this.batchSize) + 1}: ${insertError.message}`);
      }

      processed += batch.length;
      this.onProgress?.(processed, totalRecords);
      this.onBatchComplete?.(Math.floor(i / this.batchSize) + 1, batch.length);
      console.log(`Processed expense batch ${Math.floor(i / this.batchSize) + 1}: ${batch.length} rows (${processed}/${totalRecords})`);

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
      const invoiceBatch: FinanceInvoiceData[] = batch.map(mapToFinanceInvoice);

      if (this.mode === 'insert') {
        // Pure insert mode
        const { error: insertError } = await supabase
          .from('finance_invoices')
          .insert(invoiceBatch as any)
          .select('id');

        if (insertError) {
          console.error(`Error inserting invoice batch ${Math.floor(i / this.batchSize) + 1}:`, insertError);
          throw new Error(`Database error in invoice batch ${Math.floor(i / this.batchSize) + 1}: ${insertError.message}`);
        }

        inserted += invoiceBatch.length;
        processed += invoiceBatch.length;
      } else {
        // Upsert/update mode
        for (const invoiceData of invoiceBatch) {
          try {
            const { data: existingInvoice, error: selectError } = await supabase
              .from('finance_invoices' as any)
              .select('id, invoice_status, date_paid')
              .eq('invoice_number', invoiceData.invoice_number)
              .eq('client_name', invoiceData.client_name)
              .eq('company_account_id', invoiceData.company_account_id)
              .maybeSingle();

            if (selectError && selectError.code !== 'PGRST116') {
              throw selectError;
            }

            if (existingInvoice) {
              const invoice = existingInvoice as any;
              const shouldUpdate =
                invoice.invoice_status !== invoiceData.invoice_status ||
                invoice.date_paid !== invoiceData.date_paid ||
                (invoiceData.invoice_status === 'paid' && invoice.invoice_status !== 'paid');

              if (shouldUpdate) {
                const updateData = {
                  ...invoiceData,
                  updated_at: new Date().toISOString(),
                };
                const { error: updateError } = await (supabase as any)
                  .from('finance_invoices')
                  .update(updateData)
                  .eq('id', invoice.id);

                if (updateError) {
                  throw updateError;
                }
                updated++;
              }
            } else {
              const { error: insertError } = await supabase
                .from('finance_invoices' as any)
                .insert(invoiceData as any);

              if (insertError) {
                throw insertError;
              }
              inserted++;
            }

            processed++;
          } catch (error) {
            console.error(`Error processing invoice ${invoiceData.invoice_number}:`, error);
            throw new Error(`Failed to process invoice ${invoiceData.invoice_number}: ${error}`);
          }
        }
      }

      this.onProgress?.(processed, totalRecords);
      this.onBatchComplete?.(Math.floor(i / this.batchSize) + 1, batch.length);
      console.log(`Processed invoice batch ${Math.floor(i / this.batchSize) + 1}: ${batch.length} rows (${processed}/${totalRecords})`);

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Invoice batch processing complete: ${processed} processed (${inserted} inserted, ${updated} updated)`);
    return processed;
  }
}
