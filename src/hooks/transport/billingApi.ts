/**
 * Billing API functions for Supabase integration
 * These functions handle direct communication with Supabase for billing data
 */

import { supabase } from "../../integration/supabase/client";
import {
  BillingPeriod,
  TransportBilling,
  TransportBillingRate,
  TransportBillingUsage,
  FrontendBillingPeriod,
  FrontendTransportBilling,
  FrontendTransportBillingRate,
  FrontendTransportBillingUsage,
  mapDatabaseBillingPeriodToFrontend,
  mapDatabaseTransportBillingToFrontend,
  mapDatabaseTransportBillingRateToFrontend,
  mapDatabaseTransportBillingUsageToFrontend
} from "../../integration/supabase/types/billing";

/**
 * Fetch all billing periods from Supabase
 * @returns Promise with array of billing periods
 */
export const fetchBillingPeriods = async (): Promise<FrontendBillingPeriod[]> => {
  const { data, error } = await supabase
    .from("billing_periods")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching billing periods:", error);
    throw new Error(error.message);
  }

  return (data as BillingPeriod[]).map(mapDatabaseBillingPeriodToFrontend);
};

/**
 * Fetch a single billing period by ID
 * @param id Billing period ID
 * @returns Promise with billing period data
 */
export const fetchBillingPeriodById = async (
  id: string
): Promise<FrontendBillingPeriod> => {
  const { data, error } = await supabase
    .from("billing_periods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching billing period with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseBillingPeriodToFrontend(data as BillingPeriod);
};

/**
 * Create a new billing period
 * @param billingPeriod Billing period data to create
 * @returns Promise with created billing period data
 */
export const createBillingPeriod = async (
  billingPeriod: Omit<FrontendBillingPeriod, "id">
): Promise<FrontendBillingPeriod> => {
  // Convert frontend billing period to database format
  const dbBillingPeriod = {
    name: billingPeriod.name,
    start_date: billingPeriod.startDate,
    end_date: billingPeriod.endDate,
    status: billingPeriod.status,
    created_by: billingPeriod.createdBy
  };

  const { data, error } = await supabase
    .from("billing_periods")
    .insert(dbBillingPeriod)
    .select()
    .single();

  if (error) {
    console.error("Error creating billing period:", error);
    throw new Error(error.message);
  }

  return mapDatabaseBillingPeriodToFrontend(data as BillingPeriod);
};

/**
 * Update an existing billing period
 * @param id Billing period ID
 * @param billingPeriod Billing period data to update
 * @returns Promise with updated billing period data
 */
export const updateBillingPeriod = async (
  id: string,
  billingPeriod: Partial<Omit<FrontendBillingPeriod, "id">>
): Promise<FrontendBillingPeriod> => {
  // Convert frontend billing period to database format
  const dbBillingPeriod: any = {};
  
  if (billingPeriod.name !== undefined) dbBillingPeriod.name = billingPeriod.name;
  if (billingPeriod.startDate !== undefined) dbBillingPeriod.start_date = billingPeriod.startDate;
  if (billingPeriod.endDate !== undefined) dbBillingPeriod.end_date = billingPeriod.endDate;
  if (billingPeriod.status !== undefined) dbBillingPeriod.status = billingPeriod.status;

  const { data, error } = await supabase
    .from("billing_periods")
    .update(dbBillingPeriod)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating billing period with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseBillingPeriodToFrontend(data as BillingPeriod);
};

/**
 * Delete a billing period
 * @param id Billing period ID
 * @returns Promise with success status
 */
export const deleteBillingPeriod = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("billing_periods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting billing period with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch all transport billing entries from Supabase
 * @returns Promise with array of transport billing entries
 */
export const fetchTransportBillings = async (): Promise<FrontendTransportBilling[]> => {
  const { data, error } = await supabase
    .from("transport_billing")
    .select(`
      *,
      billing_periods (name),
      staff (legal_name),
      company_locations (name),
      vehicles (make, model, license_plate)
    `)
    .order("due_date", { ascending: false });

  if (error) {
    console.error("Error fetching transport billings:", error);
    throw new Error(error.message);
  }

  return data.map((item: any) => {
    const billing = item as TransportBilling;
    const billingPeriodName = item.billing_periods?.name;
    const staffName = item.staff?.legal_name;
    const locationName = item.company_locations?.name;
    const vehicleInfo = item.vehicles ? 
      `${item.vehicles.make} ${item.vehicles.model} (${item.vehicles.license_plate})` : 
      undefined;

    return mapDatabaseTransportBillingToFrontend(
      billing,
      billingPeriodName,
      staffName,
      locationName,
      vehicleInfo
    );
  });
};

/**
 * Fetch transport billing entries by billing period
 * @param billingPeriodId Billing period ID
 * @returns Promise with array of transport billing entries
 */
export const fetchTransportBillingsByPeriod = async (
  billingPeriodId: string
): Promise<FrontendTransportBilling[]> => {
  const { data, error } = await supabase
    .from("transport_billing")
    .select(`
      *,
      billing_periods (name),
      staff (legal_name),
      company_locations (name),
      vehicles (make, model, license_plate)
    `)
    .eq("billing_period_id", billingPeriodId)
    .order("due_date", { ascending: false });

  if (error) {
    console.error(`Error fetching transport billings for period ${billingPeriodId}:`, error);
    throw new Error(error.message);
  }

  return data.map((item: any) => {
    const billing = item as TransportBilling;
    const billingPeriodName = item.billing_periods?.name;
    const staffName = item.staff?.legal_name;
    const locationName = item.company_locations?.name;
    const vehicleInfo = item.vehicles ? 
      `${item.vehicles.make} ${item.vehicles.model} (${item.vehicles.license_plate})` : 
      undefined;

    return mapDatabaseTransportBillingToFrontend(
      billing,
      billingPeriodName,
      staffName,
      locationName,
      vehicleInfo
    );
  });
};

/**
 * Create a new transport billing entry
 * @param billing Transport billing data to create
 * @returns Promise with created transport billing data
 */
export const createTransportBilling = async (
  billing: Omit<FrontendTransportBilling, "id">
): Promise<FrontendTransportBilling> => {
  // Convert frontend billing to database format
  const dbBilling = {
    billing_period_id: billing.billingPeriodId,
    staff_id: billing.staffId,
    location_id: billing.locationId,
    vehicle_id: billing.vehicleId,
    amount: billing.amount,
    description: billing.description || null,
    status: billing.status,
    due_date: billing.dueDate,
    paid_date: billing.paidDate || null,
    payment_reference: billing.paymentReference || null,
    notes: billing.notes || null
  };

  const { data, error } = await supabase
    .from("transport_billing")
    .insert(dbBilling)
    .select(`
      *,
      billing_periods (name),
      staff (legal_name),
      company_locations (name),
      vehicles (make, model, license_plate)
    `)
    .single();

  if (error) {
    console.error("Error creating transport billing:", error);
    throw new Error(error.message);
  }

  const billingPeriodName = data.billing_periods?.name;
  const staffName = data.staff?.legal_name;
  const locationName = data.company_locations?.name;
  const vehicleInfo = data.vehicles ? 
    `${data.vehicles.make} ${data.vehicles.model} (${data.vehicles.license_plate})` : 
    undefined;

  return mapDatabaseTransportBillingToFrontend(
    data as TransportBilling,
    billingPeriodName,
    staffName,
    locationName,
    vehicleInfo
  );
};

/**
 * Update an existing transport billing entry
 * @param id Transport billing ID
 * @param billing Transport billing data to update
 * @returns Promise with updated transport billing data
 */
export const updateTransportBilling = async (
  id: string,
  billing: Partial<Omit<FrontendTransportBilling, "id">>
): Promise<FrontendTransportBilling> => {
  // Convert frontend billing to database format
  const dbBilling: any = {};
  
  if (billing.billingPeriodId !== undefined) dbBilling.billing_period_id = billing.billingPeriodId;
  if (billing.staffId !== undefined) dbBilling.staff_id = billing.staffId;
  if (billing.locationId !== undefined) dbBilling.location_id = billing.locationId;
  if (billing.vehicleId !== undefined) dbBilling.vehicle_id = billing.vehicleId;
  if (billing.amount !== undefined) dbBilling.amount = billing.amount;
  if (billing.description !== undefined) dbBilling.description = billing.description || null;
  if (billing.status !== undefined) dbBilling.status = billing.status;
  if (billing.dueDate !== undefined) dbBilling.due_date = billing.dueDate;
  if (billing.paidDate !== undefined) dbBilling.paid_date = billing.paidDate || null;
  if (billing.paymentReference !== undefined) dbBilling.payment_reference = billing.paymentReference || null;
  if (billing.notes !== undefined) dbBilling.notes = billing.notes || null;

  const { data, error } = await supabase
    .from("transport_billing")
    .update(dbBilling)
    .eq("id", id)
    .select(`
      *,
      billing_periods (name),
      staff (legal_name),
      company_locations (name),
      vehicles (make, model, license_plate)
    `)
    .single();

  if (error) {
    console.error(`Error updating transport billing with ID ${id}:`, error);
    throw new Error(error.message);
  }

  const billingPeriodName = data.billing_periods?.name;
  const staffName = data.staff?.legal_name;
  const locationName = data.company_locations?.name;
  const vehicleInfo = data.vehicles ? 
    `${data.vehicles.make} ${data.vehicles.model} (${data.vehicles.license_plate})` : 
    undefined;

  return mapDatabaseTransportBillingToFrontend(
    data as TransportBilling,
    billingPeriodName,
    staffName,
    locationName,
    vehicleInfo
  );
};

/**
 * Delete a transport billing entry
 * @param id Transport billing ID
 * @returns Promise with success status
 */
export const deleteTransportBilling = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("transport_billing")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting transport billing with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Fetch billing rates for transport
 * @returns Promise with array of transport billing rates
 */
export const fetchTransportBillingRates = async (): Promise<FrontendTransportBillingRate[]> => {
  const { data, error } = await supabase
    .from("transport_billing_rates")
    .select(`
      *,
      company_locations (name)
    `)
    .order("effective_from", { ascending: false });

  if (error) {
    console.error("Error fetching transport billing rates:", error);
    throw new Error(error.message);
  }

  return data.map((item: any) => {
    const rate = item as TransportBillingRate;
    const locationName = item.company_locations?.name;

    return mapDatabaseTransportBillingRateToFrontend(rate, locationName);
  });
};

/**
 * Create a new transport billing rate
 * @param rate Transport billing rate data to create
 * @returns Promise with created transport billing rate data
 */
export const createTransportBillingRate = async (
  rate: Omit<FrontendTransportBillingRate, "id">
): Promise<FrontendTransportBillingRate> => {
  // Convert frontend rate to database format
  const dbRate = {
    location_id: rate.locationId,
    vehicle_type: rate.vehicleType,
    rate_per_day: rate.ratePerDay,
    effective_from: rate.effectiveFrom,
    effective_to: rate.effectiveTo || null
  };

  const { data, error } = await supabase
    .from("transport_billing_rates")
    .insert(dbRate)
    .select(`
      *,
      company_locations (name)
    `)
    .single();

  if (error) {
    console.error("Error creating transport billing rate:", error);
    throw new Error(error.message);
  }

  const locationName = data.company_locations?.name;
  return mapDatabaseTransportBillingRateToFrontend(data as TransportBillingRate, locationName);
};

/**
 * Fetch billing usage records for a specific billing entry
 * @param billingId Transport billing ID
 * @returns Promise with array of transport billing usage records
 */
export const fetchTransportBillingUsage = async (
  billingId: string
): Promise<FrontendTransportBillingUsage[]> => {
  const { data, error } = await supabase
    .from("transport_billing_usage")
    .select("*")
    .eq("billing_id", billingId)
    .order("usage_date", { ascending: false });

  if (error) {
    console.error(`Error fetching transport billing usage for billing ID ${billingId}:`, error);
    throw new Error(error.message);
  }

  return (data as TransportBillingUsage[]).map(mapDatabaseTransportBillingUsageToFrontend);
};

/**
 * Create a new transport billing usage record
 * @param usage Transport billing usage data to create
 * @returns Promise with created transport billing usage data
 */
export const createTransportBillingUsage = async (
  usage: Omit<FrontendTransportBillingUsage, "id">
): Promise<FrontendTransportBillingUsage> => {
  // Convert frontend usage to database format
  const dbUsage = {
    billing_id: usage.billingId,
    usage_date: usage.usageDate,
    distance: usage.distance || null,
    duration: usage.duration || null,
    notes: usage.notes || null
  };

  const { data, error } = await supabase
    .from("transport_billing_usage")
    .insert(dbUsage)
    .select()
    .single();

  if (error) {
    console.error("Error creating transport billing usage:", error);
    throw new Error(error.message);
  }

  return mapDatabaseTransportBillingUsageToFrontend(data as TransportBillingUsage);
};
