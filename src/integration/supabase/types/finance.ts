/**
 * Finance types for Supabase integration
 * These types define the finance structure and related interfaces
 */

import { Json } from './database';

/**
 * Invoice interface representing the finance_invoices table in Supabase
 * Based on the Excel sample data
 */
export interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: InvoiceStatus;
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
  created_at: string;
  updated_at: string | null;
}

/**
 * InvoiceStatus enum
 */
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

/**
 * CompanyAccount interface representing the company_accounts table in Supabase
 */
export interface CompanyAccount {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Transaction interface representing the finance_transactions table in Supabase
 */
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  category: string | null;
  client_id: string | null;
  department_id: number | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * TransactionType enum
 */
export type TransactionType = 'income' | 'expense';

/**
 * TransactionStatus enum
 */
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

/**
 * Budget interface representing the finance_budgets table in Supabase
 */
export interface Budget {
  id: number;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: string;
  fiscal_year: string;
  fiscal_quarter: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * BudgetStatus enum
 */
export type BudgetStatus = 'on-track' | 'warning' | 'critical';

/**
 * RevenueMetric interface representing the finance_revenue_metrics table in Supabase
 */
export interface RevenueMetric {
  id: number;
  month: string;
  revenue: number;
  previous_month_revenue: number;
  growth_percentage: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * ExpenseCategory interface representing the finance_expense_categories table in Supabase
 */
export interface ExpenseCategory {
  id: number;
  name: string;
  percentage: number;
  amount: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * ClientRevenue interface representing the finance_client_revenue table in Supabase
 */
export interface ClientRevenue {
  id: number;
  client_name: string;
  revenue: number;
  percentage: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * FinancialMetric interface representing the finance_metrics table in Supabase
 */
export interface FinancialMetric {
  id: number;
  name: string;
  value: number;
  previous_value: number;
  change_percentage: number;
  period: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * CashFlow interface representing the finance_cash_flow table in Supabase
 */
export interface CashFlow {
  id: number;
  week: string;
  inflow: number;
  outflow: number;
  net_flow: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * RevenueProfitData interface representing the finance_revenue_profit table in Supabase
 */
export interface RevenueProfitData {
  id: number;
  month: string;
  revenue: number;
  profit: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend invoice type that matches the structure in FinanceInvoices.tsx
 */
export interface FrontendInvoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  dateIssued: string;
  invoiceStatus: InvoiceStatus;
  datePaid: string | null;
  itemName: string;
  itemDescription: string;
  rate: number;
  quantity: number;
  discountPercentage: number;
  lineSubtotal: number;
  tax1Type: string | null;
  tax1Amount: number;
  tax2Type: string | null;
  tax2Amount: number;
  lineTotal: number;
  currency: string;
  companyAccountId: number | null;
  companyAccountName?: string;
}

/**
 * Frontend transaction type that matches the structure in FinanceTransactions.tsx
 */
export interface FrontendTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  category?: string;
  clientId?: string;
  departmentId?: number;
}

/**
 * Finance transaction interface for the invoice line item Excel upload format
 */
export interface FinanceTransaction {
  id: string;
  client: string;
  invoice_id: string;
  date: string;
  status: string;
  date_paid?: string;
  description: string;
  rate: number;
  quantity: number;
  discount_percentage?: number;
  line_subtotal?: number;
  tax_1_type?: string;
  tax_1_amount?: number;
  tax_2_type?: string;
  tax_2_amount?: number;
  amount: number; // Line Total
  currency?: string;
  company_account_name?: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend finance transaction type that matches the invoice line item Excel upload format
 */
export interface FrontendFinanceTransaction {
  id: string;
  client: string;
  invoiceId: string;
  date: string;
  status: string;
  datePaid?: string;
  description: string;
  rate: number;
  quantity: number;
  discountPercentage?: number;
  lineSubtotal?: number;
  tax1Type?: string;
  tax1Amount?: number;
  tax2Type?: string;
  tax2Amount?: number;
  amount: number; // Line Total
  currency?: string;
  companyAccountName?: string;
}

/**
 * Frontend budget type that matches the structure in FinanceBudgeting.tsx
 */
export interface FrontendBudget {
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: BudgetStatus;
  fiscalYear?: string;
  fiscalQuarter?: string;
}

/**
 * Frontend revenue metric type
 */
export interface FrontendRevenueMetric {
  id: number;
  month: string;
  revenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
}

/**
 * Frontend expense category type
 */
export interface FrontendExpenseCategory {
  id: number;
  name: string;
  percentage: number;
  amount: number;
}

/**
 * Frontend client revenue type
 */
export interface FrontendClientRevenue {
  id: number;
  clientName: string;
  revenue: number;
  percentage: number;
}

/**
 * Frontend financial metric type
 */
export interface FrontendFinancialMetric {
  id: number;
  name: string;
  value: number;
  previousValue: number;
  changePercentage: number;
  period: string;
}

/**
 * Frontend cash flow type
 */
export interface FrontendCashFlow {
  id: number;
  week: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

/**
 * Frontend revenue profit data type
 */
export interface FrontendRevenueProfitData {
  id: number;
  month: string;
  revenue: number;
  profit: number;
}

/**
 * Maps a database invoice to the frontend invoice format
 */
export const mapDatabaseInvoiceToFrontend = (dbInvoice: Invoice): FrontendInvoice => {
  return {
    id: dbInvoice.id,
    clientName: dbInvoice.client_name,
    invoiceNumber: dbInvoice.invoice_number,
    dateIssued: dbInvoice.date_issued,
    invoiceStatus: dbInvoice.invoice_status,
    datePaid: dbInvoice.date_paid,
    itemName: dbInvoice.item_name,
    itemDescription: dbInvoice.item_description,
    rate: dbInvoice.rate,
    quantity: dbInvoice.quantity,
    discountPercentage: dbInvoice.discount_percentage,
    lineSubtotal: dbInvoice.line_subtotal,
    tax1Type: dbInvoice.tax_1_type,
    tax1Amount: dbInvoice.tax_1_amount,
    tax2Type: dbInvoice.tax_2_type,
    tax2Amount: dbInvoice.tax_2_amount,
    lineTotal: dbInvoice.line_total,
    currency: dbInvoice.currency,
    companyAccountId: dbInvoice.company_account_id
  };
};

/**
 * Maps a database transaction to the frontend transaction format
 */
export const mapDatabaseTransactionToFrontend = (dbTransaction: Transaction): FrontendTransaction => {
  return {
    id: dbTransaction.id,
    date: dbTransaction.date,
    description: dbTransaction.description,
    amount: dbTransaction.amount,
    type: dbTransaction.type as TransactionType,
    status: dbTransaction.status as TransactionStatus,
    category: dbTransaction.category || undefined,
    clientId: dbTransaction.client_id || undefined,
    departmentId: dbTransaction.department_id || undefined
  };
};

/**
 * Maps a database budget to the frontend budget format
 */
export const mapDatabaseBudgetToFrontend = (dbBudget: Budget): FrontendBudget => {
  return {
    department: dbBudget.department,
    allocated: dbBudget.allocated,
    spent: dbBudget.spent,
    remaining: dbBudget.remaining,
    status: dbBudget.status as BudgetStatus,
    fiscalYear: dbBudget.fiscal_year,
    fiscalQuarter: dbBudget.fiscal_quarter || undefined
  };
};

/**
 * Maps a database revenue metric to the frontend format
 */
export const mapDatabaseRevenueMetricToFrontend = (
  dbRevenueMetric: RevenueMetric
): FrontendRevenueMetric => {
  return {
    id: dbRevenueMetric.id,
    month: dbRevenueMetric.month,
    revenue: dbRevenueMetric.revenue,
    previousMonthRevenue: dbRevenueMetric.previous_month_revenue,
    growthPercentage: dbRevenueMetric.growth_percentage
  };
};

/**
 * Maps a database expense category to the frontend format
 */
export const mapDatabaseExpenseCategoryToFrontend = (
  dbExpenseCategory: ExpenseCategory
): FrontendExpenseCategory => {
  return {
    id: dbExpenseCategory.id,
    name: dbExpenseCategory.name,
    percentage: dbExpenseCategory.percentage,
    amount: dbExpenseCategory.amount
  };
};

/**
 * Maps a database client revenue to the frontend format
 */
export const mapDatabaseClientRevenueToFrontend = (
  dbClientRevenue: ClientRevenue
): FrontendClientRevenue => {
  return {
    id: dbClientRevenue.id,
    clientName: dbClientRevenue.client_name,
    revenue: dbClientRevenue.revenue,
    percentage: dbClientRevenue.percentage
  };
};

/**
 * Maps a database financial metric to the frontend format
 */
export const mapDatabaseFinancialMetricToFrontend = (
  dbFinancialMetric: FinancialMetric
): FrontendFinancialMetric => {
  return {
    id: dbFinancialMetric.id,
    name: dbFinancialMetric.name,
    value: dbFinancialMetric.value,
    previousValue: dbFinancialMetric.previous_value,
    changePercentage: dbFinancialMetric.change_percentage,
    period: dbFinancialMetric.period
  };
};

/**
 * Maps a database cash flow to the frontend format
 */
export const mapDatabaseCashFlowToFrontend = (
  dbCashFlow: CashFlow
): FrontendCashFlow => {
  return {
    id: dbCashFlow.id,
    week: dbCashFlow.week,
    inflow: dbCashFlow.inflow,
    outflow: dbCashFlow.outflow,
    netFlow: dbCashFlow.net_flow
  };
};

/**
 * Maps a database revenue profit data to the frontend format
 */
export const mapDatabaseRevenueProfitDataToFrontend = (
  dbRevenueProfitData: RevenueProfitData
): FrontendRevenueProfitData => {
  return {
    id: dbRevenueProfitData.id,
    month: dbRevenueProfitData.month,
    revenue: dbRevenueProfitData.revenue,
    profit: dbRevenueProfitData.profit
  };
};

/**
 * Maps a database finance transaction to the frontend format
 * Updated to match the invoice line item format
 */
export const mapDatabaseFinanceTransactionToFrontend = (
  dbFinanceTransaction: FinanceTransaction
): FrontendFinanceTransaction => {
  return {
    id: dbFinanceTransaction.id,
    client: dbFinanceTransaction.client,
    invoiceId: dbFinanceTransaction.invoice_id,
    date: dbFinanceTransaction.date,
    status: dbFinanceTransaction.status,
    datePaid: dbFinanceTransaction.date_paid,
    description: dbFinanceTransaction.description,
    rate: dbFinanceTransaction.rate,
    quantity: dbFinanceTransaction.quantity,
    amount: dbFinanceTransaction.amount,
    discountPercentage: dbFinanceTransaction.discount_percentage,
    lineSubtotal: dbFinanceTransaction.line_subtotal,
    tax1Type: dbFinanceTransaction.tax_1_type,
    tax1Amount: dbFinanceTransaction.tax_1_amount,
    tax2Type: dbFinanceTransaction.tax_2_type,
    tax2Amount: dbFinanceTransaction.tax_2_amount,
    currency: dbFinanceTransaction.currency || "USD",
    companyAccountName: dbFinanceTransaction.company_account_name
  };
};
