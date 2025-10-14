import { supabase } from "@/integration/supabase/client";

export interface ActiveStaffAssignment {
  tenantId: string;
  propertyId: string;
  roomId: string;
  rentAmount: number;
  startDate: string;
  endDate?: string | null;
}

/**
 * Helper function to convert MM/DD/YYYY text date to ISO YYYY-MM-DD format
 */
function convertToISODate(dateText: string | null | undefined): string | null {
  if (!dateText || dateText.trim() === '') return null;
  
  try {
    // Parse MM/DD/YYYY format
    const parts = dateText.split('/');
    if (parts.length !== 3) return null;
    
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Failed to convert date: ${dateText}`, error);
    return null;
  }
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
  try {
    // Try to get assignments data, but handle case where table doesn't exist or has issues
    let assignmentsData: any[] | null = null;
    let assignmentsError: any = null;
    
    try {
      const result = await supabase
        .from('assignments')
        .select(`
          tenant_id,
          property_id,
          room_id,
          rent_amount,
          start_date,
          end_date
        `)
        .not('tenant_id', 'is', null) as { data: any[] | null, error: any };
      
      assignmentsData = result.data;
      assignmentsError = result.error;
    } catch (error) {
      console.warn('Assignments table query failed:', error);
      assignmentsError = error;
    }

    // If assignments exist and query succeeded, use them
    if (!assignmentsError && assignmentsData && assignmentsData.length > 0) {
      console.log(`Found ${assignmentsData.length} assignments, fetching related data...`);
      
      // Get external staff data for the tenant IDs
      const tenantIds = assignmentsData.map(a => a.tenant_id).filter(Boolean);
      
      const { data: staffData, error: staffError } = await supabase
        .from('external_staff')
        .select('id, "HIRE DATE", "TERMINATION DATE", "POSITION STATUS"')
        .in('id', tenantIds) as { data: any[] | null, error: any };

      // Get property names
      const propertyIds = [...new Set(assignmentsData.map(a => a.property_id).filter(Boolean))];
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title')
        .in('id', propertyIds) as { data: any[] | null, error: any };

      // Get room names
      const roomIds = [...new Set(assignmentsData.map(a => a.room_id).filter(Boolean))];
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name')
        .in('id', roomIds) as { data: any[] | null, error: any };

      if (!staffError && staffData) {
        // Combine assignments with external staff data
        const result = assignmentsData.map(assignment => {
          const staff = staffData.find(s => s.id === assignment.tenant_id);
          const property = propertiesData?.find(p => p.id === assignment.property_id);
          const room = roomsData?.find(r => r.id === assignment.room_id);
          
          // Convert MM/DD/YYYY dates to ISO format
          const hireDateISO = convertToISODate(staff?.["HIRE DATE"]);
          const termDateISO = convertToISODate(staff?.["TERMINATION DATE"]);
          
          return {
            tenant_id: assignment.tenant_id,
            property_id: assignment.property_id,
            property_name: property?.title || 'Unknown Property',
            room_id: assignment.room_id,
            room_name: room?.name || 'Unknown Room',
            rent_amount: assignment.rent_amount || 0,
            start_date: assignment.start_date,
            end_date: assignment.end_date,
            hire_date: hireDateISO || assignment.start_date,
            termination_date: termDateISO || assignment.end_date,
            position_status: staff?.["POSITION STATUS"] || "Active"
          };
        });

        console.log(`Found ${result.length} active staff from assignments for billing generation`);
        return result;
      }
    }

    // If no assignments exist or assignments query failed, return empty array
    if (assignmentsError) {
      console.warn('Assignments table query failed:', assignmentsError);
      console.log('Cannot generate billing without valid assignments data');
    } else {
      console.warn('No assignments found in database');
      console.log('No staff are currently assigned to properties for billing');
    }
    
    return [];

  } catch (error) {
    console.error('Error fetching active staff:', error);
    return [];
  }
}

export async function getActiveStaffWithTransportationForMonth(year: number, month: number) {
  try {
    console.log(`🔍 Searching for transportation assignments for ${year}-${month}`);
    
    // First, let's check what assignments exist at all
    const { data: allAssignments, error: allError } = await supabase
      .from('assignments')
      .select('*') as { data: any[] | null, error: any };
    
    console.log(`📊 Total assignments found: ${allAssignments?.length || 0}`);
    if (allAssignments && allAssignments.length > 0) {
      console.log('📋 Sample assignment structure:', Object.keys(allAssignments[0]));
      console.log('🚌 Assignments with transportation_agreement = true (boolean):', 
        allAssignments.filter(a => a.transportation_agreement === true).length);
      console.log('🚌 Assignments with transportation_agreement = "true" (string):', 
        allAssignments.filter(a => a.transportation_agreement === "true").length);
      console.log('🚌 All transportation_agreement values:', 
        [...new Set(allAssignments.map(a => a.transportation_agreement))]);
      console.log('👤 Assignments with tenant_id:', 
        allAssignments.filter(a => a.tenant_id).length);
      console.log('💰 Assignments with transport_amount:', 
        allAssignments.filter(a => a.transport_amount).length);
      console.log('💰 All transport_amount values (first 5):', 
        allAssignments.slice(0, 5).map(a => a.transport_amount));
      console.log('✅ Assignments with BOTH transportation_agreement=true AND transport_amount:', 
        allAssignments.filter(a => (a.transportation_agreement === true || a.transportation_agreement === "true") && a.transport_amount).length);
      
      // Show sample transportation assignment
      const sampleTransport = allAssignments.find(a => a.transportation_agreement === true);
      if (sampleTransport) {
        console.log('🚌 Sample transportation assignment:', {
          tenant_id: sampleTransport.tenant_id,
          transportation_agreement: sampleTransport.transportation_agreement,
          transport_amount: sampleTransport.transport_amount,
          start_date: sampleTransport.start_date,
          end_date: sampleTransport.end_date
        });
      }
    }
    
    // Try to get assignments data with transportation agreement enabled
    let assignmentsData: any[] | null = null;
    let assignmentsError: any = null;
    
    try {
      const result = await supabase
        .from('assignments')
        .select(`
          tenant_id,
          property_id,
          room_id,
          rent_amount,
          transport_amount,
          start_date,
          end_date,
          transportation_agreement
        `)
        .or('transportation_agreement.eq.true,transportation_agreement.eq."true"')
        .not('tenant_id', 'is', null)
        .not('transport_amount', 'is', null) as { data: any[] | null, error: any };
      
      assignmentsData = result.data;
      assignmentsError = result.error;
      
      console.log(`🎯 Filtered transportation assignments query result: ${assignmentsData?.length || 0} records`);
      if (assignmentsData && assignmentsData.length > 0) {
        console.log('🚌 First transportation assignment:', assignmentsData[0]);
      }
    } catch (error) {
      console.warn('Transportation assignments table query failed:', error);
      assignmentsError = error;
    }

    // If assignments exist and query succeeded, use them
    if (!assignmentsError && assignmentsData && assignmentsData.length > 0) {
      console.log(`Found ${assignmentsData.length} transportation assignments, fetching related data...`);
      
      // Get external staff data for the tenant IDs
      const tenantIds = assignmentsData.map(a => a.tenant_id).filter(Boolean);
      
      const { data: staffData, error: staffError } = await supabase
        .from('external_staff')
        .select('id, "HIRE DATE", "TERMINATION DATE", "POSITION STATUS"')
        .in('id', tenantIds) as { data: any[] | null, error: any };

      // Get property names
      const propertyIds = [...new Set(assignmentsData.map(a => a.property_id).filter(Boolean))];
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title')
        .in('id', propertyIds) as { data: any[] | null, error: any };

      // Get room names
      const roomIds = [...new Set(assignmentsData.map(a => a.room_id).filter(Boolean))];
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name')
        .in('id', roomIds) as { data: any[] | null, error: any };

      if (!staffError && staffData) {
        // Combine assignments with external staff data
        const result = assignmentsData.map(assignment => {
          const staff = staffData.find(s => s.id === assignment.tenant_id);
          const property = propertiesData?.find(p => p.id === assignment.property_id);
          const room = roomsData?.find(r => r.id === assignment.room_id);
          
          // Convert MM/DD/YYYY dates to ISO format
          const hireDateISO = convertToISODate(staff?.["HIRE DATE"]);
          const termDateISO = convertToISODate(staff?.["TERMINATION DATE"]);
          
          console.log(`📅 Converting dates for staff ${assignment.tenant_id}:`, {
            hire_date_raw: staff?.["HIRE DATE"],
            hire_date_iso: hireDateISO,
            term_date_raw: staff?.["TERMINATION DATE"],
            term_date_iso: termDateISO
          });
          
          return {
            tenant_id: assignment.tenant_id,
            property_id: assignment.property_id,
            property_name: property?.title || 'Transportation Service',
            room_id: assignment.room_id || null, // Allow null for transportation-only staff
            room_name: room?.name || null, // Allow null for transportation-only staff
            rent_amount: assignment.rent_amount || 0,
            transport_amount: assignment.transport_amount || 150.00, // Default transportation rate
            start_date: assignment.start_date,
            end_date: assignment.end_date,
            hire_date: hireDateISO || assignment.start_date,
            termination_date: termDateISO || assignment.end_date,
            position_status: staff?.["POSITION STATUS"] || "Active",
            transportation_agreement: assignment.transportation_agreement
          };
        });

        console.log(`Found ${result.length} active staff with transportation for billing generation`);
        return result;
      }
    }

    // If no transportation assignments exist or assignments query failed, return empty array
    if (assignmentsError) {
      console.warn('Transportation assignments table query failed:', assignmentsError);
      console.log('Cannot generate transportation billing without valid assignments data');
    } else {
      console.warn('No transportation assignments found in database');
      console.log('No staff are currently assigned transportation for billing');
    }
    
    return [];

  } catch (error) {
    console.error('Error fetching active staff with transportation:', error);
    return [];
  }
}

/**
 * Fetch pending security deposits for staff with payroll deduction
 * Returns staff with pending security deposits that need to be billed
 */
export async function getPendingSecurityDeposits(
  monthStart: string
): Promise<any[]> {
  try {
    console.log(`🔍 Searching for pending security deposits for ${monthStart}`);
    
    // Query security_deposits joined with assignments and external_staff
    const { data: deposits, error } = await supabase
      .from('security_deposits')
      .select(`
        id,
        assignment_id,
        total_amount,
        payment_method,
        payment_status,
        assignments!inner (
          tenant_id,
          tenant_name,
          property_id,
          property_name,
          room_id,
          room_name,
          start_date,
          end_date,
          status
        )
      `)
      .eq('payment_method', 'payroll_deduction')
      .eq('payment_status', 'pending');

    if (error) {
      console.error('❌ Error fetching security deposits:', error);
      return [];
    }

    if (!deposits || deposits.length === 0) {
      console.log('No pending security deposits found');
      return [];
    }

    console.log(`📊 Total pending deposits found: ${deposits.length}`);

    // Fetch external staff data for hire/termination dates
    const tenantIds = deposits
      .map((d: any) => d.assignments?.tenant_id)
      .filter(Boolean);

    const { data: staffData, error: staffError } = await supabase
      .from('external_staff')
      .select('id, "HIRE DATE", "TERMINATION DATE"')
      .in('id', tenantIds);

    if (staffError) {
      console.error('❌ Error fetching staff data:', staffError);
      return [];
    }

    // Create a map of staff data by ID
    const staffMap = new Map(
      staffData?.map((s: any) => [s.id, s]) || []
    );

    // Process deposits and convert dates
    const result = deposits
      .filter((deposit: any) => {
        const assignment = deposit.assignments;
        return assignment && assignment.status === 'Active' && assignment.tenant_id;
      })
      .map((deposit: any) => {
        const assignment = deposit.assignments;
        const staff = staffMap.get(assignment.tenant_id);

        // Convert hire and termination dates from MM/DD/YYYY to ISO format
        const hireDateISO = convertToISODate(staff?.["HIRE DATE"]);
        const termDateISO = convertToISODate(staff?.["TERMINATION DATE"]);

        console.log(`📅 Converting dates for deposit ${deposit.id}:`, {
          hire_date_raw: staff?.["HIRE DATE"],
          hire_date_iso: hireDateISO,
          term_date_raw: staff?.["TERMINATION DATE"],
          term_date_iso: termDateISO
        });

        return {
          deposit_id: deposit.id,
          tenant_id: assignment.tenant_id,
          tenant_name: assignment.tenant_name,
          property_id: assignment.property_id,
          property_name: assignment.property_name,
          room_id: assignment.room_id,
          room_name: assignment.room_name,
          deposit_amount: deposit.total_amount || 500.00, // Default $500
          start_date: assignment.start_date,
          end_date: assignment.end_date,
          hire_date: hireDateISO || assignment.start_date,
          termination_date: termDateISO || assignment.end_date
        };
      });

    console.log(`Found ${result.length} pending security deposits for billing generation`);
    return result;

  } catch (error) {
    console.error('Error fetching pending security deposits:', error);
    return [];
  }
}

export async function upsertBillingRow(billingData: {
  tenant_id: string;
  property_id: string;
  property_name?: string; // Not stored in DB, just for logging
  room_id: string | null;
  room_name?: string | null; // Not stored in DB, just for logging
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
    property_name: billingData.property_name,
    room_id: billingData.room_id,
    room_name: billingData.room_name,
    amount: billingData.rent_amount,
    billing_type: billingData.billing_type,
    period: `${billingData.period_start} to ${billingData.period_end}`
  });

  // Check if tenant_id exists in external_staff
  const { data: staffCheck, error: staffCheckError } = await supabase
    .from('external_staff')
    .select('id')
    .eq('id', billingData.tenant_id)
    .single();

  if (staffCheckError || !staffCheck) {
    console.error(`❌ tenant_id ${billingData.tenant_id} does NOT exist in external_staff table`);
    throw new Error(`Invalid tenant_id: ${billingData.tenant_id} not found in external_staff table`);
  } else {
    console.log(`✅ tenant_id ${billingData.tenant_id} exists in external_staff table`);
  }

  // Check room_id requirements based on billing type
  if (billingData.billing_type === 'housing') {
    // Housing billing requires room_id
    if (!billingData.room_id) {
      console.error(`❌ room_id is required for housing billing but not provided`);
      throw new Error(`room_id is required for housing billing records`);
    }

    const { data: roomCheck, error: roomCheckError } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', billingData.room_id)
      .single();

    if (roomCheckError || !roomCheck) {
      console.error(`❌ room_id ${billingData.room_id} does NOT exist in rooms table`);
      throw new Error(`Invalid room_id: ${billingData.room_id} not found in rooms table. Cannot create housing billing record.`);
    } else {
      console.log(`✅ room_id ${billingData.room_id} exists in rooms table`);
    }
  } else if (billingData.billing_type === 'transportation') {
    // Transportation billing doesn't require room_id
    if (billingData.room_id) {
      // If room_id is provided for transportation, validate it exists
      const { data: roomCheck, error: roomCheckError } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', billingData.room_id)
        .single();

      if (roomCheckError || !roomCheck) {
        console.warn(`⚠️ room_id ${billingData.room_id} provided for transportation billing but doesn't exist. Setting to null.`);
        billingData.room_id = null;
      } else {
        console.log(`✅ room_id ${billingData.room_id} exists in rooms table (optional for transportation)`);
      }
    } else {
      console.log(`ℹ️ No room_id provided for transportation billing (not required)`);
    }
  }

  try {
    // Remove property_name and room_name as they don't exist in the billing table schema
    const { property_name, room_name, ...dbBillingData } = billingData;
    
    const { data, error } = await (supabase
      .from('billing') as any)
      .upsert(dbBillingData, {
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
