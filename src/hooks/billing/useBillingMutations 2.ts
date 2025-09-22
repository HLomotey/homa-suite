import { useState } from 'react';
import { supabase } from '@/integration/supabase/client';
import { BillingRow, PaymentStatus } from '@/types/billing';
import { toast } from 'sonner';

export function useBillingMutations() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateBillingRecord = async (
    id: string,
    updates: {
      rentAmount?: number;
      paymentStatus?: PaymentStatus;
    }
  ) => {
    setIsUpdating(true);
    try {
      const { error } = await (supabase
        .from('billing') as any)
        .update({
          ...(updates.rentAmount !== undefined && { rent_amount: updates.rentAmount }),
          ...(updates.paymentStatus !== undefined && { payment_status: updates.paymentStatus }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Billing record updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating billing record:', error);
      toast.error('Failed to update billing record');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBillingRecord = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await (supabase
        .from('billing') as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Billing record deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting billing record:', error);
      toast.error('Failed to delete billing record');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };


  return {
    updateBillingRecord,
    deleteBillingRecord,
    isUpdating,
    isDeleting
  };
}
