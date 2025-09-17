/**
 * Data mapping utilities for Excel upload processing
 */

import { convertExcelDate } from './ExcelDateConverter';

export interface FinanceExpenseData {
  Company: string;
  Date: string;
  Type: string;
  Payee: string;
  Category: string;
  Total: number;
}

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
  company_account_id: number | null;
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
    'outstanding': 'pending',
    'awaiting payment': 'pending',
    'late': 'overdue',
    'past due': 'overdue',
    'pastdue': 'overdue',
    'overdue': 'overdue',
    'void': 'cancelled',
    'canceled': 'cancelled',
    'cancelled': 'cancelled',
    'complete': 'paid',
    'completed': 'paid',
    'settled': 'paid',
    'closed': 'paid',
    'payment received': 'paid',
    'fully paid': 'paid'
  };
  
  return statusMappings[normalized] || 'pending';
};

/**
 * Validates and constrains numeric values to database field limits
 */
const validateNumericField = (value: any, min: number = 0, max: number = 999.99): number => {
  const parsed = parseFloat(value || 0);
  if (isNaN(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
};

/**
 * Maps company account names or numbers to integer IDs
 * Company accounts: 1-4 corresponding to the database records
 */
const mapCompanyAccountToId = (companyAccount: any): number | null => {
  if (!companyAccount) return null;
  
  const value = String(companyAccount).trim();
  
  // If it's already a number between 1-4, return it
  const numericValue = parseInt(value);
  if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 4) {
    return numericValue;
  }
  
  // Map company names to IDs based on database records
  const companyNameMappings: Record<string, number> = {
    'BOHCONCEPTS MARYLAND LLC': 1,
    'BOHCONCEPTSNEM LLC': 2,
    'BOHCONCEPTS LLC': 3,
    'BOHCONCEPTS HAWAII LLC': 4,
    // Also support partial matches and variations
    'MARYLAND': 1,
    'NEM': 2,
    'BOHCONCEPTS': 3, // Default to main company if just "BOHCONCEPTS"
    'HAWAII': 4
  };
  
  // Check for exact matches first
  const upperValue = value.toUpperCase();
  if (companyNameMappings[upperValue]) {
    return companyNameMappings[upperValue];
  }
  
  // Check for partial matches
  for (const [key, id] of Object.entries(companyNameMappings)) {
    if (upperValue.includes(key)) {
      return id;
    }
  }
  
  // If no match found, log warning and return null
  console.warn(`Unknown company account: "${value}". Expected integer 1-4 or company name.`);
  return null;
};

/**
 * Maps raw Excel row data to finance expense schema
 */
export const mapToFinanceExpense = (row: any): FinanceExpenseData => {
  return {
    Company: row['Company'] || row.company || 'Unknown Company',
    Date: convertExcelDate(row['Date'] || row.date) || new Date().toISOString().split('T')[0],
    Type: row['Type'] || row.type || 'Expense',
    Payee: row['Payee'] || row.payee || 'Unknown Payee',
    Category: row['Category'] || row.category || 'General',
    Total: Math.max(parseFloat(row['Total'] || row.total || 0) || 0, 0)
  };
};

/**
 * Maps raw Excel row data to finance invoice schema
 */
export const mapToFinanceInvoice = (row: any): FinanceInvoiceData => {
  // Log problematic values for debugging
  const rawDiscount = row['Discount Percentage'] || row.discount_percentage || 0;
  if (parseFloat(rawDiscount) > 999.99) {
    console.warn(`Large discount percentage detected: ${rawDiscount}, capping at 999.99`);
  }

  return {
    client_name: row['Client Name'] || row.client_name || 'Unknown Client',
    invoice_number: row['Invoice #'] || row.invoice_number || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date_issued: convertExcelDate(row['Date'] || row.date_issued) || new Date().toISOString().split('T')[0],
    invoice_status: normalizeInvoiceStatus(row['Invoice Status'] || row.invoice_status || 'pending'),
    date_paid: convertExcelDate(row['Date Paid'] || row.date_paid),
    item_name: row['Item Name'] || row.item_name || 'Service',
    item_description: row['Item Description'] || row.item_description || 'Service provided',
    rate: Math.max(parseFloat(row['Rate'] || row.rate || 0) || 0.01, 0.01), // Ensure non-zero value for NOT NULL constraint
    quantity: Math.max(parseInt(row['Quantity'] || row.quantity || 1) || 1, 1), // Ensure non-zero value for NOT NULL constraint
    discount_percentage: validateNumericField(rawDiscount, 0, 999.99), // Cap at DECIMAL(5,2) limit
    line_subtotal: Math.max(parseFloat(row['Line Subtotal'] || row.line_subtotal || 0) || 0.01, 0.01), // Ensure non-zero value for NOT NULL constraint
    tax_1_type: row['Tax 1 Type'] || row.tax_1_type || null,
    tax_1_amount: validateNumericField(row['Tax 1 Amount'] || row.tax_1_amount || 0, 0, 999999999999.99), // DECIMAL(15,2) limit
    tax_2_type: row['Tax 2 Type'] || row.tax_2_type || null,
    tax_2_amount: validateNumericField(row['Tax 2 Amount'] || row.tax_2_amount || 0, 0, 999999999999.99), // DECIMAL(15,2) limit
    line_total: Math.max(parseFloat(row['Line Total'] || row.line_total || 0) || 0.01, 0.01), // Ensure non-zero value for NOT NULL constraint
    currency: row['Currency'] || row.currency || 'USD',
    company_account_id: mapCompanyAccountToId(row['Company Account'] || row.company_account || row.company_account_id)
  };
};
