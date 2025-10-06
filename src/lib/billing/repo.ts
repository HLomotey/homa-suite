import { supabase } from "@/integration/supabase/client";

export interface ActiveStaffAssignment {
  tenantId: string;
  propertyId: string;
  roomId: string;
  rentAmount: number;
  startDate: string;
  endDate?: string | null;
}

// Repository functions for billing data
export async function getActiveStaffForDateRange(
  startDate: string,
  endDate: string
): Promise<ActiveStaffAssignment[]> {
  console.log(`🔍 Fetching assignments for billing period: ${startDate} to ${endDate}`);
  
  try {
    // Query assignments table directly using start_date and end_date for filtering
    const { data: assignments, error } = await (supabase
      .from('assignments') as any)
      .select('*')
      .not('tenant_id', 'is', null)
      .or(`end_date.is.null,end_date.gte.${startDate}`)
      .lte('start_date', endDate);

    if (error) {
      console.error('Error fetching assignments:', error);
      throw new Error(`Failed to fetch assignments: ${error.message}`);
    }

    console.log(`📋 Found ${assignments?.length || 0} assignments matching date criteria`);
    console.log('Sample assignment data:', assignments?.slice(0, 2));

    if (!assignments || assignments.length === 0) {
      console.log('❌ No assignments found for the specified date range');
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

    // Filter assignments based on employment status
    const validAssignments = assignments.filter((assignment: any) => {
      console.log(`🔍 Validating assignment:`, {
        tenant_id: assignment.tenant_id,
        tenant_name: assignment.tenant_name,
        property: assignment.property_name,
        room: assignment.room_name,
        assignment_period: `${assignment.start_date} to ${assignment.end_date || 'ongoing'}`,
        rent: assignment.rent_amount
      });
      
      const staff = staffMap.get(assignment.tenant_id);
      if (!staff) {
        console.log(`❌ No external staff record found for tenant_id: ${assignment.tenant_id}`);
        return false;
      }

      // Check if staff is active (not terminated)
      const positionStatus = staff["POSITION STATUS"];
      const isActive = positionStatus === 'Active' || positionStatus === 'A - Active' || !positionStatus;
      const isTerminated = positionStatus === 'Terminated' || positionStatus === 'T - Terminated';
      
      if (isTerminated || !isActive) {
        console.log(`❌ Staff not active: ${positionStatus}`);
        return false;
      }

      // Check employment overlap with billing period
      const hireDate = staff["HIRE DATE"];
      const termDate = staff["TERMINATION DATE"];
      
      if (hireDate && hireDate > endDate) {
        console.log(`❌ Hire date ${hireDate} after billing end ${endDate}`);
        return false;
      }
      if (termDate && termDate < startDate) {
        console.log(`❌ Term date ${termDate} before billing start ${startDate}`);
        return false;
      }

      console.log(`✅ Assignment validated for billing:`, {
        staff_name: assignment.tenant_name,
        employment_period: `${hireDate || 'N/A'} to ${termDate || 'Active'}`,
        assignment_period: `${assignment.start_date} to ${assignment.end_date || 'ongoing'}`,
        billing_period: `${startDate} to ${endDate}`
      });
      return true;
    });

    // Map to the required format with biweekly rent calculation
    const activeStaff = validAssignments.map((assignment: any) => ({
      tenantId: assignment.tenant_id,
      propertyId: assignment.property_id,
      roomId: assignment.room_id,
      rentAmount: (assignment.rent_amount || 0) / 2, // Convert monthly to biweekly
      startDate: assignment.start_date,
      endDate: assignment.end_date
    }));

    console.log(`🎯 Final billing records to create: ${activeStaff.length}`);
    activeStaff.forEach((staff, index) => {
      console.log(`  ${index + 1}. ${staff.propertyId} - ${staff.roomId} - $${staff.rentAmount}`);
    });
    
    return activeStaff;
  } catch (error) {
    console.error('Error in getActiveStaffForDateRange:', error);
    throw error;
  }
}

export async function getActiveStaffForMonth(year: number, month: number) {
  // Mock data - replace with actual query that joins assignments with external_staff
  // Query should be:
  // SELECT DISTINCT
  //   a.tenant_id,
  //   a.property_id,
  //   a.property_name,
  //   a.room_id,
  //   a.room_name,
  //   a.rent_amount,
  //   a.start_date,
  //   a.end_date,
  //   es."HIRE DATE" as hire_date,
  //   es."TERMINATION DATE" as termination_date,
  //   es."POSITION STATUS" as position_status
  // FROM assignments a
  // INNER JOIN external_staff es ON es.id = a.tenant_id
  // WHERE a.tenant_id IS NOT NULL
  //   AND (es."POSITION STATUS" = 'Active' OR es."POSITION STATUS" IS NULL)
  //   AND (es."TERMINATION DATE" IS NULL OR es."TERMINATION DATE" >= '${year}-${month.toString().padStart(2, '0')}-01')
  
  return [
    {
      tenant_id: "tenant-1",
      property_id: "prop-1",
      property_name: "Downtown Hotel",
      room_id: "room-1",
      room_name: "Room 101",
      rent_amount: 1200.00,
      start_date: "2025-08-01",
      end_date: null,
      hire_date: "2025-08-01",
      termination_date: null,
      position_status: "Active"
    },
    {
      tenant_id: "tenant-2", 
      property_id: "prop-2",
      property_name: "Uptown Suites",
      room_id: "room-2",
      room_name: "Room 205",
      rent_amount: 1500.00,
      start_date: "2025-07-15",
      end_date: "2025-09-10",
      hire_date: "2025-07-15",
      termination_date: "2025-09-10",
      position_status: "Terminated"
    }
  ];
}

export async function upsertBillingRow(billingData: {
  tenant_id: string;
  property_id: string;
  room_id: string;
  rent_amount: number;
  payment_status: string;
  billing_type: string;
  period_start: string;
  period_end: string;
  start_date: string;
  end_date?: string | null;
}): Promise<any> {
  console.log('💾 Upserting billing row:', {
    tenant_id: billingData.tenant_id,
    property_id: billingData.property_id,
    room_id: billingData.room_id,
    amount: billingData.rent_amount,
    period: `${billingData.period_start} to ${billingData.period_end}`
  });

  try {
    const { data, error } = await (supabase
      .from('billing') as any)
      .upsert(billingData, {
        onConflict: 'tenant_id,period_start,period_end'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error upserting billing row:', error);
      throw new Error(`Failed to upsert billing row: ${error.message}`);
    }

    console.log('✅ Successfully upserted billing row:', data?.id);
    return data;
  } catch (error) {
    console.error('💥 Upsert billing row failed:', error);
    throw error;
  }
}
