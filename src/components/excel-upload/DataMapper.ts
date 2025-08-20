/**
 * Data mapping utilities for Excel upload processing
 */

import { convertExcelDate } from './ExcelDateConverter';

export interface FinanceInvoiceData {
  client_name: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: string;
  date_paid: string | null;
  item_name: string;
  item_description: string;
  rate: number;
  quantity: number;
  discount_percentage: number;
  line_subtotal: number;
  tax_1_type: string | null;
  tax_1_amount: number;
  tax_2_type: string | null;
  tax_2_amount: number;
  line_total: number;
  currency: string;
}

/**
 * Valid invoice status values as defined in the database enum
 */
const VALID_INVOICE_STATUSES = ['paid', 'pending', 'overdue', 'cancelled', 'sent'] as const;

/**
 * Maps common invoice status variations to valid enum values
 */
const normalizeInvoiceStatus = (status: string): string => {
  const normalized = status.toLowerCase().trim();
  
  // Direct matches
  if (VALID_INVOICE_STATUSES.includes(normalized as any)) {
    return normalized;
  }
  
  // Common variations mapping
  const statusMappings: Record<string, string> = {
    'draft': 'pending',
    'unpaid': 'pending',
    'open': 'pending',
    'due': 'pending',
    'late': 'overdue',
    'past due': 'overdue',
    'pastdue': 'overdue',
    'void': 'cancelled',
    'canceled': 'cancelled',
    'complete': 'paid',
    'completed': 'paid',
    'settled': 'paid',
    'closed': 'paid'
  };
  
  return statusMappings[normalized] || 'pending';
};

/**
 * Maps raw Excel row data to finance invoice schema
 */
export const mapToFinanceInvoice = (row: any): FinanceInvoiceData => {
  return {
    client_name: row['Client Name'] || row.client_name || 'Unknown Client',
    invoice_number: row['Invoice #'] || row.invoice_number || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date_issued: convertExcelDate(row['Date'] || row.date_issued) || new Date().toISOString().split('T')[0],
    invoice_status: normalizeInvoiceStatus(row['Invoice Status'] || row.invoice_status || 'pending'),
    date_paid: convertExcelDate(row['Date Paid'] || row.date_paid),
    item_name: row['Item Description'] || row.item_name || 'Service',
    item_description: row['Item Description'] || row.item_description || 'Service provided',
    rate: parseFloat(row['Rate'] || row.rate || 0) || 0.01, // Ensure non-zero value for NOT NULL constraint
    quantity: parseInt(row['Quantity'] || row.quantity || 1) || 1, // Ensure non-zero value for NOT NULL constraint
    discount_percentage: parseFloat(row['Discount Percentage'] || row.discount_percentage || 0),
    line_subtotal: parseFloat(row['Line Subtotal'] || row.line_subtotal || 0) || 0.01, // Ensure non-zero value for NOT NULL constraint
    tax_1_type: row['Tax 1 Type'] || row.tax_1_type || null,
    tax_1_amount: parseFloat(row['Tax 1 Amount'] || row.tax_1_amount || 0),
    tax_2_type: row['Tax 2 Type'] || row.tax_2_type || null,
    tax_2_amount: parseFloat(row['Tax 2 Amount'] || row.tax_2_amount || 0),
    line_total: parseFloat(row['Line Total'] || row.line_total || 0) || 0.01, // Ensure non-zero value for NOT NULL constraint
    currency: row['Currency'] || row.currency || 'USD'
  };
};
