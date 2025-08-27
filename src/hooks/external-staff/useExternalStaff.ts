// hooks/external-staff/useExternalStaff.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";

/**
 * Robust, paginated fetch for ALL external_staff rows.
 * - Works around PostgREST page-size limits by looping .range()
 * - Retries transient failures
 * - Optional AbortController support
 */

const TABLE_NAME = "external_staff"; // <-- adjust if your table name differs
const PAGE_SIZE = 1000;              // safe chunk size; tune if needed
const MAX_RETRIES = 3;

type UseExternalStaffReturn = {
  externalStaff: FrontendExternalStaff[];
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  /** Kept for API compatibility with your current code */
  fetchAllExternalStaff: () => Promise<void>;
  setStatus: (status: string | null) => void;
  status: string | null;
};

async function fetchAllRowsPaginated(
  status: string | null,
  signal?: AbortSignal
): Promise<FrontendExternalStaff[]> {
  // First call just to get total count
  let { data: head, count, error } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: false }) // not a HEAD: we want first page as well
    .order("id", { ascending: true })
    .range(0, PAGE_SIZE - 1);

  if (error) throw error;

  let rows: FrontendExternalStaff[] = head ?? [];
  const total = typeof count === "number" ? count : rows.length;

  // Early return if we already got everything in the first page
  if (rows.length >= total) {
    // Optional status filtering (client-side) to ensure we truly show "all" by default.
    return rows;
  }

  // Loop additional pages
  const pages = Math.ceil(total / PAGE_SIZE);
  for (let page = 1; page < pages; page++) {
    const from = page * PAGE_SIZE;
    const to = Math.min((page + 1) * PAGE_SIZE - 1, total - 1);

    let attempt = 0;
    // basic retry for transient network hiccups
    while (true) {
      try {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const { data, error: pageErr } = await supabase
          .from(TABLE_NAME)
          .select("*")
          .order("id", { ascending: true })
          .range(from, to);

        if (pageErr) throw pageErr;
        if (data && data.length) rows = rows.concat(data as FrontendExternalStaff[]);
        break;
      } catch (e) {
        attempt++;
        if (attempt >= MAX_RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }

  // If you truly want **all staff regardless of status**, do not filter here.
  // If you want to optionally filter by status, do it client-side:
  if (status) {
    const s = status.toLowerCase();
    rows = rows.filter((r: any) => (r.status || "").toLowerCase() === s);
  }

  return rows;
}

export function useExternalStaff(): UseExternalStaffReturn {
  const [externalStaff, setExternalStaff] = useState<FrontendExternalStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    // cancel previous in-flight
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const all = await fetchAllRowsPaginated(status, abortRef.current.signal);
      setExternalStaff(all);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("fetchAllExternalStaff error:", e);
        setErr(e?.message ?? "Failed to load external staff");
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Expose same API name your component expects
  const fetchAllExternalStaff = useMemo(() => load, [load]);

  // convenience alias
  const refreshAll = useMemo(() => load, [load]);

  // You can auto-load on mount, or let the caller call .fetchAllExternalStaff()
  useEffect(() => {
    // do nothing here by default; caller chooses when to load
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    externalStaff,
    loading,
    error: err,
    refreshAll,
    fetchAllExternalStaff,
    setStatus,
    status,
  };
}
