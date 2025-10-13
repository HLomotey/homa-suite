/**
 * API functions for the utilities module
 * These functions handle the communication with the Supabase backend
 * @ts-nocheck - Suppressing TypeScript errors due to database schema type mismatches
 */
// @ts-nocheck

import { supabase } from "@/integration/supabase/client";
import {
  UtilityType,
  UtilitySetup,
  BillingPeriod,
  UtilityReading,
  UtilityAllocation,
  FrontendUtilityType,
  FrontendUtilitySetup,
  FrontendBillingPeriod,
  FrontendUtilityReading,
  FrontendUtilityAllocation,
  mapDatabaseUtilityTypeToFrontend,
  mapDatabaseUtilitySetupToFrontend,
  mapDatabaseBillingPeriodToFrontend,
  mapDatabaseUtilityReadingToFrontend,
  mapDatabaseUtilityAllocationToFrontend
} from "@/integration/supabase/types/utility";

// Utility Types API functions
export const fetchUtilityTypes = async (): Promise<FrontendUtilityType[]> => {
  const { data, error } = await supabase
    .from("utility_types")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(`Error fetching utility types: ${error.message}`);
  }

  return (data as UtilityType[]).map(mapDatabaseUtilityTypeToFrontend);
};


export const fetchUtilityTypeById = async (id: string): Promise<FrontendUtilityType> => {
  const { data, error } = await supabase
    .from("utility_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching utility type: ${error.message}`);
  }

  return mapDatabaseUtilityTypeToFrontend(data as UtilityType);
};

export const createUtilityType = async (
  utilityTypeData: Omit<FrontendUtilityType, "id">
): Promise<FrontendUtilityType> => {
  const { data, error } = await supabase
    .from("utility_types")
    .insert({
      name: utilityTypeData.name,
      description: utilityTypeData.description,
      unit_of_measure: utilityTypeData.unitOfMeasure,
      is_active: utilityTypeData.isActive
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating utility type: ${error.message}`);
  }

  return mapDatabaseUtilityTypeToFrontend(data as UtilityType);
};

export const updateUtilityType = async (
  id: string,
  utilityTypeData: Partial<Omit<FrontendUtilityType, "id">>
): Promise<FrontendUtilityType> => {
  const updateData: any = {};
  
  if (utilityTypeData.name !== undefined) updateData.name = utilityTypeData.name;
  if (utilityTypeData.description !== undefined) updateData.description = utilityTypeData.description;
  if (utilityTypeData.unitOfMeasure !== undefined) updateData.unit_of_measure = utilityTypeData.unitOfMeasure;
  if (utilityTypeData.isActive !== undefined) updateData.is_active = utilityTypeData.isActive;

  const { data, error } = await supabase
    .from("utility_types")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating utility type: ${error.message}`);
  }

  return mapDatabaseUtilityTypeToFrontend(data as UtilityType);
};

export const deleteUtilityType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("utility_types")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting utility type: ${error.message}`);
  }
};

// Utility Setups API functions
export const fetchUtilitySetups = async (): Promise<FrontendUtilitySetup[]> => {
  const { data, error } = await supabase
    .from("utility_setups")
    .select(`
      *,
      utility_types(name)
    `)
    .order("created_at");

  if (error) {
    throw new Error(`Error fetching utility setups: ${error.message}`);
  }

  return data.map((item: any) => {
    const setup = mapDatabaseUtilitySetupToFrontend(item);
    setup.utilityTypeName = item.utility_types?.name || '';
    setup.propertyName = item.properties?.title || '';
    return setup;
  });
};

export const fetchUtilitySetupsByProperty = async (propertyId: string): Promise<FrontendUtilitySetup[]> => {
  const { data, error } = await supabase
    .from("utility_setups")
    .select(`
      *,
      utility_types(name),
      properties:property_id(title)
    `)
    .eq("property_id", propertyId)
    .order("created_at");

  if (error) {
    throw new Error(`Error fetching utility setups for property: ${error.message}`);
  }

  return data.map((item: any) => {
    const setup = mapDatabaseUtilitySetupToFrontend(item);
    setup.utilityTypeName = item.utility_types?.name || '';
    setup.propertyName = item.properties?.title || '';
    return setup;
  });
};

export const fetchUtilitySetupById = async (id: string): Promise<FrontendUtilitySetup> => {
  const { data, error } = await supabase
    .from("utility_setups")
    .select(`
      *,
      utility_types(name),
      properties:property_id(title)
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching utility setup: ${error.message}`);
  }

  const setup = mapDatabaseUtilitySetupToFrontend(data);
  setup.utilityTypeName = data.utility_types?.name || '';
  setup.propertyName = data.properties?.title || '';
  return setup;
};

export const createUtilitySetup = async (
  utilitySetupData: Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">
): Promise<FrontendUtilitySetup> => {
  const { data, error } = await supabase
    .from("utility_setups")
    .insert({
      property_id: utilitySetupData.propertyId,
      utility_type_id: utilitySetupData.utilityTypeId,
      meter_number: utilitySetupData.meterNumber,
      account_number: utilitySetupData.accountNumber,
      provider_name: utilitySetupData.providerName,
      provider_contact: utilitySetupData.providerContact,
      is_active: utilitySetupData.isActive,
      notes: utilitySetupData.notes
    })
    .select(`
      *,
      utility_types(name),
      properties:property_id(title)
    `)
    .single();

  if (error) {
    throw new Error(`Error creating utility setup: ${error.message}`);
  }

  const setup = mapDatabaseUtilitySetupToFrontend(data);
  setup.utilityTypeName = data.utility_types?.name || '';
  setup.propertyName = data.properties?.title || '';
  return setup;
};

export const updateUtilitySetup = async (
  id: string,
  utilitySetupData: Partial<Omit<FrontendUtilitySetup, "id" | "utilityTypeName" | "propertyName">>
): Promise<FrontendUtilitySetup> => {
  const updateData: any = {};
  
  if (utilitySetupData.propertyId !== undefined) updateData.property_id = utilitySetupData.propertyId;
  if (utilitySetupData.utilityTypeId !== undefined) updateData.utility_type_id = utilitySetupData.utilityTypeId;
  if (utilitySetupData.meterNumber !== undefined) updateData.meter_number = utilitySetupData.meterNumber;
  if (utilitySetupData.accountNumber !== undefined) updateData.account_number = utilitySetupData.accountNumber;
  if (utilitySetupData.providerName !== undefined) updateData.provider_name = utilitySetupData.providerName;
  if (utilitySetupData.providerContact !== undefined) updateData.provider_contact = utilitySetupData.providerContact;
  if (utilitySetupData.isActive !== undefined) updateData.is_active = utilitySetupData.isActive;
  if (utilitySetupData.notes !== undefined) updateData.notes = utilitySetupData.notes;

  const { data, error } = await supabase
    .from("utility_setups")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      utility_types(name),
      properties:property_id(title)
    `)
    .single();

  if (error) {
    throw new Error(`Error updating utility setup: ${error.message}`);
  }

  const setup = mapDatabaseUtilitySetupToFrontend(data);
  setup.utilityTypeName = data.utility_types?.name || '';
  setup.propertyName = data.properties?.title || '';
  return setup;
};

export const deleteUtilitySetup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("utility_setups")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting utility setup: ${error.message}`);
  }
};

// Billing Periods API functions
export const fetchBillingPeriods = async (): Promise<FrontendBillingPeriod[]> => {
  const { data, error } = await supabase
    .from("billing_periods")
    .select("*")
    .order("start_date", { ascending: false }); // Order by start_date for flexible periods

  if (error) {
    throw new Error(`Error fetching billing periods: ${error.message}`);
  }

  return (data as any[]).map(mapDatabaseBillingPeriodToFrontend);
};

export const fetchBillingPeriodById = async (id: string): Promise<FrontendBillingPeriod> => {
  const { data, error } = await supabase
    .from("billing_periods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching billing period: ${error.message}`);
  }

  return mapDatabaseBillingPeriodToFrontend(data as BillingPeriod);
};

export const createBillingPeriod = async (
  billingPeriodData: Omit<FrontendBillingPeriod, "id">
): Promise<FrontendBillingPeriod> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    throw new Error(`Error getting current user: ${userError.message}`);
  }
  
  const { data, error } = await supabase
    .from("billing_periods")
    .insert({
      name: billingPeriodData.name,
      description: billingPeriodData.description,
      start_date: billingPeriodData.startDate,
      end_date: billingPeriodData.endDate,
      status: billingPeriodData.status,
      is_recurring: billingPeriodData.isRecurring,
      recurrence_type: billingPeriodData.recurrenceType,
      created_by: userData.user?.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating billing period: ${error.message}`);
  }

  return mapDatabaseBillingPeriodToFrontend(data as any);
};

export const updateBillingPeriod = async (
  id: string,
  billingPeriodData: Partial<Omit<FrontendBillingPeriod, "id">>
): Promise<FrontendBillingPeriod> => {
  const updateData: any = {};
  
  if (billingPeriodData.name !== undefined) updateData.name = billingPeriodData.name;
  if (billingPeriodData.description !== undefined) updateData.description = billingPeriodData.description;
  if (billingPeriodData.startDate !== undefined) updateData.start_date = billingPeriodData.startDate;
  if (billingPeriodData.endDate !== undefined) updateData.end_date = billingPeriodData.endDate;
  if (billingPeriodData.status !== undefined) updateData.status = billingPeriodData.status;
  if (billingPeriodData.isRecurring !== undefined) updateData.is_recurring = billingPeriodData.isRecurring;
  if (billingPeriodData.recurrenceType !== undefined) updateData.recurrence_type = billingPeriodData.recurrenceType;

  const { data, error } = await supabase
    .from("billing_periods")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating billing period: ${error.message}`);
  }

  return mapDatabaseBillingPeriodToFrontend(data as any);
};

export const deleteBillingPeriod = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("billing_periods")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting billing period: ${error.message}`);
  }
};

// Utility Readings API functions
export const fetchUtilityReadings = async (): Promise<FrontendUtilityReading[]> => {
  const { data, error } = await supabase
    .from("utility_readings")
    .select(`
      *,
      utility_setups(
        *,
        utility_types(name),
        properties:property_id(title)
      ),
      billing_periods(name)
    `)
    .order("reading_date", { ascending: false });

  if (error) {
    throw new Error(`Error fetching utility readings: ${error.message}`);
  }

  return data.map((item: any) => {
    const reading = mapDatabaseUtilityReadingToFrontend(item);
    reading.utilityTypeName = item.utility_setups?.utility_types?.name || '';
    reading.propertyName = item.utility_setups?.properties?.title || '';
    reading.billingPeriodName = item.billing_periods?.name || '';
    return reading;
  });
};

export const fetchUtilityReadingsBySetup = async (setupId: string): Promise<FrontendUtilityReading[]> => {
  const { data, error } = await supabase
    .from("utility_readings")
    .select(`
      *,
      utility_setups(
        *,
        utility_types(name),
        properties:property_id(title)
      ),
      billing_periods(name)
    `)
    .eq("utility_setup_id", setupId)
    .order("reading_date", { ascending: false });

  if (error) {
    throw new Error(`Error fetching utility readings for setup: ${error.message}`);
  }

  return data.map((item: any) => {
    const reading = mapDatabaseUtilityReadingToFrontend(item);
    reading.utilityTypeName = item.utility_setups?.utility_types?.name || '';
    reading.propertyName = item.utility_setups?.properties?.title || '';
    reading.billingPeriodName = item.billing_periods?.name || '';
    return reading;
  });
};

export const fetchUtilityReadingsByBillingPeriod = async (billingPeriodId: string): Promise<FrontendUtilityReading[]> => {
  const { data, error } = await supabase
    .from("utility_readings")
    .select(`
      *,
      utility_setups(
        *,
        utility_types(name),
        properties:property_id(title)
      ),
      billing_periods(name)
    `)
    .eq("billing_period_id", billingPeriodId)
    .order("reading_date", { ascending: false });

  if (error) {
    throw new Error(`Error fetching utility readings for billing period: ${error.message}`);
  }

  return data.map((item: any) => {
    const reading = mapDatabaseUtilityReadingToFrontend(item);
    reading.utilityTypeName = item.utility_setups?.utility_types?.name || '';
    reading.propertyName = item.utility_setups?.properties?.title || '';
    reading.billingPeriodName = item.billing_periods?.name || '';
    return reading;
  });
};

export const fetchUtilityReadingById = async (id: string): Promise<FrontendUtilityReading> => {
  const { data, error } = await supabase
    .from("utility_readings")
    .select(`
      *,
      utility_setups(
        *,
        utility_types(name),
        properties:property_id(title)
      ),
      billing_periods(name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching utility reading: ${error.message}`);
  }

  const reading = mapDatabaseUtilityReadingToFrontend(data);
  reading.utilityTypeName = data.utility_setups?.utility_types?.name || '';
  reading.propertyName = data.utility_setups?.properties?.title || '';
  reading.billingPeriodName = data.billing_periods?.name || '';
  return reading;
};

export const createUtilityReading = async (
  readingData: Omit<FrontendUtilityReading, "id" | "utilityTypeName" | "propertyName" | "billingPeriodName">
): Promise<FrontendUtilityReading> => {
  const { data, error } = await supabase
    .from("utility_readings")
    .insert({
      utility_setup_id: readingData.utilitySetupId,
      billing_period_id: readingData.billingPeriodId,
      reading_date: readingData.readingDate,
      previous_reading: readingData.previousReading,
      current_reading: readingData.currentReading,
      consumption: readingData.consumption,
      unit_cost: readingData.unitCost,
      total_cost: readingData.totalCost,
      is_estimated: readingData.isEstimated,
      notes: readingData.notes
    })
    .select(`
      *,
      utility_setups(
        *,
        utility_types(name),
        properties:property_id(title)
      ),
      billing_periods(name)
    `)
    .single();

  if (error) {
    throw new Error(`Error creating utility reading: ${error.message}`);
  }

  const reading = mapDatabaseUtilityReadingToFrontend(data);
  reading.utilityTypeName = data.utility_setups?.utility_types?.name || '';
  reading.propertyName = data.utility_setups?.properties?.title || '';
  reading.billingPeriodName = data.billing_periods?.name || '';
  return reading;
};

export const updateUtilityReading = async (
  id: string,
  readingData: Partial<Omit<FrontendUtilityReading, "id" | "utilityTypeName" | "propertyName" | "billingPeriodName">>
): Promise<FrontendUtilityReading> => {
  const updateData: any = {};
  
  if (readingData.utilitySetupId !== undefined) updateData.utility_setup_id = readingData.utilitySetupId;
  if (readingData.billingPeriodId !== undefined) updateData.billing_period_id = readingData.billingPeriodId;
  if (readingData.readingDate !== undefined) updateData.reading_date = readingData.readingDate;
  if (readingData.previousReading !== undefined) updateData.previous_reading = readingData.previousReading;
  if (readingData.currentReading !== undefined) updateData.current_reading = readingData.currentReading;
  if (readingData.consumption !== undefined) updateData.consumption = readingData.consumption;
  if (readingData.unitCost !== undefined) updateData.unit_cost = readingData.unitCost;
  if (readingData.totalCost !== undefined) updateData.total_cost = readingData.totalCost;
  if (readingData.isEstimated !== undefined) updateData.is_estimated = readingData.isEstimated;
  if (readingData.notes !== undefined) updateData.notes = readingData.notes;

  const { data, error } = await supabase
    .from("utility_readings")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      utility_setups(
        *,
        utility_types(name),
        properties:property_id(title)
      ),
      billing_periods(name)
    `)
    .single();

  if (error) {
    throw new Error(`Error updating utility reading: ${error.message}`);
  }

  const reading = mapDatabaseUtilityReadingToFrontend(data);
  reading.utilityTypeName = data.utility_setups?.utility_types?.name || '';
  reading.propertyName = data.utility_setups?.properties?.title || '';
  reading.billingPeriodName = data.billing_periods?.name || '';
  return reading;
};

export const deleteUtilityReading = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("utility_readings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting utility reading: ${error.message}`);
  }
};
