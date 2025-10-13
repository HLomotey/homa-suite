/**
 * Utility types for Supabase integration
 * These types define the utility structure and related interfaces
 */

import { Json } from './database';

/**
 * UtilityType interface representing the utility_types table in Supabase
 */
export interface UtilityType {
  id: string;
  name: string;
  description: string | null;
  unit_of_measure: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * UtilitySetup interface representing the utility_setups table in Supabase
 */
export interface UtilitySetup {
  id: string;
  property_id: string;
  utility_type_id: string;
  meter_number: string | null;
  account_number: string | null;
  provider_name: string | null;
  provider_contact: string | null;
  billing_period_id: string | null;
  billing_date: string | null;
  billing_amount: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * BillingPeriod interface representing the legacy billing_periods table in Supabase
 */
export interface BillingPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * StandardizedBillingPeriod interface representing the new standardized billing_periods table
 */
export interface StandardizedBillingPeriod {
  id: string;
  name: string;
  description: string | null;
  period_type: 'first_half' | 'second_half';
  start_day: number;
  end_day: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * UtilityReading interface representing the utility_readings table in Supabase
 */
export interface UtilityReading {
  id: string;
  utility_setup_id: string;
  billing_period_id: string;
  reading_date: string;
  previous_reading: number | null;
  current_reading: number;
  consumption: number | null;
  unit_cost: number | null;
  total_cost: number | null;
  is_estimated: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * UtilityAllocation interface representing the utility_allocations table in Supabase
 */
export interface UtilityAllocation {
  id: string;
  utility_reading_id: string;
  room_id: string | null;
  allocation_percentage: number;
  allocated_amount: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Frontend utility type interface
 */
export interface FrontendUtilityType {
  id: string;
  name: string;
  description: string | null;
  unitOfMeasure: string;
  isActive: boolean;
}

/**
 * Frontend utility setup interface
 */
export interface FrontendUtilitySetup {
  id: string;
  propertyId: string;
  propertyName?: string;
  utilityTypeId: string;
  utilityTypeName?: string;
  meterNumber: string | null;
  accountNumber: string | null;
  providerName: string | null;
  providerContact: string | null;
  billingPeriodId: string | null;
  billingDate: string | null;
  billingAmount: number | null;
  isActive: boolean;
  notes: string | null;
}

/**
 * Frontend billing period interface (updated for flexible periods)
 */
export interface FrontendBillingPeriod {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  isRecurring: boolean;
  recurrenceType?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  periodStatusRelative?: 'UPCOMING' | 'CURRENT' | 'PAST';
  durationDays?: number;
  daysElapsed?: number;
  daysRemaining?: number;
}

/**
 * Frontend standardized billing period interface
 */
export interface FrontendStandardizedBillingPeriod {
  id: string;
  name: string;
  description: string | null;
  periodType: 'first_half' | 'second_half';
  startDay: number;
  endDay: number | null;
  isActive: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

/**
 * Frontend utility reading interface
 */
export interface FrontendUtilityReading {
  id: string;
  utilitySetupId: string;
  utilityTypeName?: string;
  propertyName?: string;
  billingPeriodId: string;
  billingPeriodName?: string;
  readingDate: string;
  previousReading: number | null;
  currentReading: number;
  consumption: number | null;
  unitCost: number | null;
  totalCost: number | null;
  isEstimated: boolean;
  notes: string | null;
}

/**
 * Frontend utility allocation interface
 */
export interface FrontendUtilityAllocation {
  id: string;
  utilityReadingId: string;
  roomId: string | null;
  roomName?: string | null;
  allocationPercentage: number;
  allocatedAmount: number;
}

/**
 * Maps a database utility type to the frontend format
 */
export const mapDatabaseUtilityTypeToFrontend = (dbUtilityType: UtilityType): FrontendUtilityType => {
  return {
    id: dbUtilityType.id,
    name: dbUtilityType.name,
    description: dbUtilityType.description,
    unitOfMeasure: dbUtilityType.unit_of_measure,
    isActive: dbUtilityType.is_active
  };
};

/**
 * Maps a database utility setup to the frontend format
 */
export const mapDatabaseUtilitySetupToFrontend = (dbUtilitySetup: UtilitySetup): FrontendUtilitySetup => {
  return {
    id: dbUtilitySetup.id,
    propertyId: dbUtilitySetup.property_id,
    utilityTypeId: dbUtilitySetup.utility_type_id,
    meterNumber: dbUtilitySetup.meter_number,
    accountNumber: dbUtilitySetup.account_number,
    providerName: dbUtilitySetup.provider_name,
    providerContact: dbUtilitySetup.provider_contact,
    billingPeriodId: dbUtilitySetup.billing_period_id,
    billingDate: dbUtilitySetup.billing_date,
    billingAmount: dbUtilitySetup.billing_amount,
    isActive: dbUtilitySetup.is_active,
    notes: dbUtilitySetup.notes
  };
};

/**
 * Maps a database billing period to the frontend format
 */
export const mapDatabaseBillingPeriodToFrontend = (dbBillingPeriod: any): FrontendBillingPeriod => {
  return {
    id: dbBillingPeriod.id,
    name: dbBillingPeriod.name,
    description: dbBillingPeriod.description,
    startDate: dbBillingPeriod.start_date,
    endDate: dbBillingPeriod.end_date,
    status: dbBillingPeriod.status,
    isRecurring: dbBillingPeriod.is_recurring || false,
    recurrenceType: dbBillingPeriod.recurrence_type,
    periodStatusRelative: dbBillingPeriod.period_status_relative,
    durationDays: dbBillingPeriod.duration_days,
    daysElapsed: dbBillingPeriod.days_elapsed,
    daysRemaining: dbBillingPeriod.days_remaining,
  };
};

/**
 * Maps a database standardized billing period to the frontend format
 */
export const mapDatabaseStandardizedBillingPeriodToFrontend = (dbBillingPeriod: StandardizedBillingPeriod): FrontendStandardizedBillingPeriod => {
  return {
    id: dbBillingPeriod.id,
    name: dbBillingPeriod.name,
    description: dbBillingPeriod.description,
    periodType: dbBillingPeriod.period_type,
    startDay: dbBillingPeriod.start_day,
    endDay: dbBillingPeriod.end_day,
    isActive: dbBillingPeriod.is_active
  };
};

/**
 * Maps a database utility reading to the frontend format
 */
export const mapDatabaseUtilityReadingToFrontend = (dbUtilityReading: UtilityReading): FrontendUtilityReading => {
  return {
    id: dbUtilityReading.id,
    utilitySetupId: dbUtilityReading.utility_setup_id,
    billingPeriodId: dbUtilityReading.billing_period_id,
    readingDate: dbUtilityReading.reading_date,
    previousReading: dbUtilityReading.previous_reading,
    currentReading: dbUtilityReading.current_reading,
    consumption: dbUtilityReading.consumption,
    unitCost: dbUtilityReading.unit_cost,
    totalCost: dbUtilityReading.total_cost,
    isEstimated: dbUtilityReading.is_estimated,
    notes: dbUtilityReading.notes
  };
};

/**
 * Maps a database utility allocation to the frontend format
 */
export const mapDatabaseUtilityAllocationToFrontend = (dbUtilityAllocation: UtilityAllocation): FrontendUtilityAllocation => {
  return {
    id: dbUtilityAllocation.id,
    utilityReadingId: dbUtilityAllocation.utility_reading_id,
    roomId: dbUtilityAllocation.room_id,
    allocationPercentage: dbUtilityAllocation.allocation_percentage,
    allocatedAmount: dbUtilityAllocation.allocated_amount
  };
};
