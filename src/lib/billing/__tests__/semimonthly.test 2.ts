import { DateTime } from "luxon";
import { describe, it, expect } from "vitest";
import { getBillingWindowsForMonth, inclusionForMonth, overlapsEmploymentWindow } from "../semimonthly";

describe("Semi-monthly billing logic", () => {
  const zone = "America/Los_Angeles";

  describe("getBillingWindowsForMonth", () => {
    it("should return correct billing windows for August 2025", () => {
      const [w1, w2] = getBillingWindowsForMonth(2025, 8, zone);
      
      expect(w1.start.toISODate()).toBe("2025-08-01");
      expect(w1.end.toISODate()).toBe("2025-08-15");
      expect(w2.start.toISODate()).toBe("2025-08-16");
      expect(w2.end.toISODate()).toBe("2025-08-31");
    });
  });

  describe("inclusionForMonth - Acceptance Tests", () => {
    const now = DateTime.fromObject({ year: 2025, month: 8, day: 1 }, { zone });

    it("Hire 2025-08-05, terminate 2025-08-10 => included in Aug window-1, not window-2", () => {
      const result = inclusionForMonth(now, "2025-08-05", "2025-08-10");
      expect(result.firstWindow).toBe(true);
      expect(result.secondWindow).toBe(false);
    });

    it("Hire 2025-08-20, no termination => included in Aug window-2 only", () => {
      const result = inclusionForMonth(now, "2025-08-20", null);
      expect(result.firstWindow).toBe(false);
      expect(result.secondWindow).toBe(true);
    });

    it("Hire 2025-09-01, billing month Aug => not included either window", () => {
      const result = inclusionForMonth(now, "2025-09-01", null);
      expect(result.firstWindow).toBe(false);
      expect(result.secondWindow).toBe(false);
    });

    it("Hire 2025-07-01, terminate 2025-08-14 => included Aug window-1, not window-2", () => {
      const result = inclusionForMonth(now, "2025-07-01", "2025-08-14");
      expect(result.firstWindow).toBe(true);
      expect(result.secondWindow).toBe(false);
    });

    it("Hire 2025-07-01, terminate 2025-08-16 => included Aug window-2 (overlaps 16th)", () => {
      const result = inclusionForMonth(now, "2025-07-01", "2025-08-16");
      expect(result.firstWindow).toBe(true);
      expect(result.secondWindow).toBe(true);
    });

    it("Hire 2025-08-01, no termination => included in both windows", () => {
      const result = inclusionForMonth(now, "2025-08-01", null);
      expect(result.firstWindow).toBe(true);
      expect(result.secondWindow).toBe(true);
    });

    it("Hire 2025-08-15, terminate 2025-08-15 => included in window-1 only", () => {
      const result = inclusionForMonth(now, "2025-08-15", "2025-08-15");
      expect(result.firstWindow).toBe(true);
      expect(result.secondWindow).toBe(false);
    });
  });
});
