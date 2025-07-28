/**
 * Assignment types for Supabase integration
 * These types define the assignment structure and related interfaces
 */

import { Json } from './database';

/**
 * Assignment interface representing the assignments table in Supabase
 */
export interface Assignment {
  id: string;
  tenant_name: string;
  tenant_id: string;
  property_id: string;
  property_name: string;
  room_id: string;
  room_name: string;
  status: string;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  payment_status: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Assignment status enum
 */
export type AssignmentStatus = 'Active' | 'Pending' | 'Expired' | 'Terminated';

/**
 * Payment status enum
 */
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partial';

/**
 * Frontend assignment type that matches the structure in AssignmentForm.tsx
 */
export interface FrontendAssignment {
  id: string;
  tenantName: string;
  tenantId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  status: AssignmentStatus;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentStatus: PaymentStatus;
}

/**
 * Maps a database assignment to the frontend assignment format
 */
export const mapDatabaseAssignmentToFrontend = (dbAssignment: Assignment): FrontendAssignment => {
  return {
    id: dbAssignment.id,
    tenantName: dbAssignment.tenant_name,
    tenantId: dbAssignment.tenant_id,
    propertyId: dbAssignment.property_id,
    propertyName: dbAssignment.property_name,
    roomId: dbAssignment.room_id,
    roomName: dbAssignment.room_name,
    status: dbAssignment.status as AssignmentStatus,
    startDate: dbAssignment.start_date,
    endDate: dbAssignment.end_date || '',
    rentAmount: dbAssignment.rent_amount,
    paymentStatus: dbAssignment.payment_status as PaymentStatus
  };
};
