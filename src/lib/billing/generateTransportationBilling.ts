import { DateTime } from "luxon";
import { getBillingWindowsForMonth, inclusionForMonth } from "./semimonthly";
import { supabase } from "@/integration/supabase/client";
import { BillingType } from "@/types/billing";

export interface TransportationBillingData {
  tenant_id: string;
  property_id: string;
  room_id: string;
  transport_amount: number;
  payment_status: string;
  billing_type: BillingType;
  period_start: string;
  period_end: string;
  start_date: string;
  end_date?: string | null;
}

export async function getActiveStaffWithTransportation(year: number, month: number) {
  console.log(`🚌 Fetching staff with transportation agreements for ${year}-${month}`);
  
  try {
    // Query assignments with transportation_agreement = true
    const { data: assignments, error } = await (supabase
      .from('assignments') as any)
      .select(`
        tenant_id,
        property_id,
        room_id,
        rent_amount,
        start_date,
        end_date,
        transportation_agreement
      `)
      .eq('transportation_agreement', true)
      .not('tenant_id', 'is', null);

    if (error) {
      console.error('Error fetching transportation assignments:', error);
      throw new Error(`Failed to fetch transportation assignments: ${error.message}`);
    }

    console.log(`🚌 Found ${assignments?.length || 0} assignments with transportation agreements`);

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Get external staff data for employment validation
    const tenantIds = assignments.map((a: any) => a.tenant_id).filter(Boolean);
    console.log(`👥 Checking employment status for ${tenantIds.length} staff members`);
    
    const { data: staffData, error: staffError } = await (supabase
      .from('external_staff') as any)
      .select('id, "HIRE DATE", "TERMINATION DATE", "POSITION STATUS"')
      .in('id', tenantIds);

    if (staffError) {
      console.error('Error fetching external staff:', staffError);
      throw new Error(`Failed to fetch external staff: ${staffError.message}`);
    }

    console.log(`👤 External staff records found: ${staffData?.length || 0}`);

    // Create staff lookup map
    const staffMap = new Map();
    (staffData || []).forEach((staff: any) => {
      staffMap.set(staff.id, staff);
    });

    // Filter based on employment status and date overlap
    const validAssignments = assignments.filter((assignment: any) => {
      const staff = staffMap.get(assignment.tenant_id);
      if (!staff) return false;

      // Check if staff is active
      const positionStatus = staff["POSITION STATUS"];
      const isActive = positionStatus === 'Active' || positionStatus === 'A - Active' || !positionStatus;
      const isTerminated = positionStatus === 'Terminated' || positionStatus === 'T - Terminated';
      
      if (isTerminated || !isActive) {
        return false;
      }

      // Check employment overlap with the month
      const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
      const monthEnd = DateTime.fromObject({ year, month }).endOf('month').toISODate();
      
      const hireDate = staff["HIRE DATE"];
      const termDate = staff["TERMINATION DATE"];
      
      if (hireDate && hireDate > monthEnd) return false;
      if (termDate && termDate < monthStart) return false;

      // Add staff data to assignment for later use
      assignment.external_staff = staff;
      return true;
    });

    console.log(`✅ ${validAssignments.length} valid transportation assignments found`);
    return validAssignments;
  } catch (error) {
    console.error('Error in getActiveStaffWithTransportation:', error);
    throw error;
  }
}

export async function upsertTransportationBillingRow(billingData: TransportationBillingData): Promise<any> {
  console.log('🚌 Upserting transportation billing row:', {
    tenant_id: billingData.tenant_id,
    property_id: billingData.property_id,
    room_id: billingData.room_id,
    amount: billingData.transport_amount,
    period: `${billingData.period_start} to ${billingData.period_end}`,
    type: billingData.billing_type
  });

  try {
    const { data, error } = await (supabase
      .from('billing') as any)
      .upsert({
        tenant_id: billingData.tenant_id,
        property_id: billingData.property_id,
        room_id: billingData.room_id,
        rent_amount: billingData.transport_amount,
        payment_status: billingData.payment_status,
        billing_type: billingData.billing_type,
        period_start: billingData.period_start,
        period_end: billingData.period_end,
        start_date: billingData.start_date,
        end_date: billingData.end_date,
      }, {
        onConflict: 'tenant_id,period_start,period_end,billing_type'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error upserting transportation billing row:', error);
      throw new Error(`Failed to upsert transportation billing row: ${error.message}`);
    }

    console.log('✅ Successfully upserted transportation billing row:', data?.id);
    return data || null;
  } catch (error) {
    console.error('💥 Transportation billing upsert failed:', error);
    throw error;
  }
}

export async function generateTransportationBillingForMonth(
  year: number,
  month: number,
  transportRate: number = 200, // Default $200 per semi-monthly period
  zone = "America/Los_Angeles"
) {
  console.log(`🚌 Generating transportation billing for ${year}-${month}`);
  
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Pull staff with transportation agreements
  const staff = await getActiveStaffWithTransportation(year, month);
  console.log(`🚌 Processing ${staff.length} staff members with transportation agreements`);

  let generatedCount = 0;

  for (const s of staff) {
    // Use hire_date and termination_date from external_staff for billing logic
    const staffData = s.external_staff;
    const hireDate = staffData["HIRE DATE"] || s.start_date;
    const terminationDate = staffData["TERMINATION DATE"] || s.end_date;
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    if (include.firstWindow) {
      await upsertTransportationBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        transport_amount: transportRate,
        payment_status: "unpaid",
        billing_type: "transportation",
        period_start: w1.start.toISODate()!,
        period_end: w1.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
      });
      generatedCount++;
    }
    
    if (include.secondWindow) {
      await upsertTransportationBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        transport_amount: transportRate,
        payment_status: "unpaid",
        billing_type: "transportation",
        period_start: w2.start.toISODate()!,
        period_end: w2.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
      });
      generatedCount++;
    }
  }

  console.log(`🚌 Generated ${generatedCount} transportation billing records for ${year}-${month}`);
  return generatedCount;
}

// Combined function to generate both housing and transportation billing
export async function generateAllBillingForMonth(
  year: number,
  month: number,
  transportRate: number = 200,
  zone = "America/Los_Angeles"
) {
  console.log(`💰 Generating all billing (housing + transportation) for ${year}-${month}`);
  
  // Generate housing billing (existing logic)
  const { generateBillingForMonth } = await import('./generateForMonth');
  await generateBillingForMonth(year, month, zone);
  
  // Generate transportation billing
  const transportCount = await generateTransportationBillingForMonth(year, month, transportRate, zone);
  
  console.log(`💰 Completed billing generation for ${year}-${month}. Transportation records: ${transportCount}`);
  return transportCount;
}
