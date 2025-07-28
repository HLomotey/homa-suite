/**
 * Billing types for Supabase integration
 * These types define the billing structure and related interfaces
 */

import { Json } from './database';

/**
 * Bill interface representing the bills table in Supabase
 */
export interface Bill {
  id: string;
  staff_id: string;
  amount: number;
  type: string;
  status: string;
  due_date: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * BillStatus enum
 */
export type BillStatus = 'paid' | 'pending' | 'overdue';

/**
 * BillType enum
 */
export type BillType = 'rent' | 'utilities' | 'transport' | 'maintenance';

/**
 * Staff interface representing the staff table in Supabase
 * This is a simplified version for billing purposes
 */
export interface BillingStaff {
  id: string;
  name: string;
  department: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * BillingStats interface representing the billing_stats table in Supabase
 */
export interface BillingStats {
  id: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  month: string;
  year: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend bill type that matches the structure in BillingForm.tsx and BillingList.tsx
 */
export interface FrontendBill {
  id: string;
  staffId: string;
  amount: number;
  type: string;
  status: BillStatus;
  dueDate: string;
  description?: string;
}

/**
 * Frontend staff type that matches the structure in the billing components
 */
export interface FrontendBillingStaff {
  id: string;
  name: string;
  department: string;
}

/**
 * Frontend billing stats type
 */
export interface FrontendBillingStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  month: string;
  year: number;
}

/**
 * Maps a database bill to the frontend bill format
 */
export const mapDatabaseBillToFrontend = (dbBill: Bill): FrontendBill => {
  return {
    id: dbBill.id,
    staffId: dbBill.staff_id,
    amount: dbBill.amount,
    type: dbBill.type,
    status: dbBill.status as BillStatus,
    dueDate: dbBill.due_date,
    description: dbBill.description || undefined
  };
};

/**
 * Maps a database staff to the frontend staff format
 */
export const mapDatabaseBillingStaffToFrontend = (
  dbStaff: BillingStaff
): FrontendBillingStaff => {
  return {
    id: dbStaff.id,
    name: dbStaff.name,
    department: dbStaff.department
  };
};

/**
 * Maps a database billing stats to the frontend format
 */
export const mapDatabaseBillingStatsToFrontend = (
  dbStats: BillingStats
): FrontendBillingStats => {
  return {
    totalAmount: dbStats.total_amount,
    paidAmount: dbStats.paid_amount,
    pendingAmount: dbStats.pending_amount,
    overdueAmount: dbStats.overdue_amount,
    month: dbStats.month,
    year: dbStats.year
  };
};
