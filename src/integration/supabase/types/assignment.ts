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
  tenant_name: string | null;
  tenant_id: string | null;
  property_id: string;
  property_name: string;
  room_id: string;
  room_name: string;
  staff_id: string | null;
  staff_name: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  // payment_status removed - no longer used in assignments table
  housing_agreement: boolean;
  transportation_agreement: boolean;
  flight_agreement: boolean;
  bus_card_agreement: boolean;
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
 * Deduction schedule item for security deposits
 */
export interface DeductionScheduleItem {
  id?: string;
  deductionNumber: number;
  scheduledDate: string;
  amount: number;
  status: 'scheduled' | 'deducted' | 'waived' | 'adjusted';
  actualDeductionDate?: string;
  actualAmount?: number;
  reason?: string;
  notes?: string;
}

/**
 * Security deposit information for housing agreements
 */
export interface SecurityDeposit {
  benefitType: 'housing' | 'transportation' | 'flight_agreement' | 'bus_card';
  totalAmount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paidDate: string;
  notes?: string;
  deductionSchedule: DeductionScheduleItem[];
}

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
  staffId?: string;
  staffName?: string;
  status: AssignmentStatus;
  startDate: string;
  endDate: string;
  rentAmount: number;
  agreements?: {
    housing?: boolean;
    transportation?: boolean;
    flight_agreement?: boolean;
    bus_card?: boolean;
  };
  securityDeposits?: SecurityDeposit[] | null;
}

/**
 * Maps a database assignment to the frontend assignment format
 */
export const mapDatabaseAssignmentToFrontend = (dbAssignment: Assignment): FrontendAssignment => {
  return {
    id: dbAssignment.id,
    tenantName: dbAssignment.tenant_name || '',
    tenantId: dbAssignment.tenant_id || '',
    propertyId: dbAssignment.property_id,
    propertyName: dbAssignment.property_name,
    roomId: dbAssignment.room_id,
    roomName: dbAssignment.room_name,
    staffId: dbAssignment.staff_id || '',
    staffName: dbAssignment.staff_name || '',
    status: dbAssignment.status as AssignmentStatus,
    startDate: dbAssignment.start_date,
    endDate: dbAssignment.end_date || '',
    rentAmount: dbAssignment.rent_amount,
    agreements: {
      housing: dbAssignment.housing_agreement,
      transportation: dbAssignment.transportation_agreement,
      flight_agreement: dbAssignment.flight_agreement,
      bus_card: dbAssignment.bus_card_agreement
    }
  };
};
