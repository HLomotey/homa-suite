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
  // Use a far future date instead of MAX_SAFE_INTEGER which creates invalid intervals
  const empEnd = term ? term.endOf("day") : DateTime.fromObject({ year: 9999, month: 12, day: 31 });

  const ei = Interval.fromDateTimes(empStart, empEnd);
  const overlaps = wi.overlaps(ei);
  
  // Safe logging - avoid calling toISODate() on invalid dates
  const empStartStr = ei.start ? (ei.start.toISODate() || 'invalid') : 'null';
  const empEndStr = term ? (ei.end ? (ei.end.toISODate() || 'invalid') : 'null') : 'ongoing';
  
  console.log('🔍 overlapsEmploymentWindow:', {
    window: `${win.start.toISODate()} to ${win.end.toISODate()}`,
    hire: hire.toISODate() || 'invalid',
    term: term?.toISODate() || 'ongoing',
    windowInterval: `${wi.start ? (wi.start.toISODate() || 'invalid') : 'null'} to ${wi.end ? (wi.end.toISODate() || 'invalid') : 'null'}`,
    employmentInterval: `${empStartStr} to ${empEndStr}`,
    overlaps,
    hireIsValid: hire.isValid,
    termIsValid: term?.isValid ?? true,
    intervalIsValid: ei.isValid
  });
  
  return overlaps;
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
  const startOfMonth = _w1.start;
  const endOfMonth = _w2.end;

  // Guard: start date must be provided
  if (!startDate) {
    console.log('⚠️ inclusionForMonth: No startDate provided');
    return { firstWindow: false, secondWindow: false };
  }
  
  const start = DateTime.fromISO(startDate).startOf("day");
  const end = endDate ? DateTime.fromISO(endDate).startOf("day") : null;
  
  console.log('🔍 inclusionForMonth details:', {
    startDate,
    endDate,
    parsedStart: start.toISODate(),
    parsedEnd: end?.toISODate(),
    startOfMonth: startOfMonth.toISODate(),
    endOfMonth: endOfMonth.toISODate(),
    startIsValid: start.isValid,
    endIsValid: end?.isValid ?? true
  });
  
  // Only exclude if they start AFTER this billing month (future hires)
  if (start > endOfMonth) {
    console.log(`⚠️ Excluded: start ${start.toISODate()} > endOfMonth ${endOfMonth.toISODate()}`);
    return { firstWindow: false, secondWindow: false };
  }
  
  // Only exclude if they terminated BEFORE this billing month
  if (end && end < startOfMonth) {
    console.log(`⚠️ Excluded: end ${end.toISODate()} < startOfMonth ${startOfMonth.toISODate()}`);
    return { firstWindow: false, secondWindow: false };
  }

  const firstWindow = overlapsEmploymentWindow(startDate, endDate, _w1);
  const secondWindow = overlapsEmploymentWindow(startDate, endDate, _w2);

  console.log('✅ Window overlap results:', { firstWindow, secondWindow });

  return { firstWindow, secondWindow };
}
