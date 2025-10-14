import { DateTime } from "luxon";
import { getBillingWindowsForMonth, inclusionForMonth } from "./semimonthly";
import { upsertBillingRow, getActiveStaffForMonth, getActiveStaffWithTransportationForMonth, getPendingSecurityDeposits } from "./repo"; 

export async function generateBillingForMonth(
  year: number,
  month: number,
  billingPeriod: 'first' | 'second' | 'both' = 'both',
  zone = "America/Los_Angeles"
) {
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Pull staff with hire/termination, property/room, and rent info
  const staff = await getActiveStaffForMonth(year, month);

  if (staff.length === 0) {
    console.warn(`No active staff found for ${year}-${month}. This could be because:`);
    console.warn('1. No assignments exist in the assignments table');
    console.warn('2. No external_staff records match the assignment tenant_ids');
    console.warn('3. All staff have termination dates before the billing period');
    console.warn('4. The assignments table does not exist or has schema issues');
    throw new Error(`No staff assignments found for ${year}-${month.toString().padStart(2, '0')}. Please create staff assignments in the assignments table before generating billing.`);
  }

  console.log(`Processing billing for ${staff.length} staff members`);

  for (const s of staff) {
    // Use hire_date and termination_date from external_staff for billing logic
    // If external_staff fields are available, use them; otherwise fall back to assignment dates
    const hireDate = s.hire_date || s.start_date;
    const terminationDate = s.termination_date || s.end_date;
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    // Generate billing based on selected period
    if ((billingPeriod === 'first' || billingPeriod === 'both') && include.firstWindow) {
      await upsertBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        rent_amount: s.rent_amount / 2, // Convert monthly to biweekly
        payment_status: "unpaid",
        billing_type: "housing",
        period_start: w1.start.toISODate()!,
        period_end: w1.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
      });
    }
    if ((billingPeriod === 'second' || billingPeriod === 'both') && include.secondWindow) {
      await upsertBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        rent_amount: s.rent_amount / 2, // Convert monthly to biweekly
        payment_status: "unpaid",
        billing_type: "housing",
        period_start: w2.start.toISODate()!,
        period_end: w2.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
      });
    }
  }
}

export async function generateTransportationBillingForMonth(
  year: number,
  month: number,
  billingPeriod: 'first' | 'second' | 'both' = 'both',
  transportationRate: number = 150.00, // Default transportation rate per month
  zone = "America/Los_Angeles"
): Promise<number> {
  console.log(`🚀 STARTING TRANSPORTATION BILLING GENERATION for ${year}-${month}, period: ${billingPeriod}`);
  
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Pull staff with transportation assignments
  const staff = await getActiveStaffWithTransportationForMonth(year, month);

  if (staff.length === 0) {
    console.warn(`No active staff with transportation found for ${year}-${month}. This could be because:`);
    console.warn('1. No assignments exist with transportation_agreement = true');
    console.warn('2. No external_staff records match the assignment tenant_ids');
    console.warn('3. All staff have termination dates before the billing period');
    console.warn('4. The assignments table does not exist or has schema issues');
    throw new Error(`No staff with transportation assignments found for ${year}-${month.toString().padStart(2, '0')}. Please create staff assignments with transportation enabled before generating billing.`);
  }

  console.log(`Processing transportation billing for ${staff.length} staff members`);

  let billingRecordsCreated = 0;

  for (const s of staff) {
    // Convert transportation_agreement to boolean (handle both string and boolean values)
    const hasTransportationAgreement = s.transportation_agreement === true || s.transportation_agreement === "true";
    
    if (!hasTransportationAgreement) {
      console.log(`⏭️ Skipping ${s.tenant_id} - no transportation agreement`);
      continue;
    }
    
    console.log(`👤 Processing staff ${s.tenant_id}:`, {
      hire_date: s.hire_date,
      start_date: s.start_date,
      termination_date: s.termination_date,
      transportation_agreement: s.transportation_agreement,
      hasTransportationAgreement,
      transport_amount: s.transport_amount,
      billingMonth: `${year}-${month}`
    });
    
    // Use hire_date and termination_date from external_staff for billing logic
    // If external_staff fields are available, use them; otherwise fall back to assignment dates
    const hireDate = s.hire_date || s.start_date;
    const terminationDate = s.termination_date || s.end_date;
    
    console.log(`🔍 Calling inclusionForMonth with:`, {
      monthStart: now.toISODate(),
      hireDate,
      terminationDate,
      billingWindows: {
        window1: `${w1.start.toISODate()} to ${w1.end.toISODate()}`,
        window2: `${w2.start.toISODate()} to ${w2.end.toISODate()}`
      }
    });
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    console.log(`📅 Billing periods for ${s.tenant_id}:`, include);
    
    // Use transportation amount from assignment or default rate
    // Note: transport_amount is already a bi-weekly amount, no need to divide
    const transportAmount = s.transport_amount || transportationRate;
    
    // Generate billing based on selected period
    if ((billingPeriod === 'first' || billingPeriod === 'both') && include.firstWindow) {
      try {
        await upsertBillingRow({
          tenant_id: s.tenant_id,
          property_id: s.property_id,
          property_name: s.property_name || 'Transportation Service',
          room_id: s.room_id, // Can be null for transportation-only staff
          room_name: s.room_name, // Can be null for transportation-only staff
          rent_amount: transportAmount, // Use bi-weekly amount directly
          payment_status: "unpaid",
          billing_type: "transportation",
          period_start: w1.start.toISODate()!,
          period_end: w1.end.toISODate()!,
          start_date: s.start_date,
          end_date: s.end_date,
        });
        billingRecordsCreated++;
      } catch (error) {
        console.error(`❌ Failed to create first period billing for staff ${s.tenant_id}:`, error);
        // Continue processing other staff members
      }
    }
    if ((billingPeriod === 'second' || billingPeriod === 'both') && include.secondWindow) {
      try {
        await upsertBillingRow({
          tenant_id: s.tenant_id,
          property_id: s.property_id,
          property_name: s.property_name || 'Transportation Service',
          room_id: s.room_id, // Can be null for transportation-only staff
          room_name: s.room_name, // Can be null for transportation-only staff
          rent_amount: transportAmount, // Use bi-weekly amount directly
          payment_status: "unpaid",
          billing_type: "transportation",
          period_start: w2.start.toISODate()!,
          period_end: w2.end.toISODate()!,
          start_date: s.start_date,
          end_date: s.end_date,
        });
        billingRecordsCreated++;
      } catch (error) {
        console.error(`❌ Failed to create second period billing for staff ${s.tenant_id}:`, error);
        // Continue processing other staff members
      }
    }
  }

  console.log(`Created ${billingRecordsCreated} transportation billing records`);
  return billingRecordsCreated;
}

/**
 * Generate security deposit billing for a specific month
 * Creates bi-weekly billing records for staff with pending security deposits
 */
export async function generateSecurityDepositBillingForMonth(
  year: number,
  month: number,
  billingPeriod: 'first' | 'second' | 'both' = 'both',
  zone = "America/Los_Angeles"
) {
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);
  const monthStart = now.toISODate()!;

  // Fetch pending security deposits
  const deposits = await getPendingSecurityDeposits(monthStart);

  if (deposits.length === 0) {
    console.warn(`No pending security deposits found for ${year}-${month}`);
    throw new Error(`No pending security deposits found for ${year}-${month.toString().padStart(2, '0')}.`);
  }

  console.log(`Processing security deposit billing for ${deposits.length} staff members`);

  let billingRecordsCreated = 0;

  for (const d of deposits) {
    const hireDate = d.hire_date || d.start_date;
    const terminationDate = d.termination_date || d.end_date;

    console.log(`👤 Processing deposit for staff ${d.tenant_id}:`, {
      hire_date: hireDate,
      start_date: d.start_date,
      termination_date: terminationDate,
      deposit_amount: d.deposit_amount,
      hasDepositAmount: !!d.deposit_amount
    });

    console.log(`🔍 Calling inclusionForMonth with:`, {
      monthStart,
      hireDate,
      terminationDate,
      billingWindows: {
        window1: `${w1.start.toISODate()} to ${w1.end.toISODate()}`,
        window2: `${w2.start.toISODate()} to ${w2.end.toISODate()}`
      }
    });
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    
    console.log(`📅 Billing periods for ${d.tenant_id}:`, include);
    
    // Use deposit amount from security_deposits table
    // Note: deposit_amount is already a bi-weekly amount, no need to divide
    const depositAmount = d.deposit_amount || 500.00;
    
    // Generate billing based on selected period
    if ((billingPeriod === 'first' || billingPeriod === 'both') && include.firstWindow) {
      try {
        await upsertBillingRow({
          tenant_id: d.tenant_id,
          property_id: d.property_id,
          property_name: d.property_name || 'Security Deposit',
          room_id: d.room_id,
          room_name: d.room_name,
          rent_amount: depositAmount, // Use bi-weekly deposit amount directly
          payment_status: "unpaid",
          billing_type: "security_deposit",
          period_start: w1.start.toISODate()!,
          period_end: w1.end.toISODate()!,
          start_date: d.start_date,
          end_date: d.end_date,
        });
        billingRecordsCreated++;
      } catch (error) {
        console.error(`❌ Failed to create first period billing for deposit ${d.deposit_id}:`, error);
        // Continue processing other deposits
      }
    }
    if ((billingPeriod === 'second' || billingPeriod === 'both') && include.secondWindow) {
      try {
        await upsertBillingRow({
          tenant_id: d.tenant_id,
          property_id: d.property_id,
          property_name: d.property_name || 'Security Deposit',
          room_id: d.room_id,
          room_name: d.room_name,
          rent_amount: depositAmount, // Use bi-weekly deposit amount directly
          payment_status: "unpaid",
          billing_type: "security_deposit",
          period_start: w2.start.toISODate()!,
          period_end: w2.end.toISODate()!,
          start_date: d.start_date,
          end_date: d.end_date,
        });
        billingRecordsCreated++;
      } catch (error) {
        console.error(`❌ Failed to create second period billing for deposit ${d.deposit_id}:`, error);
        // Continue processing other deposits
      }
    }
  }

  console.log(`Created ${billingRecordsCreated} security deposit billing records`);
  return billingRecordsCreated;
}
