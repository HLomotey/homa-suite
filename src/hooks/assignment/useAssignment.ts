import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integration/supabase';
import { FrontendAssignment } from '@/integration/supabase/types';

// Map a database row to FrontendAssignment shape
function mapRowToFrontend(row: any): FrontendAssignment {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? null,
    tenantName: row.tenant_name ?? null,
    propertyId: row.property_id ?? '',
    propertyName: row.property_name ?? '',
    roomId: row.room_id ?? '',
    roomName: row.room_name ?? '',
    staffId: row.staff_id ?? '',
    staffName: row.staff_name ?? '',
    status: row.status ?? 'Pending',
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? null,
    rentAmount: row.rent_amount ?? 0,
    rentDepositAmount: row.rent_deposit_amount ?? null,
    transportAmount: row.transport_amount ?? null,
    busCardAmount: row.bus_card_amount ?? null,
    housingAgreement: row.housing_agreement ?? false,
    transportationAgreement: row.transportation_agreement ?? false,
    busCardAgreement: row.bus_card_agreement ?? false,
    flightAgreement: row.flight_agreement ?? false,
    agreements: {
      housing: row.housing_agreement ?? false,
      transportation: row.transportation_agreement ?? false,
      flight_agreement: row.flight_agreement ?? false,
      bus_card: row.bus_card_agreement ?? false,
    },
  } as FrontendAssignment;
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<FrontendAssignment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await (supabase.from('assignments') as any)
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      const mapped = (data ?? []).map(mapRowToFrontend);
      setAssignments(mapped);
    } catch (err: any) {
      setError(err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, loading, error, refetch: fetchAssignments };
}

export function useAssignmentsByStaff(staffId: string) {
  const { assignments, loading, error, refetch } = useAssignments();
  const filtered = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter((a) => a.tenantId === staffId);
  }, [assignments, staffId]);

  return { assignments: filtered, loading, error, refetch };
}

export function useCreateAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (payload: Omit<FrontendAssignment, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const dbRow = {
        tenant_id: payload.tenantId || null,
        tenant_name: payload.tenantName || null,
        property_id: payload.propertyId || null,
        property_name: payload.propertyName || null,
        room_id: payload.roomId || null,
        room_name: payload.roomName || null,
        staff_id: payload.staffId || null,
        staff_name: payload.staffName || null,
        status: payload.status || 'Pending',
        start_date: payload.startDate && payload.startDate.trim() !== '' ? payload.startDate : null,
        end_date: payload.endDate && payload.endDate.trim() !== '' ? payload.endDate : null,
        rent_amount: payload.rentAmount || 0,
        rent_deposit_amount: payload.rentDepositAmount || null,
        transport_amount: payload.transportAmount || null,
        bus_card_amount: payload.busCardAmount || null,
        housing_agreement: payload.housingAgreement ?? payload.agreements?.housing ?? false,
        transportation_agreement: payload.transportationAgreement ?? payload.agreements?.transportation ?? false,
        flight_agreement: payload.flightAgreement ?? payload.agreements?.flight_agreement ?? false,
        bus_card_agreement: payload.busCardAgreement ?? payload.agreements?.bus_card ?? false,
      };

      const { error } = await (supabase.from('assignments') as any)
        .insert(dbRow);
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useUpdateAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (id: string, payload: Omit<FrontendAssignment, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const dbRow = {
        tenant_id: payload.tenantId || null,
        tenant_name: payload.tenantName || null,
        property_id: payload.propertyId || null,
        property_name: payload.propertyName || null,
        room_id: payload.roomId || null,
        room_name: payload.roomName || null,
        staff_id: payload.staffId || null,
        staff_name: payload.staffName || null,
        status: payload.status || 'Pending',
        start_date: payload.startDate && payload.startDate.trim() !== '' ? payload.startDate : null,
        end_date: payload.endDate && payload.endDate.trim() !== '' ? payload.endDate : null,
        rent_amount: payload.rentAmount || 0,
        rent_deposit_amount: payload.rentDepositAmount || null,
        transport_amount: payload.transportAmount || null,
        bus_card_amount: payload.busCardAmount || null,
        housing_agreement: payload.housingAgreement ?? payload.agreements?.housing ?? false,
        transportation_agreement: payload.transportationAgreement ?? payload.agreements?.transportation ?? false,
        flight_agreement: payload.flightAgreement ?? payload.agreements?.flight_agreement ?? false,
        bus_card_agreement: payload.busCardAgreement ?? payload.agreements?.bus_card ?? false,
      };

      const { error } = await (supabase.from('assignments') as any)
        .update(dbRow)
        .eq('id', id);
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

export function useDeleteAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAssignment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await (supabase.from('assignments') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteAssignment, loading, error };
}
