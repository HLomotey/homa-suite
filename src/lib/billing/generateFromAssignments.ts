import { DateTime } from "luxon";
import { getBillingWindowsForMonth, inclusionForMonth } from "./semimonthly";
import { supabase } from "@/integration/supabase/client";

interface AssignmentWithStaff {
  tenant_id: string;
  property_id: string;
  property_name: string;
  room_id: string;
  room_name: string;
  rent_amount: number;
  start_date: string;
  end_date: string | null;
  external_staff: {
    "HIRE DATE": string | null;
    "TERMINATION DATE": string | null;
    "POSITION STATUS": string | null;
  };
}

/**
 * Generate billing records for a specific month using real database queries
 * Factors in external_staff POSITION STATUS, HIRE DATE, and TERMINATION DATE
 */
export async function generateBillingFromAssignments(
  year: number,
  month: number,
  zone = "America/Los_Angeles"
) {
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Query assignments with external_staff data for active staff
  const { data: staffAssignments, error } = await supabase
    .from('assignments')
    .select(`
      tenant_id,
      property_id,
      property_name,
      room_id,
      room_name,
      rent_amount,
      start_date,
      end_date,
      external_staff!inner (
        "HIRE DATE",
        "TERMINATION DATE",
        "POSITION STATUS"
      )
    `)
    .not('tenant_id', 'is', null)
    .or(`"POSITION STATUS".eq.Active,"POSITION STATUS".is.null`, { foreignTable: 'external_staff' })
    .or(`"TERMINATION DATE".is.null,"TERMINATION DATE".gte.${year}-${month.toString().padStart(2, '0')}-01`, { foreignTable: 'external_staff' });

  if (error) {
    console.error('Error fetching staff assignments:', error);
    throw error;
  }

  if (!staffAssignments || staffAssignments.length === 0) {
    console.log('No active staff assignments found for the month');
    return;
  }

  // Generate billing records for each staff assignment
  for (const assignment of (staffAssignments as AssignmentWithStaff[])) {
    const externalStaff = assignment.external_staff;
    
    // Use hire_date and termination_date from external_staff for billing logic
    const hireDate = externalStaff["HIRE DATE"];
    const terminationDate = externalStaff["TERMINATION DATE"];
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    if (include.firstWindow) {
      // Use raw SQL for upsert since billing table may not be in TypeScript types yet
      const { error: upsertError } = await (supabase as any).rpc('upsert_billing_record', {
        p_tenant_id: assignment.tenant_id,
        p_property_id: assignment.property_id,
        p_property_name: assignment.property_name,
        p_room_id: assignment.room_id,
        p_room_name: assignment.room_name,
        p_rent_amount: assignment.rent_amount,
        p_payment_status: 'unpaid',
        p_period_start: w1.start.toISODate()!,
        p_period_end: w1.end.toISODate()!,
        p_start_date: assignment.start_date,
        p_end_date: assignment.end_date,
      });
      
      if (upsertError) {
        console.error('Error upserting billing record (window 1):', upsertError);
      }
    }
    
    if (include.secondWindow) {
      // Use raw SQL for upsert since billing table may not be in TypeScript types yet
      const { error: upsertError } = await supabase.rpc('upsert_billing_record', {
        p_tenant_id: assignment.tenant_id,
        p_property_id: assignment.property_id,
        p_property_name: assignment.property_name,
        p_room_id: assignment.room_id,
        p_room_name: assignment.room_name,
        p_rent_amount: assignment.rent_amount,
        p_payment_status: 'unpaid',
        p_period_start: w2.start.toISODate()!,
        p_period_end: w2.end.toISODate()!,
        p_start_date: assignment.start_date,
        p_end_date: assignment.end_date,
      });
      
      if (upsertError) {
        console.error('Error upserting billing record (window 2):', upsertError);
      }
    }
  }
  
  console.log(`Generated billing records for ${year}-${month.toString().padStart(2, '0')}`);
}
