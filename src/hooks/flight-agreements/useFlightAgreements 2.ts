import { useState, useEffect } from 'react';
import { 
  FlightAgreementSummary, 
  FlightAgreementDeduction,
  CreateFlightAgreementData,
  CreateDeductionData,
  getFlightAgreements,
  getFlightAgreementById,
  getFlightAgreementsByStaffId,
  createFlightAgreement,
  updateFlightAgreement,
  deleteFlightAgreement,
  getFlightAgreementDeductions,
  createFlightAgreementDeductions,
  updateDeductionStatus,
  cancelFlightAgreement
} from '@/integration/supabase/api/flight-agreements';

export interface UseFlightAgreementsReturn {
  agreements: FlightAgreementSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAgreement: (data: CreateFlightAgreementData, deductions: CreateDeductionData[]) => Promise<void>;
  updateAgreement: (id: string, updates: Partial<FlightAgreementSummary>) => Promise<void>;
  deleteAgreement: (id: string) => Promise<void>;
  cancelAgreement: (id: string, reason?: string) => Promise<void>;
}

export interface UseFlightAgreementReturn {
  agreement: FlightAgreementSummary | null;
  deductions: FlightAgreementDeduction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateDeduction: (deductionId: string, status: string, actualAmount?: number, payrollRef?: string, failureReason?: string, notes?: string) => Promise<void>;
}

/**
 * Hook for managing multiple flight agreements
 */
export const useFlightAgreements = (): UseFlightAgreementsReturn => {
  const [agreements, setAgreements] = useState<FlightAgreementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFlightAgreements();
      setAgreements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flight agreements');
      console.error('Error fetching flight agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAgreement = async (agreementData: CreateFlightAgreementData, deductionsData: CreateDeductionData[]) => {
    try {
      setError(null);
      
      // Create the agreement first
      const newAgreement = await createFlightAgreement(agreementData);
      
      // Create the deductions with the agreement ID
      const deductionsWithAgreementId = deductionsData.map(deduction => ({
        ...deduction,
        agreement_id: newAgreement.id
      }));
      
      await createFlightAgreementDeductions(deductionsWithAgreementId);
      
      // Refresh the list
      await fetchAgreements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flight agreement');
      throw err;
    }
  };

  const updateAgreement = async (id: string, updates: Partial<FlightAgreementSummary>) => {
    try {
      setError(null);
      await updateFlightAgreement(id, updates);
      await fetchAgreements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flight agreement');
      throw err;
    }
  };

  const deleteAgreement = async (id: string) => {
    try {
      setError(null);
      await deleteFlightAgreement(id);
      await fetchAgreements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flight agreement');
      throw err;
    }
  };

  const cancelAgreement = async (id: string, reason?: string) => {
    try {
      setError(null);
      await cancelFlightAgreement(id, reason);
      await fetchAgreements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel flight agreement');
      throw err;
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  return {
    agreements,
    loading,
    error,
    refetch: fetchAgreements,
    createAgreement,
    updateAgreement,
    deleteAgreement,
    cancelAgreement
  };
};

/**
 * Hook for managing a single flight agreement and its deductions
 */
export const useFlightAgreement = (agreementId: string | null): UseFlightAgreementReturn => {
  const [agreement, setAgreement] = useState<FlightAgreementSummary | null>(null);
  const [deductions, setDeductions] = useState<FlightAgreementDeduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreementData = async () => {
    if (!agreementId) {
      setAgreement(null);
      setDeductions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [agreementData, deductionsData] = await Promise.all([
        getFlightAgreementById(agreementId),
        getFlightAgreementDeductions(agreementId)
      ]);
      
      setAgreement(agreementData as FlightAgreementSummary);
      setDeductions(deductionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flight agreement data');
      console.error('Error fetching flight agreement data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDeduction = async (
    deductionId: string, 
    status: string, 
    actualAmount?: number, 
    payrollRef?: string, 
    failureReason?: string, 
    notes?: string
  ) => {
    try {
      setError(null);
      await updateDeductionStatus(
        deductionId, 
        status as any, 
        actualAmount, 
        payrollRef, 
        failureReason, 
        notes
      );
      await fetchAgreementData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deduction');
      throw err;
    }
  };

  useEffect(() => {
    fetchAgreementData();
  }, [agreementId]);

  return {
    agreement,
    deductions,
    loading,
    error,
    refetch: fetchAgreementData,
    updateDeduction
  };
};

/**
 * Hook for getting flight agreements by staff ID
 */
export const useStaffFlightAgreements = (staffId: string | null) => {
  const [agreements, setAgreements] = useState<FlightAgreementSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffAgreements = async () => {
    if (!staffId) {
      setAgreements([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getFlightAgreementsByStaffId(staffId);
      setAgreements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff flight agreements');
      console.error('Error fetching staff flight agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAgreements();
  }, [staffId]);

  return {
    agreements,
    loading,
    error,
    refetch: fetchStaffAgreements
  };
};
