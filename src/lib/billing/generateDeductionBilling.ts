import { DateTime } from "luxon";
import { getBillingWindowsForMonth, inclusionForMonth } from "./semimonthly";
import { supabase } from "@/integration/supabase/client";
import { BillingType } from "@/types/billing";
import { 
  generateDeductionSchedule, 
  createBillingDeductions, 
  requiresDeductionScheduling,
  getDeductionCount 
} from "./deductionScheduling";

export interface DeductionBillingData {
  tenant_id: string;
  property_id: string;
  room_id: string;
  rent_amount: number;
  payment_status: string;
  billing_type: BillingType;
  period_start: string;
  period_end: string;
  start_date: string;
  end_date?: string | null;
  total_deductions: number;
  deduction_status: string;
}

/**
 * Get active staff with security deposit agreements
 */
export async function getActiveStaffWithSecurityDeposit(year: number, month: number) {
  console.log(`🏦 Fetching staff with security deposit agreements for ${year}-${month}`);
  
  try {
    const { data: assignments, error } = await (supabase
      .from('assignments') as any)
      .select(`
        tenant_id,
        property_id,
        room_id,
        rent_amount,
        start_date,
        end_date,
        housing_agreement,
        external_staff!inner (
          id,
          "HIRE DATE",
          "TERMINATION DATE", 
          "POSITION STATUS"
        )
      `)
      .eq('housing_agreement', true) // Security deposits are tied to housing agreements
      .not('tenant_id', 'is', null);

    if (error) {
      console.error('Error fetching security deposit assignments:', error);
      throw new Error(`Failed to fetch security deposit assignments: ${error.message}`);
    }

    console.log(`🏦 Found ${assignments?.length || 0} assignments with housing agreements for security deposits`);

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Filter based on employment status and date overlap
    const validAssignments = assignments.filter((assignment: any) => {
      const staff = assignment.external_staff;
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

      return true;
    });

    console.log(`✅ ${validAssignments.length} valid security deposit assignments found`);
    return validAssignments;
  } catch (error) {
    console.error('Error in getActiveStaffWithSecurityDeposit:', error);
    throw error;
  }
}

/**
 * Get active staff with bus card agreements
 */
export async function getActiveStaffWithBusCard(year: number, month: number) {
  console.log(`🚌 Fetching staff with bus card agreements for ${year}-${month}`);
  
  try {
    const { data: assignments, error } = await (supabase
      .from('assignments') as any)
      .select(`
        tenant_id,
        property_id,
        room_id,
        rent_amount,
        start_date,
        end_date,
        bus_card_agreement,
        external_staff!inner (
          id,
          "HIRE DATE",
          "TERMINATION DATE", 
          "POSITION STATUS"
        )
      `)
      .eq('bus_card_agreement', true)
      .not('tenant_id', 'is', null);

    if (error) {
      console.error('Error fetching bus card assignments:', error);
      throw new Error(`Failed to fetch bus card assignments: ${error.message}`);
    }

    console.log(`🚌 Found ${assignments?.length || 0} assignments with bus card agreements`);

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Filter based on employment status and date overlap
    const validAssignments = assignments.filter((assignment: any) => {
      const staff = assignment.external_staff;
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

      return true;
    });

    console.log(`✅ ${validAssignments.length} valid bus card assignments found`);
    return validAssignments;
  } catch (error) {
    console.error('Error in getActiveStaffWithBusCard:', error);
    throw error;
  }
}

/**
 * Create deduction-based billing record with scheduled deductions
 */
export async function upsertDeductionBillingRow(billingData: DeductionBillingData): Promise<any> {
  console.log(`💰 Upserting deduction billing row:`, {
    tenant_id: billingData.tenant_id,
    property_id: billingData.property_id,
    room_id: billingData.room_id,
    amount: billingData.rent_amount,
    type: billingData.billing_type,
    total_deductions: billingData.total_deductions,
    period: `${billingData.period_start} to ${billingData.period_end}`
  });

  try {
    // First, create or update the billing record
    const { data: billingRecord, error: billingError } = await (supabase
      .from('billing') as any)
      .upsert({
        tenant_id: billingData.tenant_id,
        property_id: billingData.property_id,
        room_id: billingData.room_id,
        rent_amount: billingData.rent_amount,
        payment_status: billingData.payment_status,
        billing_type: billingData.billing_type,
        period_start: billingData.period_start,
        period_end: billingData.period_end,
        start_date: billingData.start_date,
        end_date: billingData.end_date,
        total_deductions: billingData.total_deductions,
        deduction_status: billingData.deduction_status,
      }, {
        onConflict: 'tenant_id,period_start,period_end,billing_type'
      })
      .select()
      .single();

    if (billingError) {
      console.error('❌ Error upserting billing record:', billingError);
      throw new Error(`Failed to upsert billing record: ${billingError.message}`);
    }

    // If this billing type requires deduction scheduling, create the deductions
    if (requiresDeductionScheduling(billingData.billing_type)) {
      // Check if deductions already exist
      const { data: existingDeductions } = await (supabase
        .from('billing_deductions') as any)
        .select('id')
        .eq('billing_id', billingRecord.id);

      if (!existingDeductions || existingDeductions.length === 0) {
        // Generate deduction schedule
        const deductionSchedule = generateDeductionSchedule(
          billingData.rent_amount,
          billingData.billing_type,
          new Date(billingData.start_date)
        );

        // Create deductions
        if (deductionSchedule.length > 0) {
          await createBillingDeductions(billingRecord.id, deductionSchedule);
          console.log(`✅ Created ${deductionSchedule.length} deductions for ${billingData.billing_type} billing`);
        }
      } else {
        console.log(`ℹ️ Deductions already exist for billing record ${billingRecord.id}`);
      }
    }

    console.log('✅ Successfully upserted deduction billing row:', billingRecord?.id);
    return billingRecord || null;
  } catch (error) {
    console.error('💥 Deduction billing upsert failed:', error);
    throw error;
  }
}

/**
 * Generate security deposit billing for a month
 */
export async function generateSecurityDepositBillingForMonth(
  year: number,
  month: number,
  securityDepositAmount: number = 500, // Default $500 security deposit
  zone = "America/Los_Angeles"
) {
  console.log(`🏦 Generating security deposit billing for ${year}-${month}`);
  
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Pull staff with housing agreements (for security deposits)
  const staff = await getActiveStaffWithSecurityDeposit(year, month);
  console.log(`🏦 Processing ${staff.length} staff members with security deposit requirements`);

  let generatedCount = 0;

  for (const s of staff) {
    // Use hire_date and termination_date from external_staff for billing logic
    const staffData = s.external_staff;
    const hireDate = staffData["HIRE DATE"] || s.start_date;
    const terminationDate = staffData["TERMINATION DATE"] || s.end_date;
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    // Security deposits are typically charged once when staff starts
    // We'll use the first window for new staff
    if (include.firstWindow) {
      await upsertDeductionBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        rent_amount: securityDepositAmount,
        payment_status: "unpaid",
        billing_type: "security_deposit",
        period_start: w1.start.toISODate()!,
        period_end: w1.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
        total_deductions: getDeductionCount("security_deposit"),
        deduction_status: "Active",
      });
      generatedCount++;
    }
  }

  console.log(`🏦 Generated ${generatedCount} security deposit billing records for ${year}-${month}`);
  return generatedCount;
}

/**
 * Generate bus card billing for a month
 */
export async function generateBusCardBillingForMonth(
  year: number,
  month: number,
  busCardAmount: number = 50, // Default $50 bus card
  zone = "America/Los_Angeles"
) {
  console.log(`🚌 Generating bus card billing for ${year}-${month}`);
  
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Pull staff with bus card agreements
  const staff = await getActiveStaffWithBusCard(year, month);
  console.log(`🚌 Processing ${staff.length} staff members with bus card requirements`);

  let generatedCount = 0;

  for (const s of staff) {
    // Use hire_date and termination_date from external_staff for billing logic
    const staffData = s.external_staff;
    const hireDate = staffData["HIRE DATE"] || s.start_date;
    const terminationDate = staffData["TERMINATION DATE"] || s.end_date;
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    // Bus cards are typically charged once when staff starts
    // We'll use the first window for new staff
    if (include.firstWindow) {
      await upsertDeductionBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        rent_amount: busCardAmount,
        payment_status: "unpaid",
        billing_type: "bus_card",
        period_start: w1.start.toISODate()!,
        period_end: w1.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
        total_deductions: getDeductionCount("bus_card"),
        deduction_status: "Active",
      });
      generatedCount++;
    }
  }

  console.log(`🚌 Generated ${generatedCount} bus card billing records for ${year}-${month}`);
  return generatedCount;
}

// Enhanced combined function to generate all billing types
export async function generateAllBillingTypesForMonth(
  year: number,
  month: number,
  options: {
    transportRate?: number;
    securityDepositAmount?: number;
    busCardAmount?: number;
  } = {},
  zone = "America/Los_Angeles"
) {
  console.log(`💰 Generating all billing types (housing + transportation + security deposits + bus cards) for ${year}-${month}`);
  
  const {
    transportRate = 200,
    securityDepositAmount = 500,
    busCardAmount = 50
  } = options;
  
  // Generate housing billing (existing logic)
  const { generateBillingForMonth } = await import('./generateForMonth');
  await generateBillingForMonth(year, month, zone);
  
  // Generate transportation billing
  const { generateTransportationBillingForMonth } = await import('./generateTransportationBilling');
  const transportCount = await generateTransportationBillingForMonth(year, month, transportRate, zone);
  
  // Generate security deposit billing
  const securityDepositCount = await generateSecurityDepositBillingForMonth(year, month, securityDepositAmount, zone);
  
  // Generate bus card billing
  const busCardCount = await generateBusCardBillingForMonth(year, month, busCardAmount, zone);
  
  const totalDeductionRecords = securityDepositCount + busCardCount;
  
  console.log(`💰 Completed all billing generation for ${year}-${month}:`);
  console.log(`  - Transportation records: ${transportCount}`);
  console.log(`  - Security deposit records: ${securityDepositCount}`);
  console.log(`  - Bus card records: ${busCardCount}`);
  console.log(`  - Total deduction-based records: ${totalDeductionRecords}`);
  
  return {
    transportCount,
    securityDepositCount,
    busCardCount,
    totalDeductionRecords
  };
}
