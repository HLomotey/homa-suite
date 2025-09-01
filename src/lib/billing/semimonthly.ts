import { DateTime, Interval } from "luxon";

export type BillingWindow = { start: DateTime; end: DateTime }; // inclusive dates
export type InclusionResult = { firstWindow: boolean; secondWindow: boolean };

/** Returns the two billing windows for the given month in the provided zone. */
export function getBillingWindowsForMonth(
  year: number,
  month: number,
  zone = "America/Los_Angeles"
): [BillingWindow, BillingWindow] {
  const startOfMonth = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const mid = startOfMonth.set({ day: 15 });
  const secondStart = startOfMonth.set({ day: 16 });
  const endOfMonth = startOfMonth.endOf("month").startOf("day");

  return [
    { start: startOfMonth, end: mid },               // 1–15 inclusive
    { start: secondStart, end: endOfMonth },         // 16–EOM inclusive
  ];
}

/** True if employment overlaps the window on any day (inclusive). */
export function overlapsEmploymentWindow(
  hireISO: string,                 // 'YYYY-MM-DD' or ISO
  terminationISO: string | null,   // null if still employed
  win: BillingWindow
): boolean {
  const hire = DateTime.fromISO(hireISO).startOf("day");
  const term = terminationISO ? DateTime.fromISO(terminationISO).startOf("day") : null;

  // Window interval (inclusive days)
  const wi = Interval.fromDateTimes(win.start.startOf("day"), win.end.endOf("day"));

  // Employment interval: [hire .. term] (or open-ended)
  const empStart = hire.startOf("day");
  const empEnd = term ? term.endOf("day") : DateTime.fromMillis(Number.MAX_SAFE_INTEGER);

  const ei = Interval.fromDateTimes(empStart, empEnd);
  return wi.overlaps(ei);
}

/**
 * For the "current" month, include rules:
 * - Include if startDate is on/before the last day of the month.
 * - Include for a window if there is any overlap with employment in that window.
 * This inherently covers:
 *   - Terminated before the 15th -> included in window 1 if they overlapped days 1–15.
 *   - Terminated on/before EOM -> included in window 2 if they overlapped days 16–EOM.
 */
export function inclusionForMonth(
  monthStart: DateTime,
  startDate: string | null,
  endDate: string | null
): { firstWindow: boolean; secondWindow: boolean } {
  const zone = monthStart.zoneName || "America/Los_Angeles";
  const [_w1, _w2] = getBillingWindowsForMonth(monthStart.year, monthStart.month, zone);
  const endOfMonth = _w2.end;

  // Guard: start date must be provided and in or before this month
  if (!startDate) return { firstWindow: false, secondWindow: false };
  
  const start = DateTime.fromISO(startDate).startOf("day");
  if (start > endOfMonth) return { firstWindow: false, secondWindow: false };

  const firstWindow = overlapsEmploymentWindow(startDate, endDate, _w1);
  const secondWindow = overlapsEmploymentWindow(startDate, endDate, _w2);

  return { firstWindow, secondWindow };
}
