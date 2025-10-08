import { DateTime } from "luxon";
import { getBillingWindowsForMonth, inclusionForMonth } from "./semimonthly";
import { upsertBillingRow, getActiveStaffForMonth } from "./repo"; 

export async function generateBillingForMonth(
  year: number,
  month: number,
  zone = "America/Los_Angeles"
) {
  const now = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const [w1, w2] = getBillingWindowsForMonth(year, month, zone);

  // Pull staff with hire/termination, property/room, and rent info
  const staff = await getActiveStaffForMonth(year, month);

  for (const s of staff) {
    // Use hire_date and termination_date from external_staff for billing logic
    // If external_staff fields are available, use them; otherwise fall back to assignment dates
    const hireDate = s.hire_date || s.start_date;
    const terminationDate = s.termination_date || s.end_date;
    
    const include = inclusionForMonth(now, hireDate, terminationDate);
    if (include.firstWindow) {
      await upsertBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        rent_amount: s.rent_amount / 2, // Convert monthly to biweekly
        payment_status: "unpaid",
        period_start: w1.start.toISODate()!,
        period_end: w1.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
      });
    }
    if (include.secondWindow) {
      await upsertBillingRow({
        tenant_id: s.tenant_id,
        property_id: s.property_id,
        room_id: s.room_id,
        rent_amount: s.rent_amount / 2, // Convert monthly to biweekly
        payment_status: "unpaid",
        period_start: w2.start.toISODate()!,
        period_end: w2.end.toISODate()!,
        start_date: s.start_date,
        end_date: s.end_date,
      });
    }
  }
}
