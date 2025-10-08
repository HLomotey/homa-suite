import { DateTime } from "luxon";
import { upsertBillingRow, getActiveStaffForDateRange } from "./repo";

export interface CustomBillingWindow {
  start: DateTime;
  end: DateTime;
  label: string;
}

/**
 * Generate billing for a custom date range
 */
export async function generateBillingForDateRange(
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  zone = "America/Los_Angeles"
) {
  console.log(`🗓️ Generating billing for: ${startDate} to ${endDate}`);
  
  const start = DateTime.fromISO(startDate, { zone }).startOf("day");
  const end = DateTime.fromISO(endDate, { zone }).startOf("day");

  console.log(`📅 Parsed dates:`, {
    startDate,
    endDate,
    startParsed: start.toISODate(),
    endParsed: end.toISODate(),
    startValid: start.isValid,
    endValid: end.isValid
  });

  if (!start.isValid || !end.isValid) {
    throw new Error(`Invalid date format. Start: ${startDate}, End: ${endDate}`);
  }

  if (start > end) {
    throw new Error(`Start date (${startDate}) must be before or equal to end date (${endDate})`);
  }

  const window: CustomBillingWindow = {
    start,
    end,
    label: `${start.toFormat('MMM dd')} - ${end.toFormat('MMM dd, yyyy')}`
  };

  // Get staff active during this period
  const staff = await getActiveStaffForDateRange(startDate, endDate);

  const results = [];

  console.log(`📆 Processing ${staff.length} staff assignments for billing...`);

  for (const s of staff) {
    console.log(`🔍 Processing staff assignment:`, {
      tenantId: s.tenantId,
      propertyId: s.propertyId,
      roomId: s.roomId,
      assignmentPeriod: `${s.startDate} to ${s.endDate || 'ongoing'}`,
      rentAmount: s.rentAmount / 2, // Convert monthly to biweekly
    });

    // For assignment-based billing, we use the assignment dates directly
    // The employment validation was already done in getActiveStaffForDateRange
    const billingRecord = await upsertBillingRow({
      tenant_id: s.tenantId,
      property_id: s.propertyId,
      room_id: s.roomId,
      rent_amount: s.rentAmount, // Already halved in repo.ts
      payment_status: "unpaid",
      period_start: startDate,
      period_end: endDate,
      start_date: s.startDate,
      end_date: s.endDate,
    });

    console.log(`✅ Created billing record for ${s.propertyId} - ${s.roomId}`);

    results.push({
      staff: s,
      billing: billingRecord,
      window: window.label
    });
  }

  console.log(`\ud83c\udfaf Billing generation complete: ${results.length} records created`);
  
  return {
    window,
    generatedCount: results.length,
    results
  };
}

/**
 * Generate billing for August 16-31 specifically
 */
export async function generateAugust16To31(year: number = 2024) {
  const startDate = `${year}-08-16`;
  const endDate = `${year}-08-31`;
  
  return await generateBillingForDateRange(startDate, endDate);
}
