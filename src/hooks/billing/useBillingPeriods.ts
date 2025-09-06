import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { toast } from 'sonner';

export interface BillingPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useBillingPeriods = () => {
  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingPeriods = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('billing_periods')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        throw error;
      }

      setBillingPeriods(data || []);
    } catch (err: any) {
      console.error('Error fetching billing periods:', err);
      setError(err.message || 'Failed to fetch billing periods');
      toast.error('Failed to fetch billing periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingPeriods();
  }, []);

  return {
    billingPeriods,
    loading,
    error,
    refetch: fetchBillingPeriods,
  };
};
