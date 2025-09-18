import { useState, useEffect } from "react";
import { BillingRow, PaymentStatus } from "@/types/billing";
import { supabase } from "@/integration/supabase/client";

interface UseBillingLogsParams {
  staffId?: string;
}

export function useBillingLogs({ staffId }: UseBillingLogsParams = {}) {
  const [data, setData] = useState<BillingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBillingLogs = async () => {
      try {
        setIsLoading(true);
        
        // Query billing table with external_staff, properties, and rooms data
        let query = supabase
          .from('billing')
          .select(`
            id,
            tenant_id,
            property_id,
            room_id,
            rent_amount,
            payment_status,
            period_start,
            period_end,
            start_date,
            end_date,
            created_at,
            updated_at,
            external_staff!inner (
              "PAYROLL FIRST NAME",
              "PAYROLL LAST NAME"
            ),
            properties!inner (
              title
            ),
            rooms!inner (
              name
            )
          `)
          .order('period_start', { ascending: false });

        // Filter by specific tenant if provided
        if (staffId && staffId !== "all") {
          query = query.eq('tenant_id', staffId);
        }

        const { data: billingData, error: billingError } = await query;

        if (billingError) {
          throw billingError;
        }

        // Get unique tenant IDs to fetch their assignment statuses
        const tenantIds = [...new Set((billingData || []).map((b: any) => b.tenant_id).filter(Boolean))];
        
        // Fetch assignment statuses for all tenants
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('tenant_id, status, property_id, room_id, start_date, end_date')
          .in('tenant_id', tenantIds)
          .order('start_date', { ascending: false });

        if (assignmentsError) {
          console.warn('Error fetching assignments:', assignmentsError);
        }

        // Create a map of tenant assignments for quick lookup
        const assignmentMap = new Map<string, { status: string; endDate: string | null }>();
        (assignmentsData || []).forEach((assignment: any) => {
          const key = `${assignment.tenant_id}-${assignment.property_id}-${assignment.room_id}`;
          if (!assignmentMap.has(key)) {
            assignmentMap.set(key, {
              status: assignment.status,
              endDate: assignment.end_date
            });
          }
        });

        // Transform data to BillingRow format
        const transformedData: BillingRow[] = (billingData || []).map((billing: any) => {
          const externalStaff = billing.external_staff;
          const firstName = externalStaff["PAYROLL FIRST NAME"] || "";
          const lastName = externalStaff["PAYROLL LAST NAME"] || "";
          const tenantName = `${firstName} ${lastName}`.trim();
          
          const propertyName = billing.properties?.title || "Unknown Property";
          const roomName = billing.rooms?.name || "Unknown Room";
          
          // Get assignment status and end date from the assignment map
          const assignmentKey = `${billing.tenant_id}-${billing.property_id}-${billing.room_id}`;
          const assignmentData = assignmentMap.get(assignmentKey);
          const assignmentStatus = assignmentData?.status || "Unknown";
          const assignmentEndDate = assignmentData?.endDate || null;

          return {
            id: billing.id,
            tenantId: billing.tenant_id,
            tenantName,
            propertyId: billing.property_id,
            propertyName,
            roomId: billing.room_id,
            roomName,
            rentAmount: billing.rent_amount,
            paymentStatus: billing.payment_status as PaymentStatus,
            periodStart: billing.period_start,
            periodEnd: billing.period_end,
            assignmentStatus,
            assignmentEndDate
          };
        });
        
        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching billing logs:', err);
        setError(err as Error);
        setData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingLogs();
  }, [staffId]);

  return { data, isLoading, error };
}

export function useStaffWithBillingLogs() {
  const [data, setData] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStaffWithBillingLogs = async () => {
      try {
        setIsLoading(true);
        
        // Query distinct tenants who have billing records
        const { data: billingData, error: billingError } = await supabase
          .from('billing')
          .select(`
            tenant_id,
            external_staff!inner (
              "PAYROLL FIRST NAME",
              "PAYROLL LAST NAME"
            )
          `)
          .order('tenant_id');

        if (billingError) {
          throw billingError;
        }

        // Transform to unique staff list
        const uniqueStaff = new Map();
        (billingData || []).forEach((billing: any) => {
          const externalStaff = billing.external_staff;
          const firstName = externalStaff["PAYROLL FIRST NAME"] || "";
          const lastName = externalStaff["PAYROLL LAST NAME"] || "";
          const name = `${firstName} ${lastName}`.trim();
          
          if (!uniqueStaff.has(billing.tenant_id)) {
            uniqueStaff.set(billing.tenant_id, {
              id: billing.tenant_id,
              name
            });
          }
        });

        setData(Array.from(uniqueStaff.values()));
        setError(null);
      } catch (err) {
        console.error('Error fetching staff with billing logs:', err);
        setError(err as Error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffWithBillingLogs();
  }, []);

  return { data, isLoading, error };
}
